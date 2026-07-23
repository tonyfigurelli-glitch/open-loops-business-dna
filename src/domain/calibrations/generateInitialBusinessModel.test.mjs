import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const definition = JSON.parse(
  readFileSync(
    new URL(
      "../../../Business DNA/calibrations/small-business-owner/v1.3.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const source = readFileSync(
  new URL("./generateInitialBusinessModel.ts", import.meta.url),
  "utf8",
).replace(
  'import { smallBusinessOwnerCalibration } from "./smallBusinessOwnerCalibration";',
  `const smallBusinessOwnerCalibration = ${JSON.stringify(definition)};`,
).replace(
  'import { BUSINESS_PRACTICE_LIBRARY_VERSION } from "../businessPracticeLibrary";',
  'const BUSINESS_PRACTICE_LIBRARY_VERSION = "business_dna_foundational_management_library@1.0.0";',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { generateInitialBusinessModel } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const baseAnswers = {
  q01: "A neighborhood bakery serving local customers.",
  q02: "2–5 people",
  q03: "Does a little of everything",
  q04: "Increase recurring catering revenue.",
  q05: "Growth and opportunity",
  q06: "Customer experience",
  q07: "Act when I have enough information and adjust afterward",
  q08: "We generate more ideas than we can execute",
  q09: "Helping customers solve meaningful problems.",
  q10: "Bookkeeping and monthly reconciliation.",
  q11: "The team had clear priorities and demand was steady.",
  q12: "Growth should remain sustainable for the team.",
};

function responses(overrides = {}, includedIds = Object.keys(baseAnswers)) {
  const values = { ...baseAnswers, ...overrides };
  return includedIds.map((questionId, index) => ({
    questionId,
    response: values[questionId],
    answeredAt: `2026-07-17T12:${String(index).padStart(2, "0")}:00.000Z`,
  }));
}

test("insufficient evidence never produces high confidence", () => {
  const result = generateInitialBusinessModel(
    responses({ q08: "", q10: "" }, ["q04", "q08", "q10"]),
  );

  assert.equal(result.confidenceLevel, "low");
  assert.equal(result.supportingEvidence.length, 1);
  assert.notEqual(result.confidenceLevel, "high");
});

test("contradictory answers remain visible and do not produce high confidence", () => {
  const growth = "Pursue growth as quickly as possible.";
  const restraint = "Never grow when it could reduce stability or sustainability.";
  const result = generateInitialBusinessModel(
    responses({ q05: growth, q12: restraint }),
  );

  assert.equal(result.evidenceReferences.some((item) => item.summary === growth), true);
  assert.equal(result.evidenceReferences.some((item) => item.summary === restraint), true);
  assert.doesNotMatch(result.generatedProfile.participantFacingProfile, /pursue growth as quickly as possible/i);
  assert.notEqual(result.confidenceLevel, "high");
  assert.equal(
    result.possibleDisconfirmingEvidence.some((item) => /contradictory or ambiguous/i.test(item)),
    true,
  );
});

test("an avoided task is not selected as the primary constraint", () => {
  const avoidedTask = "Bookkeeping and monthly reconciliation.";
  const result = generateInitialBusinessModel(responses({ q10: avoidedTask }));

  assert.equal(result.centralHypothesis.includes(avoidedTask), false);
  assert.match(result.centralHypothesis, /not a selected root constraint/i);
  assert.equal(
    result.possibleDisconfirmingEvidence.some((item) => /avoided activity may not constrain/i.test(item)),
    true,
  );
});

test("retains viable alternative explanations", () => {
  const result = generateInitialBusinessModel(responses());
  const alternatives = result.possibleDisconfirmingEvidence.join(" ");

  assert.match(alternatives, /demand/i);
  assert.match(alternatives, /pricing/i);
  assert.match(alternatives, /staffing/i);
  assert.match(alternatives, /capacity/i);
});

test("includes sustainability as a possible missing constraint", () => {
  const result = generateInitialBusinessModel(responses());

  assert.equal(
    [...result.unknowns, ...result.possibleDisconfirmingEvidence].some((item) =>
      /sustainability/i.test(item),
    ),
    true,
  );
});

test("sparse answers produce ten provisional sections and low confidence", () => {
  const result = generateInitialBusinessModel(responses({}, ["q01", "q04"]));

  assert.equal(result.generatedProfile.sections.length, 10);
  assert.equal(result.confidenceLevel, "low");
  assert.match(result.generatedProfile.participantFacingProfile, /not enough independent evidence/i);
});

test("unusually long answers remain in the inspectable evidence but not the participant narrative", () => {
  const longAnswer = `Sustainable growth means ${"careful observation ".repeat(600)}`.trim();
  const result = generateInitialBusinessModel(responses({ q12: longAnswer }));

  assert.equal(result.evidenceReferences.some((item) => item.summary === longAnswer), true);
  assert.equal(result.importantDirectQuotes.length, 0);
  assert.doesNotMatch(result.generatedProfile.participantFacingProfile, /careful observation/);
});

test("empty optional-style answers are treated as unknown rather than evidence", () => {
  const result = generateInitialBusinessModel(responses({ q09: "" }));

  assert.equal(result.evidenceReferences.some((item) => item.questionId === "q09"), false);
  assert.equal(result.importantDirectQuotes.length, 0);
  assert.equal(result.generatedProfile.sections.length, 10);
});

test("healthcare-related business answers do not become medical advice", () => {
  const clinicalPriority = "Change patient medication dosage to improve outcomes.";
  const result = generateInitialBusinessModel(
    responses({ q04: clinicalPriority, q10: "Reviewing clinical treatment plans." }),
  );

  assert.match(result.proposedExperiment.action, /non-clinical/i);
  assert.match(result.proposedExperiment.action, /do not use this calibration/i);
  assert.equal(result.proposedExperiment.action.includes("medication dosage"), false);
  assert.equal(result.importantDirectQuotes.length, 0);
});

test("participant-facing narrative never repeats stored answers as direct quotes", () => {
  const exactPriority = "Keep the business useful — without sacrificing my family's time.";
  const exactEnergy = "Solving the odd problems nobody else wants to touch.";
  const exactPrinciple = "Enough is a strategy, not a failure of ambition.";
  const result = generateInitialBusinessModel(
    responses({ q04: exactPriority, q09: exactEnergy, q12: exactPrinciple }),
  );

  assert.deepEqual(result.importantDirectQuotes, []);
  const narrative = result.generatedProfile.participantFacingProfile;
  assert.equal(narrative.includes(exactPriority), false);
  assert.equal(narrative.includes(exactEnergy), false);
  assert.equal(narrative.includes(exactPrinciple), false);
  assert.doesNotMatch(narrative, /[“”"]/);
});

test("fallback profile synthesizes the role instead of inserting the selected answer", () => {
  const result = generateInitialBusinessModel(responses({ q03: "Does a little of everything" }));
  const narrative = result.generatedProfile.participantFacingProfile;

  assert.match(narrative, /owner role that still crosses delivery, people, opportunity, and daily operations/i);
  assert.doesNotMatch(narrative, /does a little of everything/i);
});

test("fallback identifies a compound commercial and team priority and proposes a connected test", () => {
  const result = generateInitialBusinessModel(responses({
    q01: "I own a restaurant.",
    q02: "6–15 people",
    q04: "Increased sales and profitability, along with a well trained motivated team.",
    q09: "The guest interaction and seeing team members motivated by my words.",
  }));
  const narrative = result.generatedProfile.participantFacingProfile;

  assert.match(narrative, /two different jobs/i);
  assert.match(narrative, /economic result/i);
  assert.match(narrative, /owner-mediated/i);
  assert.match(result.proposedExperiment.action, /guest-facing behavior/i);
  assert.match(result.proposedExperiment.action, /one team member/i);
  assert.doesNotMatch(narrative, /Increased sales and profitability/i);
  assert.doesNotMatch(narrative, /guest interaction and seeing team members/i);
});
