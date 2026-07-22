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

  assert.match(result.generatedProfile.participantFacingProfile, /pursue growth as quickly as possible/i);
  assert.equal(result.importantDirectQuotes.includes(restraint), true);
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
  assert.match(result.generatedProfile.participantFacingProfile, /Not answered/);
});

test("unusually long answers are preserved without truncation", () => {
  const longAnswer = `Sustainable growth means ${"careful observation ".repeat(600)}`.trim();
  const result = generateInitialBusinessModel(responses({ q12: longAnswer }));

  assert.equal(result.importantDirectQuotes.includes(longAnswer), true);
  assert.match(result.generatedProfile.participantFacingProfile, /careful observation/);
});

test("empty optional-style answers are treated as unknown rather than evidence", () => {
  const result = generateInitialBusinessModel(responses({ q09: "" }));

  assert.equal(result.evidenceReferences.some((item) => item.questionId === "q09"), false);
  assert.equal(result.importantDirectQuotes.includes("Not answered"), false);
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
  assert.equal(result.importantDirectQuotes.includes(clinicalPriority), true);
});

test("important direct quotes preserve the participant’s exact wording", () => {
  const exactPriority = "Keep the business useful — without sacrificing my family's time.";
  const exactEnergy = "Solving the odd problems nobody else wants to touch.";
  const exactPrinciple = "Enough is a strategy, not a failure of ambition.";
  const result = generateInitialBusinessModel(
    responses({ q04: exactPriority, q09: exactEnergy, q12: exactPrinciple }),
  );

  assert.deepEqual(result.importantDirectQuotes, [
    exactPriority,
    exactEnergy,
    exactPrinciple,
  ]);
});

test("fallback profile integrates role answers without awkward grammar", () => {
  const result = generateInitialBusinessModel(responses({ q03: "Does a little of everything" }));
  const narrative = result.generatedProfile.participantFacingProfile;

  assert.match(narrative, /role as “Does a little of everything”/);
  assert.doesNotMatch(narrative, /role as does a little of everything/i);
});
