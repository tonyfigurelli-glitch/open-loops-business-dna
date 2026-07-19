import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { assertAuthenticationAdapter, sessionCookie, TokenAuthService } from "./auth.mjs";
import { createApi } from "./api.mjs";
import { readServerConfig } from "./config.mjs";
import { CalibrationDatabase } from "./database.mjs";
import { compareCalibrationEvaluations, evaluationDimensions, storeCalibrationEvaluation } from "./evaluationHarness.mjs";
import { createSafeLogger } from "./logger.mjs";
import { ConfiguredHttpCalibrationModelProvider, OpenAIResponsesCalibrationModelProvider } from "./modelProvider.mjs";

const identity = {
  calibrationId: "small_business_owner_initial_calibration",
  semanticVersion: "1.3.0",
  frozenSourceHash: "419b3231ccf597ed27e9f489cff534c08d5700d65901ee9c028239a1fd0840e7",
};

function session(id = "pilot-session") {
  return {
    id, participantId: "ignored-client-id", ...identity,
    status: "collecting_answers", startedAt: "2026-07-17T12:00:00.000Z",
    lastUpdatedAt: "2026-07-17T12:00:00.000Z", currentQuestionIndex: 0,
    participantResponses: [], supportingEvidence: [], possibleDisconfirmingEvidence: [],
    evidenceReferences: [], unknowns: [], importantDirectQuotes: [],
    numericalFeedback: {}, openEndedFeedback: {},
  };
}

test("production authentication adapter contract and expiration are enforced", () => {
  assert.throws(() => assertAuthenticationAdapter({ authenticate() {} }), /must implement restore/);
  const auth = assertAuthenticationAdapter(new TokenAuthService("production-readiness-test-secret"));
  const originalNow = Date.now;
  try {
    Date.now = () => 1_000;
    const token = auth.issue("pilot-user");
    Date.now = () => 1_000 + 2_592_000_001;
    const request = new Request("https://pilot.example/api/auth/session", {
      headers: { cookie: `open_loops_session=${token}` },
    });
    assert.equal(auth.restore(request), null);
  } finally { Date.now = originalNow; }
});

test("production cookie and startup configuration fail closed", () => {
  assert.match(sessionCookie("opaque", true), /HttpOnly/);
  assert.match(sessionCookie("opaque", true), /SameSite=Strict/);
  assert.match(sessionCookie("opaque", true), /; Secure/);
  assert.throws(() => readServerConfig({ NODE_ENV: "production" }), /DATABASE_PATH/);
  assert.throws(() => readServerConfig({
    NODE_ENV: "production", OPEN_LOOPS_DATABASE_PATH: "/data/open-loops.sqlite",
    OPEN_LOOPS_SESSION_SECRET: "x".repeat(40), OPEN_LOOPS_PUBLIC_ORIGIN: "https://pilot.example",
    OPEN_LOOPS_AUTH_MODE: "development", OPEN_LOOPS_ALLOW_DEVELOPMENT_AUTH: "true",
  }), /Development authentication cannot run in production/);
  const valid = readServerConfig({
    NODE_ENV: "production", OPEN_LOOPS_DATABASE_PATH: "/data/open-loops.sqlite",
    OPEN_LOOPS_SESSION_SECRET: "x".repeat(40), OPEN_LOOPS_PUBLIC_ORIGIN: "https://pilot.example",
    OPEN_LOOPS_AUTH_MODE: "external",
  });
  assert.equal(valid.modelProviderTimeoutMs, 180_000);
  assert.equal(readServerConfig({
    OPEN_LOOPS_DATABASE_PATH: "development.sqlite",
    OPEN_LOOPS_SESSION_SECRET: "development-secret",
    MODEL_PROVIDER_TIMEOUT_MS: "240000",
  }).modelProviderTimeoutMs, 240_000);
  for (const invalid of ["", "not-a-number", "29999", "600001", "45000.5"]) {
    assert.throws(() => readServerConfig({
      OPEN_LOOPS_DATABASE_PATH: "development.sqlite",
      OPEN_LOOPS_SESSION_SECRET: "development-secret",
      MODEL_PROVIDER_TIMEOUT_MS: invalid,
    }), /MODEL_PROVIDER_TIMEOUT_MS/);
  }
});

test("development login is disabled and sign-out clears the session cookie", async () => {
  const auth = new TokenAuthService("production-readiness-test-secret");
  const api = createApi({
    database: {}, auth, generationService: {}, canonical: {}, allowDevelopmentAuth: false,
  });
  const login = await api(new Request("https://pilot.example/api/auth/development", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "pilot" }),
  }));
  assert.equal(login.status, 404);
  const signOut = await api(new Request("https://pilot.example/api/auth/sign-out", { method: "POST" }));
  assert.equal(signOut.status, 200);
  assert.match(signOut.headers.get("set-cookie"), /Max-Age=0/);
});

