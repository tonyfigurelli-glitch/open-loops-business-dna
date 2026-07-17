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
