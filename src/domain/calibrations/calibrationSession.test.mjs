import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./calibrationSession.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const lifecycle = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const definition = JSON.parse(
  readFileSync(
    new URL(
      "../../../Business DNA/calibrations/small-business-owner/v1.3.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const questionIds = definition.onboarding_questions.map((question) => question.id);

function startSession() {
  return lifecycle.createCalibrationSession({
    id: "session-1",
    participantId: "participant-1",
    calibrationId: definition.identifier,
    semanticVersion: definition.version,
    frozenSourceHash: definition.canonical_source.sha256,
    startedAt: "2026-07-17T12:00:00.000Z",
  });
}

function generatedResult(responses) {
  return {
    generatedProfile: {
      generatedAt: "2026-07-17T12:10:00.000Z",
      participantFacingProfile: "Stored separately from answers",
      sections: definition.profile_output.sections.map((section) => ({
        id: section.id,
        title: section.title,
        body: `Generated from ${responses.length} current-session answers`,
      })),
    },
    centralHypothesis: "A current-session hypothesis",
    evidenceReferences: [
      { questionId: "q01", classification: "direct_statement", summary: "Business" },
      { questionId: "q04", classification: "direct_statement", summary: "Priority" },
      { questionId: "q10", classification: "direct_statement", summary: "Friction" },
    ],
    supportingEvidence: [
      { questionId: "q04", classification: "direct_statement", summary: "Priority" },
      { questionId: "q10", classification: "direct_statement", summary: "Friction" },
    ],
    possibleDisconfirmingEvidence: ["Another constraint may matter more"],
    confidenceLevel: "medium",
    unknowns: ["Demand is unknown"],
    importantDirectQuotes: ["A direct quote"],
    proposedExperiment: {
      action: "Run one small test",
      hypothesis: "The test will produce evidence",
      minimumDeliverable: "One result",
      owner: "Owner",
      likelyObstacle: "Urgent work",
      supportThatMayHelp: "A scheduled review",
      resultToRecord: "Observed outcome",
      whatResultWouldTeach: "Whether the hypothesis holds",
    },
  };
}

function answerAt(session, index) {
  return lifecycle.saveCalibrationAnswer(
    session,
    {
      questionId: questionIds[index],
      response: `Answer ${index + 1}`,
      answeredAt: `2026-07-17T12:${String(index).padStart(2, "0")}:00.000Z`,
    },
    questionIds,
    generatedResult,
  );
}

test("starts a version-attributed calibration session", () => {
  const session = startSession();

  assert.equal(session.status, "collecting_answers");
  assert.equal(session.currentQuestionIndex, 0);
  assert.equal(session.calibrationId, definition.identifier);
  assert.equal(session.semanticVersion, "1.3.0");
  assert.equal(session.frozenSourceHash, definition.canonical_source.sha256);
  assert.deepEqual(session.participantResponses, []);
});

test("progresses one canonical question at a time and saves immediately", () => {
  const progressed = answerAt(startSession(), 0);

  assert.equal(progressed.currentQuestionIndex, 1);
  assert.equal(progressed.participantResponses.length, 1);
  assert.equal(progressed.participantResponses[0].questionId, "q01");
  assert.throws(() => answerAt(progressed, 2), /Expected calibration question q02/);
});

test("resumes a serialized incomplete session at its saved index", () => {
  let session = startSession();
  for (let index = 0; index < 5; index += 1) session = answerAt(session, index);

  const restored = JSON.parse(JSON.stringify(session));
  const resumed = answerAt(restored, 5);

  assert.equal(resumed.status, "collecting_answers");
  assert.equal(resumed.currentQuestionIndex, 6);
  assert.equal(resumed.participantResponses.length, 6);
});

test("completes 12 answers and stores the ten-section model separately", () => {
  let session = startSession();
  for (let index = 0; index < 12; index += 1) session = answerAt(session, index);

  assert.equal(session.status, "model_ready");
  assert.equal(session.currentQuestionIndex, 12);
  assert.equal(session.participantResponses.length, 12);
  assert.equal(session.generatedProfile.sections.length, 10);
  assert.equal(session.centralHypothesis, "A current-session hypothesis");
  assert.equal(session.supportingEvidence.length, 2);
  assert.equal(session.possibleDisconfirmingEvidence.length, 1);
  assert.equal(session.confidenceLevel, "medium");
  assert.deepEqual(session.participantResponses[0].response, "Answer 1");
});

test("collects seven ratings and five open responses before completion", () => {
  let session = startSession();
  for (let index = 0; index < 12; index += 1) session = answerAt(session, index);

  for (const rating of definition.participant_feedback.rating_questions) {
    session = lifecycle.saveNumericalFeedback(
      session,
      rating.id,
      4,
      definition.participant_feedback.rating_questions.map((item) => item.id),
    );
  }
  assert.equal(Object.keys(session.numericalFeedback).length, 7);
  assert.equal(session.status, "collecting_feedback");

  definition.participant_feedback.open_ended_questions.forEach((question, index) => {
    session = lifecycle.saveOpenEndedFeedback(
      session,
      question.id,
      `Feedback ${index + 1}`,
      definition.participant_feedback.open_ended_questions.map((item) => item.id),
      "2026-07-17T12:30:00.000Z",
    );
  });

  assert.equal(Object.keys(session.openEndedFeedback).length, 5);
  assert.equal(session.status, "completed");
  assert.equal(session.completedAt, "2026-07-17T12:30:00.000Z");
});

test("reopens an incomplete session first and a completed session after return", () => {
  const completed = { ...startSession(), status: "completed", completedAt: "done" };
  const incomplete = answerAt({ ...startSession(), id: "session-2" }, 0);

  assert.equal(lifecycle.selectCalibrationToOpen([completed, incomplete]).id, "session-2");
  assert.equal(lifecycle.selectCalibrationToOpen([completed]).id, "session-1");
});
