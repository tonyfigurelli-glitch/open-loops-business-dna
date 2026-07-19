import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/storage/calibrationApi.ts", import.meta.url), "utf8");
const definition = JSON.parse(readFileSync(new URL(
  "../Business DNA/calibrations/small-business-owner/v1.3.json", import.meta.url,
), "utf8"));
const sourceWithIdentity = source.replace(
  /import \{ smallBusinessOwnerCalibrationIdentity \} from "\.\.\/domain\/calibrations\/smallBusinessOwnerCalibration";/,
  `const smallBusinessOwnerCalibrationIdentity = ${JSON.stringify({
    calibrationId: definition.identifier,
    semanticVersion: definition.version,
    frozenSourceHash: definition.canonical_source.sha256,
  })};`,
);
const compiled = ts.transpileModule(sourceWithIdentity, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const client = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("network failure preserves deterministic generation recovery", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline"); };
  try {
    const expected = { provenance: { generatorType: "deterministic_fallback" } };
    const result = await client.requestGenerationWithNetworkFallback({}, async () => expected);
    assert.equal(result, expected);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("session merge retains the more complete recoverable local copy", () => {
  const base = {
    id: "same", startedAt: "2026-07-17T12:00:00.000Z", status: "collecting_answers",
    participantResponses: [], numericalFeedback: {}, openEndedFeedback: {},
  };
  const local = { ...base, currentQuestionIndex: 2, participantResponses: [{}, {}] };
  const remote = { ...base, currentQuestionIndex: 1, participantResponses: [{}] };
  assert.equal(client.mergeSessions([local], [remote])[0], local);
});

test("local migration filter uses the exact canonical identity", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (path, init = {}) => {
    calls.push({ path, body: init.body });
    return new Response(JSON.stringify(path.endsWith("/import") ? { imported: ["canonical"] } : { sessions: [] }));
  };
  try {
    const canonical = {
      id: "canonical", participantId: "local", calibrationId: definition.identifier,
      semanticVersion: definition.version, frozenSourceHash: definition.canonical_source.sha256,
      status: "collecting_answers", startedAt: "2026-07-17T12:00:00.000Z", currentQuestionIndex: 0,
      participantResponses: [], supportingEvidence: [], possibleDisconfirmingEvidence: [], evidenceReferences: [],
      unknowns: [], importantDirectQuotes: [], numericalFeedback: {}, openEndedFeedback: {},
    };
    await client.migrateAndLoadCalibrationSessions([
      canonical,
      { ...canonical, id: "wrong-version", semanticVersion: "1.3" },
    ]);
    const uploaded = JSON.parse(calls[0].body).sessions;
    assert.deepEqual(uploaded.map((item) => item.id), ["canonical"]);
  } finally { globalThis.fetch = originalFetch; }
});

test("retry status maps AI success and failed fallback without exposing generation content", () => {
  assert.equal(client.generationStateForAttempt({ outcome: "ai_assisted" }), "successful_ai_assisted");
  assert.equal(client.generationStateForAttempt({ outcome: "failed_with_fallback" }), "failed_with_fallback");
  assert.equal(client.generationStateForAttempt({
    outcome: "failed_with_fallback", provenance: { failureReason: "provider_timeout" },
  }), "timed_out_with_fallback");
  assert.equal(client.generationStateForAttempt({
    outcome: "failed_with_fallback", provenance: { failureReason: "validation_failure" },
  }), "validation_rejected_with_fallback");
});

test("retry errors are redacted before reaching the participant interface", async () => {
  const originalFetch = globalThis.fetch;
  const sensitive = "provider-credential-private provider prompt and participant answer";
  globalThis.fetch = async () => new Response(JSON.stringify({ error: sensitive }), { status: 500 });
  try {
    let captured;
    await client.retryCalibrationGeneration("saved-session").catch((error) => { captured = error; });
    const safe = client.safeGenerationError(captured);
    assert.match(safe, /GPT-5.6/);
    assert.doesNotMatch(safe, /provider-credential-private|provider prompt|participant answer/);
    assert.doesNotMatch(JSON.stringify(captured), /provider-credential-private|provider prompt|participant answer/);
  } finally { globalThis.fetch = originalFetch; }
});

test("completed results expose history, new-session, retry, and safe generation states", () => {
  const screen = readFileSync(new URL("../src/screens/BusinessCalibration.tsx", import.meta.url), "utf8");
  for (const copy of [
    "Start New Calibration", "Retry with GPT-5.6", "Calibration history",
    "Connecting securely to GPT-5.6", "AI-assisted generation succeeded",
    "AI-assisted generation failed", "GPT-5.6 timed out", "did not pass narrative and evidence validation",
  ]) assert.match(screen, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(screen, /response\.json\(\).*error|dangerouslySetInnerHTML/);
});

test("retry completion always exits connecting for success, fallback, timeout, and network failure", async () => {
  const outcomes = [
    [() => Promise.resolve({ outcome: "ai_assisted", provenance: {} }), "successful_ai_assisted"],
    [() => Promise.resolve({ outcome: "failed_with_fallback", provenance: {} }), "failed_with_fallback"],
    [() => Promise.resolve({
      outcome: "failed_with_fallback", provenance: { failureReason: "provider_timeout" },
    }), "timed_out_with_fallback"],
    [() => Promise.resolve({
      outcome: "failed_with_fallback", provenance: { failureReason: "validation_failure" },
    }), "validation_rejected_with_fallback"],
    [() => Promise.reject(new DOMException("private timeout detail", "TimeoutError")), "timed_out_with_fallback"],
    [() => Promise.reject(new Error("network failed with private response body")), "failed_with_fallback"],
  ];
  for (const [operation, expected] of outcomes) {
    const result = await client.completeCalibrationGenerationRetry(operation);
    assert.equal(result.state, expected);
    assert.notEqual(result.state, "connecting");
    assert.doesNotMatch(JSON.stringify(result), /private timeout detail|private response body/);
  }
});
