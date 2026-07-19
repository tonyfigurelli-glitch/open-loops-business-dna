export const DEFAULT_MODEL_PROVIDER_TIMEOUT_MS = 180_000;

export class ModelProviderTimeoutError extends Error {
  constructor() {
    super("Model provider timed out.");
    this.name = "ModelProviderTimeoutError";
  }
}

export class ConfiguredHttpCalibrationModelProvider {
  constructor({
    endpoint, apiKey, modelIdentifier, providerName = "configured_http", fetchImpl = fetch,
    timeoutMs = DEFAULT_MODEL_PROVIDER_TIMEOUT_MS,
  }) {
    if (!endpoint || !apiKey || !modelIdentifier) {
      throw new Error("The server-side model provider is not fully configured.");
    }
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.modelIdentifier = modelIdentifier;
    this.providerName = providerName;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async generate(request) {
    const response = await fetchWithSafeTimeout(this.fetchImpl, this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelIdentifier,
        instructions: request.systemInstructions,
        input: request.evidencePackage,
        response_format: { type: "json_schema", schema: request.structuredOutputSchema },
        temperature: request.modelConfiguration.temperature,
        max_output_tokens: request.modelConfiguration.maxOutputTokens,
        correction_errors: request.correctionErrors,
      }),
    }, this.timeoutMs);
    if (!response.ok) throw new Error(`Model provider request failed with status ${response.status}.`);
    const payload = await response.json();
    const structuredResult = payload.structuredResult ?? payload.output ?? payload.result;
    if (!structuredResult) throw new Error("Model provider returned no structured result.");
    return {
      structuredResult,
      provider: payload.provider ?? this.providerName,
      modelIdentifier: payload.modelIdentifier ?? this.modelIdentifier,
      generationTimestamp: payload.generationTimestamp ?? new Date().toISOString(),
      usage: payload.usage,
    };
  }
}

export class OpenAIResponsesCalibrationModelProvider {
  constructor({
    apiKey, modelIdentifier, endpoint = "https://api.openai.com/v1/responses", fetchImpl = fetch,
    timeoutMs = DEFAULT_MODEL_PROVIDER_TIMEOUT_MS,
  }) {
    if (!apiKey || !modelIdentifier) throw new Error("OpenAI provider credentials and model are required.");
    this.apiKey = apiKey;
    this.modelIdentifier = modelIdentifier;
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async generate(request) {
    const response = await fetchWithSafeTimeout(this.fetchImpl, this.endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: this.modelIdentifier,
        instructions: request.systemInstructions,
        input: JSON.stringify({
          evidencePackage: request.evidencePackage,
          correctionErrors: request.correctionErrors,
        }),
        text: { format: {
          type: "json_schema", name: "initial_business_owner_model",
          description: "Evidence-constrained Version 1.3 initial business owner model",
          schema: request.structuredOutputSchema, strict: true,
        } },
        max_output_tokens: request.modelConfiguration.maxOutputTokens,
        store: false,
      }),
    }, this.timeoutMs);
    if (!response.ok) throw new Error(`OpenAI Responses request failed with status ${response.status}.`);
    const payload = await response.json();
    const text = payload.output?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
    if (!text) throw new Error("OpenAI Responses returned no structured output.");
    let structuredResult;
    try { structuredResult = JSON.parse(text); }
    catch { throw new Error("OpenAI Responses returned invalid JSON."); }
    return {
      structuredResult, provider: "openai", modelIdentifier: payload.model ?? this.modelIdentifier,
      generationTimestamp: new Date().toISOString(), usage: payload.usage,
    };
  }
}

async function fetchWithSafeTimeout(fetchImpl, endpoint, init, timeoutMs) {
  try {
    return await fetchImpl(endpoint, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new ModelProviderTimeoutError();
    }
    throw error;
  }
}
