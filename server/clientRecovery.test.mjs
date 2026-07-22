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

test("refresh merge preserves server-owned retry attempts and immutable completed data", () => {
  const base = {
    id: "completed", startedAt: "2026-07-17T12:00:00.000Z",
    lastUpdatedAt: "2026-07-17T13:00:00.000Z", status: "completed",
    centralHypothesis: "Original deterministic hypothesis",
    participantResponses: Array.from({ length: 12 }, () => ({})),
    numericalFeedback: {}, openEndedFeedback: {},
  };
  const failedAttempt = {
    id: "attempt-failed", outcome: "failed_with_fallback",
    createdAt: "2026-07-18T12:00:00.000Z", provenance: { failureReason: "validation_failure" },
  };
  const successfulAttempt = {
    id: "attempt-success", outcome: "ai_assisted",
    createdAt: "2026-07-18T13:00:00.000Z", provenance: { generatorType: "ai_assisted" },
  };
  const local = {
    ...base, lastUpdatedAt: "2026-07-18T14:00:00.000Z",
    centralHypothesis: "Invalid local overwrite", generationAttempts: [failedAttempt],
  };
  const remote = { ...base, generationAttempts: [successfulAttempt, failedAttempt] };
  const merged = client.mergeSessions([local], [remote])[0];

  assert.equal(merged.centralHypothesis, "Original deterministic hypothesis");
  assert.deepEqual(merged.generationAttempts.map((attempt) => attempt.id), [
    "attempt-success", "attempt-failed",
  ]);
  assert.equal(merged.generationAttempts.find((attempt) => attempt.outcome === "ai_assisted"), successfulAttempt);
});

test("server-owned retry attempts do not change the session write fingerprint", () => {
  const session = {
    id: "completed", startedAt: "2026-07-17T12:00:00.000Z", status: "completed",
    participantResponses: [], numericalFeedback: {}, openEndedFeedback: {},
  };
  const withoutAttempt = client.calibrationSessionWriteFingerprint(session);
  const withAttempt = client.calibrationSessionWriteFingerprint({
    ...session,
    generationAttempts: [{ id: "server-attempt", outcome: "ai_assisted", createdAt: "2026-07-18T12:00:00.000Z" }],
  });
  assert.equal(withAttempt, withoutAttempt);

  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /changedSessions\.map\(\(session\) => syncCalibrationSession\(session\)\)/);
  assert.doesNotMatch(app, /calibrationSessions\.map\(\(session\) => syncCalibrationSession\(session\)\)/);
});

test("local-storage recovery retains generation attempts", () => {
  const storage = readFileSync(new URL("../src/storage/prototypeStorage.ts", import.meta.url), "utf8");
  assert.match(storage, /generationAttempts: session\.generationAttempts \?\? \[\]/);
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
    assert.match(safe, /secure generation service/);
    assert.doesNotMatch(safe, /provider-credential-private|provider prompt|participant answer/);
    assert.doesNotMatch(JSON.stringify(captured), /provider-credential-private|provider prompt|participant answer/);
  } finally { globalThis.fetch = originalFetch; }
});

test("a lost retry response recovers the newly persisted server attempt", async () => {
  const originalFetch = globalThis.fetch;
  const recoveredAttempt = {
    id: "new-ai-attempt", sourceSessionId: "saved-session", outcome: "ai_assisted",
    createdAt: "2026-07-20T12:00:00.000Z", generation: {}, provenance: { generatorType: "ai_assisted" },
  };
  const calls = [];
  globalThis.fetch = async (path, init = {}) => {
    calls.push({ path, method: init.method ?? "GET" });
    if (path.endsWith("/retry-generation")) {
      return new Response(JSON.stringify({
        error: "private provider and participant content",
        code: "retry_internal_failure",
      }), { status: 500 });
    }
    return new Response(JSON.stringify({
      session: { id: "saved-session", generationAttempts: [recoveredAttempt, { id: "known-attempt" }] },
    }));
  };
  try {
    const result = await client.retryCalibrationGeneration("saved-session", ["known-attempt"]);
    assert.deepEqual(result, recoveredAttempt);
    assert.deepEqual(calls.map((call) => call.method), ["POST", "GET"]);
  } finally { globalThis.fetch = originalFetch; }
});

