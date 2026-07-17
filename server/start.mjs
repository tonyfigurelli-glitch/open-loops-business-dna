import { createServer } from "node:http";
import { CalibrationDatabase } from "./database.mjs";
import { TokenAuthService } from "./auth.mjs";
import { createApi } from "./api.mjs";
import { loadCalibrationDomain } from "./loadDomain.mjs";
import { CalibrationGenerationService } from "./generationService.mjs";
import { ConfiguredHttpCalibrationModelProvider, OpenAIResponsesCalibrationModelProvider } from "./modelProvider.mjs";
import { assertAuthenticationAdapter } from "./auth.mjs";
import { readServerConfig } from "./config.mjs";
import { createSafeLogger, normalizedRequestPath } from "./logger.mjs";

const config = readServerConfig();
const { port } = config;
if (config.production) {
  throw new Error("A production identity adapter must be selected and installed before launch.");
}

const domain = await loadCalibrationDomain();
const provider = config.modelProviderUrl
  ? config.modelProviderType === "openai_responses"
    ? new OpenAIResponsesCalibrationModelProvider({
        endpoint: config.modelProviderUrl,
        apiKey: config.modelProviderApiKey,
        modelIdentifier: config.modelIdentifier,
      })
    : new ConfiguredHttpCalibrationModelProvider({
      endpoint: config.modelProviderUrl,
      apiKey: config.modelProviderApiKey,
      modelIdentifier: config.modelIdentifier,
      providerName: config.modelProviderName,
      })
  : new domain.pipeline.UnavailableCalibrationModelProvider();
const database = new CalibrationDatabase(config.databasePath);
const auth = assertAuthenticationAdapter(new TokenAuthService(config.sessionSecret));
const generationService = new CalibrationGenerationService({
  canonical: domain.canonical,
  pipeline: domain.pipeline,
  generator: domain.generator,
  provider,
});
const api = createApi({ database, auth, generationService, canonical: domain.canonical, allowDevelopmentAuth: config.allowDevelopmentAuth });
const logger = createSafeLogger();

createServer(async (incoming, outgoing) => {
  const started = Date.now();
  const chunks = [];
  for await (const chunk of incoming) chunks.push(chunk);
  const request = new Request(`http://${incoming.headers.host ?? `127.0.0.1:${port}`}${incoming.url}`, {
    method: incoming.method,
    headers: incoming.headers,
    body: ["GET", "HEAD"].includes(incoming.method ?? "GET") ? undefined : Buffer.concat(chunks),
  });
  const response = await api(request);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
  logger.event("http_request", {
    method: incoming.method,
    path: normalizedRequestPath(new URL(request.url).pathname),
    status: response.status,
    durationMs: Date.now() - started,
  });
}).listen(port, "127.0.0.1", () => {
  logger.event("server_started", { host: "127.0.0.1", port });
});
