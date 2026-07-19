import { isAbsolute } from "node:path";
import { DEFAULT_MODEL_PROVIDER_TIMEOUT_MS } from "./modelProvider.mjs";

export function readServerConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const config = {
    production,
    port: Number(env.PORT ?? 8787),
    databasePath: env.OPEN_LOOPS_DATABASE_PATH,
    sessionSecret: env.OPEN_LOOPS_SESSION_SECRET,
    publicOrigin: env.OPEN_LOOPS_PUBLIC_ORIGIN,
    authMode: env.OPEN_LOOPS_AUTH_MODE ?? (production ? undefined : "development"),
    allowDevelopmentAuth: env.OPEN_LOOPS_ALLOW_DEVELOPMENT_AUTH === "true",
    modelProviderUrl: env.MODEL_PROVIDER_URL,
    modelProviderApiKey: env.MODEL_PROVIDER_API_KEY,
    modelIdentifier: env.MODEL_IDENTIFIER,
    modelProviderName: env.MODEL_PROVIDER_NAME,
    modelProviderType: env.MODEL_PROVIDER_TYPE ?? "configured_http",
    modelProviderTimeoutMs: env.MODEL_PROVIDER_TIMEOUT_MS === undefined
      ? DEFAULT_MODEL_PROVIDER_TIMEOUT_MS
      : Number(env.MODEL_PROVIDER_TIMEOUT_MS),
  };
  validateServerConfig(config);
  return config;
}

export function validateServerConfig(config) {
  if (!config.databasePath) throw new Error("OPEN_LOOPS_DATABASE_PATH is required.");
  if (!config.sessionSecret || config.sessionSecret.length < (config.production ? 32 : 16)) {
    throw new Error(`OPEN_LOOPS_SESSION_SECRET must contain at least ${config.production ? 32 : 16} characters.`);
  }
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  if (config.production) {
    if (config.allowDevelopmentAuth || config.authMode === "development") {
      throw new Error("Development authentication cannot run in production.");
    }
    if (config.authMode !== "external") {
      throw new Error("OPEN_LOOPS_AUTH_MODE=external is required after a production identity adapter is approved.");
    }
    if (!config.publicOrigin?.startsWith("https://")) {
      throw new Error("OPEN_LOOPS_PUBLIC_ORIGIN must be an HTTPS origin in production.");
    }
    if (!isAbsolute(config.databasePath)) {
      throw new Error("OPEN_LOOPS_DATABASE_PATH must be an absolute persistent path in production.");
    }
  }
  const modelValues = [config.modelProviderUrl, config.modelProviderApiKey, config.modelIdentifier];
  if (modelValues.some(Boolean) && !modelValues.every(Boolean)) {
    throw new Error("MODEL_PROVIDER_URL, MODEL_PROVIDER_API_KEY, and MODEL_IDENTIFIER must be configured together.");
  }
  if (!['configured_http', 'openai_responses'].includes(config.modelProviderType)) {
    throw new Error("MODEL_PROVIDER_TYPE must be configured_http or openai_responses.");
  }
  if (!Number.isInteger(config.modelProviderTimeoutMs) ||
      config.modelProviderTimeoutMs < 30_000 || config.modelProviderTimeoutMs > 600_000) {
    throw new Error("MODEL_PROVIDER_TIMEOUT_MS must be an integer from 30000 through 600000 milliseconds.");
  }
}
