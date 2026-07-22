import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./calibrationDashboard.ts", import.meta.url), "utf8")
  .replace('import type { CalibrationSession } from "../models";\n', "");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dashboard = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

function session(overrides = {}) {
  return {
    id: "session-1",
    status: "collecting_answers",
    participantResponses: [],
    numericalFeedback: {},
    openEndedFeedback: {},
    ...overrides,
  };
}

test("returns no dashboard before the first calibration starts", () => {
  assert.equal(dashboard.buildCalibrationDashboardSummary([], 12, 3), null);
});

test("prioritizes an unfinished session and reports onboarding progress", () => {
  const completed = session({ id: "complete", status: "completed" });
  const unfinished = session({
    id: "unfinished",
    participantResponses: Array.from({ length: 5 }, (_, index) => ({ questionId: `q${index}` })),
  });

  const summary = dashboard.buildCalibrationDashboardSummary([completed, unfinished], 12, 3);

  assert.equal(summary.activeSession.id, "unfinished");
  assert.equal(summary.statusLabel, "In progress");
  assert.equal(summary.actionLabel, "Continue calibration");
  assert.equal(summary.progressLabel, "5 of 12 questions answered");
  assert.equal(summary.sessionCount, 2);
  assert.equal(summary.completedSessionCount, 1);
});

test("shows saved completion as a profile that can be reopened", () => {
  const summary = dashboard.buildCalibrationDashboardSummary(
    [session({ status: "completed" })],
    12,
    3,
  );

  assert.equal(summary.statusLabel, "Complete");
  assert.equal(summary.actionLabel, "View profile");
  assert.equal(summary.progressPercent, 100);
  assert.match(summary.progressLabel, /saved/);
});

test("reports the shortened Version 1.4 feedback progress", () => {
  const summary = dashboard.buildCalibrationDashboardSummary([
    session({
      status: "collecting_feedback",
      numericalFeedback: { accuracy: 4, usefulness: 5 },
    }),
  ], 12, 3);

  assert.equal(summary.actionLabel, "Continue feedback");
  assert.equal(summary.progressLabel, "2 of 3 feedback questions answered");
});