test("model provider configuration stays server-side and returns usage", async () => {
  let authorization;
  const provider = new ConfiguredHttpCalibrationModelProvider({
    endpoint: "https://provider.example/generate", apiKey: "server-secret",
    modelIdentifier: "pilot-model", providerName: "pilot-provider",
    fetchImpl: async (_url, init) => {
      authorization = init.headers.authorization;
      return new Response(JSON.stringify({ output: { valid: true }, usage: { input_tokens: 10, output_tokens: 5 } }));
    },
  });
  const response = await provider.generate({
    systemInstructions: "server-only", evidencePackage: {}, structuredOutputSchema: {},
    modelConfiguration: { temperature: 0.2, maxOutputTokens: 100 }, correctionErrors: [],
  });
  assert.equal(authorization, "Bearer server-secret");
  assert.deepEqual(response.usage, { input_tokens: 10, output_tokens: 5 });
  assert.doesNotMatch(JSON.stringify(response), /server-secret|server-only/);
});

test("OpenAI Responses adapter requests strict non-stored structured output", async () => {
  let body;
  const provider = new OpenAIResponsesCalibrationModelProvider({
    apiKey: "server-secret", modelIdentifier: "gpt-pilot",
    fetchImpl: async (_url, init) => {
      body = JSON.parse(init.body);
      return new Response(JSON.stringify({
        model: "gpt-pilot-snapshot",
        output: [{ content: [{ type: "output_text", text: "{\"result\":true}" }] }],
        usage: { input_tokens: 100, output_tokens: 20 },
      }));
    },
  });
  const response = await provider.generate({
    systemInstructions: "server-only", evidencePackage: { calibrationId: "current" },
    structuredOutputSchema: { type: "object", properties: { result: { type: "boolean" } }, required: ["result"], additionalProperties: false },
    modelConfiguration: { temperature: 0.2, maxOutputTokens: 100 }, correctionErrors: ["retry correction"],
  });
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, "json_schema");
  assert.equal(body.text.format.strict, true);
  assert.match(body.input, /retry correction/);
  assert.deepEqual(response.structuredResult, { result: true });
  assert.equal(response.modelIdentifier, "gpt-pilot-snapshot");
});

test("OpenAI Responses timeout is configurable and redacts the aborted provider request", async () => {
  let timeoutSignal;
  const provider = new OpenAIResponsesCalibrationModelProvider({
    apiKey: "server-secret", modelIdentifier: "configured-model", timeoutMs: 10,
    fetchImpl: async (_url, init) => {
      timeoutSignal = init.signal;
      return new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => {
        reject(new DOMException("private prompt, answer, and provider response body", "TimeoutError"));
      }));
    },
  });
  await assert.rejects(
    () => provider.generate({
      systemInstructions: "private prompt", evidencePackage: { answer: "private answer" },
      structuredOutputSchema: {}, modelConfiguration: { maxOutputTokens: 6000 }, correctionErrors: [],
    }),
    (error) => {
      assert.equal(error.name, "ModelProviderTimeoutError");
      assert.equal(error.message, "Model provider timed out.");
      assert.doesNotMatch(JSON.stringify(error), /private prompt|private answer|provider response body|server-secret/);
      return true;
    },
  );
  assert.equal(timeoutSignal.aborted, true);
});

test("database survives restart and backup restores complete participant data", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "open-loops-readiness-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const primaryPath = join(directory, "primary.sqlite");
  const backupPath = join(directory, "backup.sqlite");
  let database = new CalibrationDatabase(primaryPath);
  database.createSession("pilot-user", session());
  database.close();
  database = new CalibrationDatabase(primaryPath);
  assert.equal(database.getSession("pilot-user", "pilot-session").id, "pilot-session");
  await database.backupTo(backupPath);
  database.close();
  const restored = new CalibrationDatabase(backupPath);
  assert.equal(restored.exportParticipant("pilot-user").sessions.length, 1);
  restored.close();
});

test("participant export and confirmed deletion cover sessions, records, and evaluations", () => {
  const database = new CalibrationDatabase();
  database.createSession("pilot-user", session());
  database.createGenerationAttempt("pilot-user", "pilot-session", {
    generation: { generatedProfile: { sections: [] } },
    provenance: { generatorType: "deterministic_fallback" },
  });
  const scores = Object.fromEntries(evaluationDimensions.map((dimension) => [dimension, 3]));
  storeCalibrationEvaluation(database, "reviewer", "pilot-user", {
    sourceSessionId: "pilot-session", sourceKind: "deterministic_fallback",
    source: { participantFacingProfile: "Frozen review copy" }, scores,
  });
  const exported = database.exportParticipant("pilot-user");
  assert.equal(exported.sessions.length, 1);
  assert.equal(exported.generationAttempts.length, 1);
  assert.equal(exported.evaluations.length, 1);
  assert.equal(database.getSession("pilot-user", "pilot-session").generatedProfile, undefined);
  const comparison = compareCalibrationEvaluations(exported.evaluations);
  assert.equal(comparison[0].total, 30);
  assert.deepEqual(database.deleteParticipant("pilot-user").deleted, {
    sessions: 1, generationAttempts: 1, businessDNARecords: 0, evaluations: 1,
  });
  assert.equal(database.exportParticipant("pilot-user").sessions.length, 0);
  database.close();
});

test("operational logger redacts secrets and participant content", () => {
  const lines = [];
  const logger = createSafeLogger((line) => lines.push(line));
  logger.event("provider_failure", {
    status: 503, apiKey: "secret-key", participantResponse: "private answer", path: "/api/calibrations/generate",
  });
  assert.match(lines[0], /\[REDACTED\]/);
  assert.doesNotMatch(lines[0], /secret-key|private answer/);
});
