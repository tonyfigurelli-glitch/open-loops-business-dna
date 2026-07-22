import { createServer } from "node:http";
import { CalibrationDatabase } from "./database.mjs";
import { TokenAuthService, TrustedProxyAuthService } from "./auth.mjs";
import { createApi } from "./api.mjs";
import { loadCalibrationDomain } from "./loadDomain.mjs";
import { CalibrationGenerationService } from "./generationService.mjs";
import { ConfiguredHttpCalibrationModelProvider, OpenAIResponsesCalibrationModelProvider } from "./modelProvider.mjs";
import { assertAuthenticationAdapter } from "./auth.mjs";
import { readServerConfig } from "./config.mjs";
import { createSafeLogger, normalizedRequestPath } from "./logger.mjs";
import { createApplicationHandler } from "./applicationHandler.mjs";

const config = readServerConfig();
const { host, port } = config;
const logger = createSafeLogger();

const domain = await loadCalibrationDomain();
const provider = config.modelProviderUrl
  ? config.modelProviderType === "openai_responses"
    ? new OpenAIResponsesCalibrationModelProvider({
        endpoint: config.modelProviderUrl,
        apiKey: config.modelProviderApiKey,
        modelIdentifier: config.modelIdentifier,
        timeoutMs: config.modelProviderTimeoutMs,
      })
    : new ConfiguredHttpCalibrationModelProvider({
      endpoint: config.modelProviderUrl,
      apiKey: config.modelProviderApiKey,
      modelIdentifier: config.modelIdentifier,
      providerName: config.modelProviderName,
      timeoutMs: config.modelProviderTimeoutMs,
      })
  : new domain.pipeline.UnavailableCalibrationModelProvider();
const database = new CalibrationDatabase(config.databasePath);
const auth = assertAuthenticationAdapter(config.production
  ? new TrustedProxyAuthService({
      secret: config.trustedProxySecret,
      userHeader: config.trustedUserHeader,
    })
  : new TokenAuthService(config.sessionSecret));
const generationService = new CalibrationGenerationService({
  canonical: domain.canonical,
  pipeline: domain.pipeline,
  generator: domain.generator,
  provider,
  diagnostics: (metadata) => logger.event("calibration_generation", metadata),
});
const api = createApi({
  database,
  auth,
  generationService,
  canonical: domain.canonical,
  allowDevelopmentAuth: config.allowDevelopmentAuth,
  diagnostics: (metadata) => logger.event("api_error", metadata),
});
const application = createApplicationHandler({ api, staticRoot: config.staticRoot });
createServer(async (incoming, outgoing) => {
  const started = Date.now();
  const chunks = [];
  for await (const chunk of incoming) chunks.push(chunk);
  const request = new Request(`http://${incoming.headers.host ?? `127.0.0.1:${port}`}${incoming.url}`, {
    method: incoming.method,
    headers: incoming.headers,
    body: ["GET", "HEAD"].includes(incoming.method ?? "GET") ? undefined : Buffer.concat(chunks),
  });
  const response = await application(request);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
  logger.event("http_request", {
    method: incoming.method,
    path: normalizedRequestPath(new URL(request.url).pathname),
    status: response.status,
    durationMs: Date.now() - started,
  });
}).listen(port, host, () => {
  logger.event("server_started", { host, port });
});
