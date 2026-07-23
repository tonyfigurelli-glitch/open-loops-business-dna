import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { TokenAuthService } from "./auth.mjs";
import { CalibrationDatabase } from "./database.mjs";
import { createApi } from "./api.mjs";
import { loadCalibrationDomain } from "./loadDomain.mjs";
import { CalibrationGenerationService } from "./generationService.mjs";

const domain = await loadCalibrationDomain();
const answerValues = Object.fromEntries(domain.canonical.onboarding_questions.map((question) => [
  question.id,
  `Current-session response for ${question.id}`,
]));

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "open-loops-backend-"));
  const database = new CalibrationDatabase(join(directory, "calibrations.sqlite"));
  const auth = new TokenAuthService("backend-test-secret-value");
  const generationService = new CalibrationGenerationService({
    canonical: domain.canonical,
    pipeline: domain.pipeline,
    generator: domain.generator,
    provider: new domain.pipeline.UnavailableCalibrationModelProvider(),
  });
  const api = createApi({ database, auth, generationService, canonical: domain.canonical });
  return {
    database,
    auth,
    api,
    close() { database.close(); rmSync(directory, { recursive: true, force: true }); },
  };
}

function session(id = "session-a") {
  return {
    id,
    participantId: "client-placeholder",
    calibrationId: domain.canonical.identifier,
    semanticVersion: domain.canonical.version,
    frozenSourceHash: domain.canonical.canonical_source.sha256,
    status: "collecting_answers",
    startedAt: "2026-07-17T12:00:00.000Z",
    lastUpdatedAt: "2026-07-17T12:00:00.000Z",
    currentQuestionIndex: 0,
    participantResponses: [],
    supportingEvidence: [],
    possibleDisconfirmingEvidence: [],
    evidenceReferences: [],
    unknowns: [],
    importantDirectQuotes: [],
    numericalFeedback: {},
    openEndedFeedback: {},
  };
}

function validAIOutput(evidencePackage) {
  const bodies = [
    "You are building from direct customer knowledge while trying to make the next stage of the business more deliberate.",
    "Your pattern combines practical action with adjustment after new information arrives, which can keep uncertainty from becoming paralysis.",
    "Your stated priority deserves a focused test of capacity before it becomes a broad theory about the business.",
    "Responsiveness appears to be a strength, with the possible shadow that urgent work can crowd out the work that creates future options.",
    "The resulting tension may sit between maintaining today's service and protecting enough attention for the stated priority.",
    "A respectful challenge is to compare the current capacity hypothesis with demand and pricing rather than assuming one explanation is settled.",
    "Use one short seven-day test to observe where the chosen step actually slows, then record the result without forcing it to confirm the hypothesis.",
    "Clear priorities and steadier demand may help you operate with more consistency and less reactive switching.",
    "Demand, profitability, and the team's available capacity remain unknown, so they should stay visible as competing explanations.",
    "Continuing will reveal whether this pattern repeats in real choices and outcomes, allowing the model to become more useful through evidence.",
  ];
  return {
    profileSections: evidencePackage.requiredOutputSections.map((section, index) => ({
      id: section.id, title: section.title, body: bodies[index],
      evidenceReferences: ["q04", "q08"],
    })),
    centralHypothesis: "Execution capacity may affect the current priority.",
    supportingEvidenceReferences: ["q04", "q08"],
    possibleDisconfirmingEvidence: ["Demand may be more limiting."],
    competingHypotheses: [{ hypothesis: "Demand may be more limiting.", evidenceReferences: ["q04", "q11"], rank: 2 }],
    confidenceLevel: "medium",
    confidenceRationale: "Two independent current-session answers support a provisional conclusion.",
    classifications: {
      directStatements: evidencePackage.participantAnswers.map((item) => ({ questionId: item.questionId, statement: item.exactWording })),
      reasonableInferences: [{ statement: "Capacity may matter.", evidenceReferences: ["q04", "q08"] }],
      tentativeHypotheses: [{ statement: "Demand may matter more.", evidenceReferences: ["q04", "q11"] }],
      unknowns: ["Demand remains unknown."],
    },
    importantDirectQuotes: [],
    sevenDayExperiment: {
      action: "Run one reversible business-process test.", hypothesis: "The result may reveal the constraint.",
      minimumDeliverable: "One completed step.", owner: "Owner", likelyObstacle: "Urgent work",
      supportThatMayHelp: "A scheduled block", resultToRecord: "Record the observed result.",
      whatResultWouldTeach: "Whether capacity affects the priority.",
    },
    majorConclusions: [{ claim: "Capacity may affect the priority.", evidenceReferences: ["q04", "q08"] }],
    appliedPractices: [{
      practiceId: "measurable-priority",
      evidenceReferences: ["q04", "q08"],
      inferredConnection: "The stated priority and the volume of active work may be competing for a shared definition of progress.",
      businessConsequence: "Activity can continue without producing the outcome the owner intends.",
      fitExplanation: "One observable result would make the tradeoff testable.",
      caution: "The measure must not hide profitability or team strain.",
      whatWouldDisproveIt: "A clear weekly measure already governs choices without improving the outcome.",
      experimentConnection: "The seven-day test records movement against the chosen result.",
    }],
    safetyFlags: [],
  };
}