test("an unreadable successful retry response recovers from the durable session", async () => {
  const originalFetch = globalThis.fetch;
  const recoveredAttempt = {
    id: "recovered-after-body-loss", sourceSessionId: "saved-session", outcome: "ai_assisted",
    createdAt: "2026-07-20T12:01:00.000Z", generation: {}, provenance: { generatorType: "ai_assisted" },
  };
  let call = 0;
  globalThis.fetch = async () => {
    call += 1;
    return call === 1
      ? new Response("truncated", { status: 200 })
      : new Response(JSON.stringify({ session: { generationAttempts: [recoveredAttempt] } }));
  };
  try {
    assert.deepEqual(
      await client.retryCalibrationGeneration("saved-session", []),
      recoveredAttempt,
    );
  } finally { globalThis.fetch = originalFetch; }
});

test("request failure is not mislabeled as provider fallback or reachability", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: "private internal detail", code: "retry_internal_failure",
  }), { status: 500 });
  try {
    const result = await client.completeCalibrationGenerationRetry(
      () => client.retryCalibrationGeneration("saved-session", []),
    );
    assert.equal(result.state, "request_failed");
    assert.match(result.error, /secure generation service/);
    assert.doesNotMatch(result.error, /GPT-5.6 could not be reached|private internal detail/);
  } finally { globalThis.fetch = originalFetch; }
});

test("completed results expose history, new-session, retry, and safe generation states", () => {
  const screen = readFileSync(new URL("../src/screens/BusinessCalibration.tsx", import.meta.url), "utf8");
  for (const copy of [
    "Start New Calibration", "Retry with GPT-5.6", "Calibration history",
    "Connecting securely to GPT-5.6", "AI-assisted generation succeeded",
    "AI-assisted generation failed", "GPT-5.6 timed out", "did not pass narrative and evidence validation",
    "retry request did not complete in this browser",
  ]) assert.match(screen, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(screen, /session\.generationAttempts\?\.find\(\s*\(attempt\) => attempt\.outcome === "ai_assisted"/);
  assert.doesNotMatch(screen, /response\.json\(\).*error|dangerouslySetInnerHTML/);
});

test("Version 1.4 feedback shows three-question progress and a safe return path", () => {
  const screen = readFileSync(new URL("../src/screens/BusinessCalibration.tsx", import.meta.url), "utf8");
  assert.match(screen, /Feedback question \{currentQuestionNumber\} of \{totalQuestions\}/);
  assert.match(screen, /aria-label=\{`Feedback question \$\{currentQuestionNumber\} of \$\{totalQuestions\}`\}/);
  assert.match(screen, />Finish later<\/button>/);
  assert.match(screen, /collecting_feedback: "Feedback in progress"/);
});

test("completed results keep narrative primary and place complete records in collapsed review details", () => {
  const screen = readFileSync(new URL("../src/screens/BusinessCalibration.tsx", import.meta.url), "utf8");
  assert.equal((screen.match(/<details>/g) ?? []).length, 5);
  assert.doesNotMatch(screen, /<details\s+open/);
  for (const summary of [
    "Stored Interpretation", "Original Answers", "Full Seven-Day Experiment",
    "Participant Feedback", "Generation and Source",
  ]) assert.match(screen, new RegExp(`<summary>${summary}</summary>`));
  assert.equal(
    screen.indexOf("<ProfileSections sections={displayedProfile?.sections ?? []} />") <
      screen.indexOf('className="review-details"'),
    true,
  );
  assert.match(screen, /function ProfileSections[\s\S]*className="model-sections"/);
  assert.match(screen, /function ProfileSectionBody[\s\S]*className="model-section-body"/);
  assert.match(
    screen,
    /function CalibrationIdentity[\s\S]*Calibration version \{session\.semanticVersion\}[\s\S]*?\n\}/,
  );
  assert.match(screen, /<UncertaintyList items=\{displayedUnknowns\}/);
  assert.match(screen, /<UncertaintyList items=\{displayedDisconfirmingEvidence\}/);
  assert.doesNotMatch(screen, /join\(" · "\)/);
  for (const label of [
    "Minimum deliverable", "Owner", "Likely obstacle", "Support that may help",
    "Result to record", "What the result would teach",
  ]) assert.equal(screen.includes(`["${label}"`), true);
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
    [() => Promise.reject(new Error("network failed with private response body")), "request_failed"],
  ];
  for (const [operation, expected] of outcomes) {
    const result = await client.completeCalibrationGenerationRetry(operation);
    assert.equal(result.state, expected);
    assert.notEqual(result.state, "connecting");
    assert.doesNotMatch(JSON.stringify(result), /private timeout detail|private response body/);
  }
});