function authenticatedRequest(auth, userId, path, init = {}) {
  const token = auth.issue(userId);
  return new Request(`http://local${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
  });
}

test("requires authentication and enforces session ownership", async (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.equal((await f.api(new Request("http://local/api/calibration-sessions"))).status, 401);
  const created = await f.api(authenticatedRequest(f.auth, "user-a", "/api/calibration-sessions", {
    method: "POST", body: JSON.stringify(session()),
  }));
  assert.equal(created.status, 201);
  const denied = await f.api(authenticatedRequest(f.auth, "user-b", "/api/calibration-sessions/session-a"));
  assert.equal(denied.status, 404);
});

test("confirmed workspace reset deletes only the authenticated participant", async (t) => {
  const f = fixture(); t.after(() => f.close());
  f.database.createSession("user-a", session("session-a"));
  f.database.createSession("user-b", session("session-b"));

  const unconfirmed = await f.api(authenticatedRequest(f.auth, "user-a", "/api/participant-data", {
    method: "DELETE", body: JSON.stringify({ confirmation: "no" }),
  }));
  assert.equal(unconfirmed.status, 400);
  assert.equal(f.database.listSessions("user-a").length, 1);

  const reset = await f.api(authenticatedRequest(f.auth, "user-a", "/api/participant-data", {
    method: "DELETE", body: JSON.stringify({ confirmation: "RESET_ENTIRE_WORKSPACE" }),
  }));
  assert.equal(reset.status, 200);
  assert.equal((await reset.json()).deleted.sessions, 1);
  assert.equal(f.database.listSessions("user-a").length, 0);
  assert.equal(f.database.listSessions("user-b").length, 1);
});

test("encrypted authentication survives refresh and auth-service recreation", () => {
  const secret = "persistent-test-secret-value";
  const token = new TokenAuthService(secret).issue("user-a");
  const refreshedRequest = new Request("http://local/api/auth/session", {
    headers: { cookie: `open_loops_session=${token}` },
  });
  assert.equal(new TokenAuthService(secret).authenticate(refreshedRequest), "user-a");
});

test("saves progress durably and resumes it", async (t) => {
  const f = fixture(); t.after(() => f.close());
  f.database.createSession("user-a", session());
  const progressed = { ...session(), currentQuestionIndex: 1, participantResponses: [{
    questionId: "q01", response: answerValues.q01, answeredAt: "2026-07-17T12:01:00.000Z",
  }] };
  const saved = await f.api(authenticatedRequest(f.auth, "user-a", "/api/calibration-sessions/session-a", {
    method: "PUT", body: JSON.stringify(progressed),
  }));
  assert.equal(saved.status, 200);
  const reopened = await f.api(authenticatedRequest(f.auth, "user-a", "/api/calibration-sessions/session-a"));
  assert.equal((await reopened.json()).session.participantResponses[0].response, answerValues.q01);
});

test("secure generation accepts only the exact canonical evidence package and falls back on outage", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const responses = domain.canonical.onboarding_questions.map((question, index) => ({
    questionId: question.id,
    response: answerValues[question.id],
    answeredAt: `2026-07-17T12:${String(index).padStart(2, "0")}:00.000Z`,
  }));
  const evidencePackage = domain.pipeline.buildCalibrationEvidencePackage(domain.canonical, responses);
  const generated = await f.api(authenticatedRequest(f.auth, "user-a", "/api/calibrations/generate", {
    method: "POST", body: JSON.stringify({ evidencePackage }),
  }));
  assert.equal(generated.status, 200);
  const body = await generated.json();
  assert.equal(body.provenance.generatorType, "deterministic_fallback");
  assert.equal(body.generation.generatedProfile.sections.length, 10);
  const contaminated = structuredClone(evidencePackage);
  contaminated.statedContext.businessDescription = "Unrelated prior-chat context";
  const rejected = await f.api(authenticatedRequest(f.auth, "user-a", "/api/calibrations/generate", {
    method: "POST", body: JSON.stringify({ evidencePackage: contaminated }),
  }));
  assert.equal(rejected.status, 400);
});

test("secure endpoint invokes the provider server-side and returns validated AI provenance", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const responses = domain.canonical.onboarding_questions.map((question) => ({
    questionId: question.id, response: answerValues[question.id], answeredAt: "2026-07-17T12:00:00.000Z",
  }));
  const evidencePackage = domain.pipeline.buildCalibrationEvidencePackage(domain.canonical, responses);
  let calls = 0;
  const provider = new domain.pipeline.LocalMockCalibrationModelProvider((request) => {
    calls += 1;
    assert.equal(Object.hasOwn(request.evidencePackage, "priorChats"), false);
    return validAIOutput(request.evidencePackage);
  }, "approved_server_test", "structured-test-model");
  const service = new CalibrationGenerationService({
    canonical: domain.canonical, pipeline: domain.pipeline, generator: domain.generator, provider,
  });
  const api = createApi({ database: f.database, auth: f.auth, generationService: service, canonical: domain.canonical });
  const response = await api(authenticatedRequest(f.auth, "user-a", "/api/calibrations/generate", {
    method: "POST", body: JSON.stringify({ evidencePackage }),
  }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(calls, 1);
  assert.equal(body.provenance.generatorType, "ai_assisted");
  assert.equal(body.provenance.provider, "approved_server_test");
});

test("server diagnostics retain safe validation codes for both attempts without participant content", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const responses = domain.canonical.onboarding_questions.map((question) => ({
    questionId: question.id, response: answerValues[question.id], answeredAt: "2026-07-17T12:00:00.000Z",
  }));
  const evidencePackage = domain.pipeline.buildCalibrationEvidencePackage(domain.canonical, responses);
  const diagnostics = [];
  const service = new CalibrationGenerationService({
    canonical: domain.canonical,
    pipeline: domain.pipeline,
    generator: domain.generator,
    provider: new domain.pipeline.LocalMockCalibrationModelProvider(() => ({ invalid: true })),
    diagnostics: (metadata) => diagnostics.push(metadata),
  });
  const api = createApi({ database: f.database, auth: f.auth, generationService: service, canonical: domain.canonical });

  const response = await api(authenticatedRequest(f.auth, "user-a", "/api/calibrations/generate", {
    method: "POST", body: JSON.stringify({ evidencePackage }),
  }));
  assert.equal(response.status, 200);
  assert.equal(diagnostics.length, 1);
  assert.deepEqual(diagnostics[0].validationAttempts.map((attempt) => attempt.attempt), [1, 2]);
  assert.equal(diagnostics[0].validationAttempts.every((attempt) => attempt.codes.length > 0), true);
  const serialized = JSON.stringify(diagnostics);
  for (const answer of Object.values(answerValues)) assert.doesNotMatch(serialized, new RegExp(answer));
  assert.doesNotMatch(serialized, /profileSections|participantAnswers|generatedProfile/);
});

test("retry endpoint failures expose only a stable safe diagnostic code", async () => {
  const diagnostics = [];
  const sensitive = "private provider response, prompt, answer, and credential";
  const api = createApi({
    database: { getSession: () => ({ id: "saved-session" }) },
    auth: { restore: () => "user-a" },
    generationService: { retryStoredSession: async () => { throw new Error(sensitive); } },
    canonical: domain.canonical,
    diagnostics: (metadata) => diagnostics.push(metadata),
  });
  const response = await api(new Request(
    "http://local/api/calibration-sessions/saved-session/retry-generation",
    { method: "POST", body: "{}" },
  ));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    error: "The server could not complete the request.",
    code: "retry_internal_failure",
  });
  assert.deepEqual(diagnostics, [{
    route: "calibration_retry", status: 500, code: "retry_internal_failure",
  }]);
  assert.doesNotMatch(JSON.stringify(diagnostics), /private provider|prompt|answer|credential/);
});

test("migration is deduplicated and preserves timestamps and provenance", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const request = () => authenticatedRequest(f.auth, "user-a", "/api/calibration-sessions/import", {
    method: "POST", body: JSON.stringify({ sessions: [session("migrated")] }),
  });
  assert.deepEqual((await (await f.api(request())).json()).imported, ["migrated"]);
  assert.deepEqual((await (await f.api(request())).json()).duplicates, ["migrated"]);
  const stored = f.database.getSession("user-a", "migrated");
  assert.equal(stored.startedAt, "2026-07-17T12:00:00.000Z");
  assert.equal(stored.migrationProvenance.source, "localStorage");
});

test("completion creates an immutable initial Business DNA record and original model", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const base = session();
  f.database.createSession("user-a", base);
  const responses = domain.canonical.onboarding_questions.map((question) => ({
    questionId: question.id, response: answerValues[question.id], answeredAt: base.startedAt,
  }));
  const generation = domain.generator.generateInitialBusinessModel(responses);
  const completed = {
    ...base, ...generation, participantResponses: responses, currentQuestionIndex: 12,
    status: "completed", completedAt: "2026-07-17T13:00:00.000Z",
    generationProvenance: {
      generatorType: "deterministic_fallback", provider: "unavailable", modelIdentifier: "unavailable",
      promptInstructionVersion: "test", calibrationVersion: "1.3",
      frozenCalibrationHash: base.frozenSourceHash, generationTimestamp: base.startedAt,
      validationResult: { valid: false, errors: ["outage"] }, retryCount: 1,
      evidencePackageHash: "a".repeat(64),
    },
    deterministicFallbackOutput: generation,
  };
  f.database.saveSession("user-a", completed);
  const record = f.database.getBusinessDNARecord("user-a", base.id);
  assert.equal(record.status, "initial_provisional_model");
  assert.equal(record.sourceCalibrationVersion, domain.canonical.version);
  assert.throws(() => f.database.saveSession("user-a", { ...completed, centralHypothesis: "overwrite" }), /immutable/);
  assert.equal(f.database.getSession("user-a", base.id).centralHypothesis, generation.centralHypothesis);
});

test("retry uses the exact stored 12-answer evidence and preserves the completed result", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const base = session("retry-session");
  const responses = domain.canonical.onboarding_questions.map((question, index) => ({
    questionId: question.id,
    response: `Exact private answer ${index + 1} — punctuation preserved.`,
    answeredAt: `2026-07-17T12:${String(index).padStart(2, "0")}:00.000Z`,
  }));
  const fallback = domain.generator.generateInitialBusinessModel(responses);
  const completed = {
    ...base, ...fallback, participantResponses: responses, currentQuestionIndex: 12,
    status: "completed", completedAt: "2026-07-17T13:00:00.000Z",
    generationProvenance: {
      generatorType: "deterministic_fallback", provider: "unavailable", modelIdentifier: "unavailable",
      promptInstructionVersion: "test", calibrationVersion: domain.canonical.version,
      frozenCalibrationHash: base.frozenSourceHash, generationTimestamp: base.startedAt,
      validationResult: { valid: false, errors: ["outage"] }, retryCount: 1,
      evidencePackageHash: "a".repeat(64),
    },
    deterministicFallbackOutput: fallback,
  };
  f.database.createSession("user-a", completed);
  const originalRecord = structuredClone(f.database.getBusinessDNARecord("user-a", base.id));
  let providerEvidence;
  const provider = new domain.pipeline.LocalMockCalibrationModelProvider((request) => {
    providerEvidence = request.evidencePackage;
    return validAIOutput(request.evidencePackage);
  }, "approved_server_test", "gpt-5.6-test");
  const service = new CalibrationGenerationService({
    canonical: domain.canonical, pipeline: domain.pipeline, generator: domain.generator, provider,
  });
  const api = createApi({ database: f.database, auth: f.auth, generationService: service, canonical: domain.canonical });

  const response = await api(authenticatedRequest(
    f.auth, "user-a", "/api/calibration-sessions/retry-session/retry-generation",
    { method: "POST", body: "{}" },
  ));
  assert.equal(response.status, 200);
  const { attempt } = await response.json();
  assert.equal(attempt.outcome, "ai_assisted");
  assert.equal(attempt.requestedModelFamily, "GPT-5.6");
  assert.deepEqual(
    providerEvidence.participantAnswers.map((answer) => answer.exactWording),
    responses.map((answer) => answer.response),
  );
  assert.equal(f.database.getSession("user-a", base.id).centralHypothesis, fallback.centralHypothesis);
  assert.deepEqual(f.database.getBusinessDNARecord("user-a", base.id), originalRecord);
  assert.equal(f.database.listGenerationAttempts("user-a", base.id).length, 1);
  const denied = await api(authenticatedRequest(
    f.auth, "user-b", "/api/calibration-sessions/retry-session/retry-generation",
    { method: "POST", body: "{}" },
  ));
  assert.equal(denied.status, 404);
});

test("retry attempts survive refresh, auth recreation, and database restart newest-first", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "open-loops-retry-restart-"));
  const databasePath = join(directory, "calibrations.sqlite");
  const secret = "retry-restart-test-secret";
  let database = new CalibrationDatabase(databasePath);
  t.after(() => {
    try { database.close(); } catch {}
    rmSync(directory, { recursive: true, force: true });
  });

  const base = session("restart-retry-session");
  const responses = domain.canonical.onboarding_questions.map((question, index) => ({
    questionId: question.id,
    response: `Restart-safe exact answer ${index + 1}.`,
    answeredAt: base.startedAt,
  }));
  const fallback = domain.generator.generateInitialBusinessModel(responses);
  const completed = {
    ...base, ...fallback, participantResponses: responses, currentQuestionIndex: 12,
    status: "completed", completedAt: "2026-07-17T13:00:00.000Z",
    generationProvenance: {
      generatorType: "deterministic_fallback", provider: "unavailable", modelIdentifier: "unavailable",
      promptInstructionVersion: "test", calibrationVersion: domain.canonical.version,
      frozenCalibrationHash: base.frozenSourceHash, generationTimestamp: base.startedAt,
      validationResult: { valid: false, errors: ["outage"] }, retryCount: 1,
      evidencePackageHash: "c".repeat(64),
    },
    deterministicFallbackOutput: fallback,
  };
  database.createSession("user-a", completed);
  const originalRecord = structuredClone(database.getBusinessDNARecord("user-a", base.id));
  const originalProfile = structuredClone(database.getSession("user-a", base.id).generatedProfile);

  let providerCall = 0;
  const provider = new domain.pipeline.LocalMockCalibrationModelProvider((request) => {
    providerCall += 1;
    if (providerCall <= 2) throw new Error("sensitive provider failure body");
    return validAIOutput(request.evidencePackage);
  }, "approved_server_test", "gpt-5.6-test");
  const service = new CalibrationGenerationService({
    canonical: domain.canonical, pipeline: domain.pipeline, generator: domain.generator, provider,
  });
  const auth = new TokenAuthService(secret);
  const token = auth.issue("user-a");
  const api = createApi({ database, auth, generationService: service, canonical: domain.canonical });
  const retryRequest = () => new Request(
    "http://local/api/calibration-sessions/restart-retry-session/retry-generation",
    { method: "POST", body: "{}", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" } },
  );

  assert.equal((await api(retryRequest())).status, 200);
  assert.equal((await api(retryRequest())).status, 200);
  const refreshed = await api(new Request("http://local/api/calibration-sessions", {
    headers: { authorization: `Bearer ${token}` },
  }));
  const beforeRestart = (await refreshed.json()).sessions[0];
  assert.deepEqual(beforeRestart.generationAttempts.map((attempt) => attempt.outcome), [
    "ai_assisted", "failed_with_fallback",
  ]);
  assert.equal(beforeRestart.generationAttempts[1].provenance.failureReason, "provider_failure");
  assert.equal(beforeRestart.generationAttempts[1].provenance.validationAttempts.length, 2);
  assert.doesNotMatch(JSON.stringify(beforeRestart.generationAttempts[1].provenance), /sensitive provider failure body/);

  database.close();
  database = new CalibrationDatabase(databasePath);
  const recreatedAuth = new TokenAuthService(secret);
  const recreatedApi = createApi({
    database,
    auth: recreatedAuth,
    generationService: new CalibrationGenerationService({
      canonical: domain.canonical,
      pipeline: domain.pipeline,
      generator: domain.generator,
      provider: new domain.pipeline.UnavailableCalibrationModelProvider(),
    }),
    canonical: domain.canonical,
  });
  const afterRestartResponse = await recreatedApi(new Request("http://local/api/calibration-sessions", {
    headers: { authorization: `Bearer ${token}` },
  }));
  assert.equal(afterRestartResponse.status, 200);
  const afterRestart = (await afterRestartResponse.json()).sessions[0];
  assert.deepEqual(afterRestart.generationAttempts, beforeRestart.generationAttempts);
  assert.deepEqual(afterRestart.generatedProfile, originalProfile);
  assert.deepEqual(database.getBusinessDNARecord("user-a", base.id), originalRecord);
});

test("retry records a failed-with-fallback state when the provider remains unavailable", async (t) => {
  const f = fixture(); t.after(() => f.close());
  const base = session("fallback-retry");
  const responses = domain.canonical.onboarding_questions.map((question) => ({
    questionId: question.id, response: answerValues[question.id], answeredAt: base.startedAt,
  }));
  const fallback = domain.generator.generateInitialBusinessModel(responses);
  f.database.createSession("user-a", {
    ...base, ...fallback, status: "completed", completedAt: base.startedAt,
    currentQuestionIndex: 12, participantResponses: responses,
    generationProvenance: {
      generatorType: "deterministic_fallback", provider: "unavailable", modelIdentifier: "unavailable",
      promptInstructionVersion: "test", calibrationVersion: domain.canonical.version,
      frozenCalibrationHash: base.frozenSourceHash, generationTimestamp: base.startedAt,
      validationResult: { valid: false, errors: ["outage"] }, retryCount: 1,
      evidencePackageHash: "b".repeat(64),
    },
  });
  const response = await f.api(authenticatedRequest(
    f.auth, "user-a", "/api/calibration-sessions/fallback-retry/retry-generation",
    { method: "POST", body: "{}" },
  ));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).attempt.outcome, "failed_with_fallback");
});

test("canonical files remain unchanged and frontend source contains no provider secret", () => {
  const markdown = readFileSync(new URL("../Business DNA/calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md", import.meta.url));
  const json = readFileSync(new URL("../Business DNA/calibrations/small-business-owner/v1.3.json", import.meta.url));
  assert.equal(createHash("sha256").update(markdown).digest("hex"), "419b3231ccf597ed27e9f489cff534c08d5700d65901ee9c028239a1fd0840e7");
  assert.equal(createHash("sha256").update(json).digest("hex"), "a4908b29678a29f6de54fe1580b046cc8e62559932f81e10a7aae153193b4cb0");
  const client = readFileSync(new URL("../src/storage/calibrationApi.ts", import.meta.url), "utf8");
  assert.doesNotMatch(client, /MODEL_PROVIDER_API_KEY|Bearer sk-/);
});
