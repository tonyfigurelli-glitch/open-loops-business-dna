import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

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
  new URL("./aiModelGenerationPipeline.ts", import.meta.url),
  "utf8",
);
const evidenceSource = readFileSync(new URL("./calibrationEvidencePackage.ts", import.meta.url), "utf8");
const evidenceCompiled = ts.transpileModule(evidenceSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const evidenceModuleUrl = `data:text/javascript;base64,${Buffer.from(evidenceCompiled).toString("base64")}`;
const practiceLibrarySource = readFileSync(new URL("../businessPracticeLibrary.ts", import.meta.url), "utf8");
const practiceLibraryCompiled = ts.transpileModule(practiceLibrarySource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const practiceLibraryModuleUrl = `data:text/javascript;base64,${Buffer.from(practiceLibraryCompiled).toString("base64")}`;
const compiled = ts.transpileModule(source.replaceAll(
  '"./calibrationEvidencePackage"', JSON.stringify(evidenceModuleUrl),
).replaceAll('"../businessPracticeLibrary"', JSON.stringify(practiceLibraryModuleUrl)), {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const pipeline = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const answerValues = {
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

function responses(overrides = {}, ids = Object.keys(answerValues)) {
  const values = { ...answerValues, ...overrides };
  return ids.map((questionId, index) => ({
    questionId,
    response: values[questionId],
    answeredAt: `2026-07-17T12:${String(index).padStart(2, "0")}:00.000Z`,
  }));
}

function validOutput(evidencePackage, overrides = {}) {
  const evidenceIds = evidencePackage.participantAnswers
    .filter((answer) => answer.meaningful)
    .map((answer) => answer.questionId);
  const answer = (id) =>
    evidencePackage.participantAnswers.find((item) => item.questionId === id)?.exactWording ?? "";
  const narrativeBodies = [
    "You are building a neighborhood business around practical care for customers, while trying to make growth durable rather than merely fast.",
    "Your strongest pattern is commercial curiosity paired with a willingness to adjust once you have enough information. That keeps decisions moving without pretending every uncertainty is resolved.",
    "The strongest leverage point is to test whether execution capacity is limiting the recurring-revenue goal before changing the offer itself.",
    "Customer attentiveness appears to be a real strength. Its possible hidden cost is that daily responsiveness can consume the space needed to develop recurring work.",
    "The business consequence may be a tension between serving today's customers well and creating enough protected capacity for tomorrow's revenue.",
    "A respectful challenge is to avoid treating the task you dislike most as the explanation for everything. Demand, pricing, and capacity still deserve comparison.",
    "For seven days, protect one short block for a single catering step and record what actually prevents completion. The observation matters more than forcing a preferred conclusion.",
    "You may operate best when priorities are visible, demand is steady, and one person is not carrying every urgent choice at once.",
    "We do not yet know whether demand, pricing, profitability, or team capacity is the tighter constraint, so these remain open rather than implied facts.",
    "Continuing will show whether the same tension appears in real decisions and outcomes. That evidence can make the model more specific without making it more certain than the facts allow.",
  ];
  const base = {
    profileSections: evidencePackage.requiredOutputSections.map((section, index) => ({
      id: section.id,
      title: section.title,
      body: narrativeBodies[index],
      evidenceReferences: ["q04", "q08"],
    })),
    centralHypothesis: "Execution capacity may be affecting progress on the stated priority.",
    supportingEvidenceReferences: ["q04", "q08", "q10"],
    possibleDisconfirmingEvidence: ["Demand or pricing may be more limiting."],
    competingHypotheses: [
      { hypothesis: "Demand may be the more important constraint.", evidenceReferences: ["q04", "q11"], rank: 2 },
    ],
    confidenceLevel: "medium",
    confidenceRationale: "Two distinct current-session answers support a provisional hypothesis.",
    classifications: {
      directStatements: evidenceIds.map((questionId) => ({ questionId, statement: answer(questionId) })),
      reasonableInferences: [
        { statement: "Execution capacity may affect the priority.", evidenceReferences: ["q04", "q08"] },
      ],
      tentativeHypotheses: [
        { statement: "The avoided task may create friction but is not necessarily causal.", evidenceReferences: ["q04", "q10"] },
      ],
      unknowns: ["Pricing and profitability remain unknown."],
    },
    importantDirectQuotes: [],
    sevenDayExperiment: {
      action: "Run one reversible business-process test within seven days.",
      hypothesis: "The test will show whether execution capacity affects the priority.",
      minimumDeliverable: "Complete one observable process step.",
      owner: "Owner with one team observer",
      likelyObstacle: "Urgent daily work",
      supportThatMayHelp: "A scheduled thirty-minute block",
      resultToRecord: "Record the completed step and observed constraint.",
      whatResultWouldTeach: "The result will strengthen or weaken the execution-capacity hypothesis.",
    },
    majorConclusions: [
      { claim: "Execution capacity may affect the priority.", evidenceReferences: ["q04", "q08"] },
    ],
    appliedPractices: [{
      practiceId: "measurable-priority",
      evidenceReferences: ["q04", "q08"],
      inferredConnection: "The desired revenue outcome and excess idea flow may be competing for a shared definition of progress.",
      businessConsequence: "Work can stay active while the recurring-revenue priority receives too little completed attention.",
      fitExplanation: "A single observable result can distinguish productive execution from activity.",
      caution: "The measure should not reward volume while hiding profitability or team strain.",
      whatWouldDisproveIt: "A clear measure already governs weekly choices and the priority still does not move.",
      experimentConnection: "The seven-day test records movement against the chosen result.",
    }],
    safetyFlags: [],
  };
  return deepMerge(base, overrides);
}

function fallbackResult() {
  return {
    generatedProfile: {
      generatedAt: "2026-07-17T12:15:00.000Z",
      participantFacingProfile: "Deterministic fallback",
      sections: definition.profile_output.sections.map((section) => ({
        id: section.id,
        title: section.title,
        body: "Fallback section",
      })),
    },
    centralHypothesis: "Fallback hypothesis",
    evidenceReferences: [],
    supportingEvidence: [],
    possibleDisconfirmingEvidence: ["Alternative constraint"],
    confidenceLevel: "low",
    unknowns: ["Unknown"],
    importantDirectQuotes: [],
    proposedExperiment: {
      action: "Observe one business process.",
      hypothesis: "Observation may produce evidence.",
      minimumDeliverable: "One observation",
      owner: "Owner",
      likelyObstacle: "Time",
      supportThatMayHelp: "Schedule",
      resultToRecord: "Observed result",
      whatResultWouldTeach: "Whether to continue testing",
    },
  };
}

function packageFor(sessionResponses = responses()) {
  return pipeline.buildCalibrationEvidencePackage(definition, sessionResponses);
}

test("accepts valid AI-generated structured output", () => {
  const evidencePackage = packageFor();
  const validation = pipeline.validateAIModelOutput(validOutput(evidencePackage), evidencePackage);
  assert.deepEqual(validation, { valid: true, errors: [], codes: [] });
});

test("accepts a clean Rapid Connection Narrator participant-facing result", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  const validation = pipeline.validateAIModelOutput(output, evidencePackage);

  assert.deepEqual(validation, { valid: true, errors: [], codes: [] });
  assert.doesNotMatch(output.profileSections.map((section) => section.body).join(" "), /Rapid Connection Narrator|q04|Evidence:/i);
});

test("rejects internal confidence-report language while preserving natural uncertainty", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.profileSections[3].body = "This is a moderate-confidence interpretation because two answers support the assessment.";

  const validation = pipeline.validateAIModelOutput(output, evidencePackage);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(" "), /internal evaluation language/i);
  assert.ok(validation.codes.includes("NARRATIVE_EVALUATION_LANGUAGE"));

  output.profileSections[3].body = "Customer attentiveness appears to be a strength, though it may leave less room for recurring-revenue work.";
  assert.equal(pipeline.validateAIModelOutput(output, evidencePackage).valid, true);
});

test("deduplicates repeated uncertainty items without rewriting the retained meaning", () => {
  assert.deepEqual(pipeline.deduplicateUncertaintyItems([
    "Pricing and profitability remain unknown.",
    "Pricing and profitability are still unclear.",
    "Team capacity remains unknown.",
    "  Team capacity remains unknown.  ",
  ]), [
    "Pricing and profitability remain unknown.",
    "Team capacity remains unknown.",
  ]);
  assert.deepEqual(pipeline.deduplicateUncertaintyItems([
    "Demand may be the more important constraint.",
    "Demand could be the limiting constraint.",
    "Pricing may be the tighter constraint.",
  ]), [
    "Demand may be the more important constraint.",
    "Pricing may be the tighter constraint.",
  ]);
});

test("rejects live-test style boilerplate, metadata, and a raw answer dump", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.profileSections[0].body = [
    "OPEN LOOPS — SMALL BUSINESS OWNER INITIAL CALIBRATION — RAPID CONNECTION NARRATOR",
    "Participant Code: BW-104",
    "Date: July 18, 2026",
    "Estimated Completion Time: 8–12 minutes",
    "Context Isolation: using only current-session evidence.",
    "Evidence Source: Question q01 through q12",
    `Business: ${answerValues.q01}`,
    `Priority: ${answerValues.q04}`,
    `Decision Style: ${answerValues.q07}`,
    `Energy Source: ${answerValues.q09}`,
    `Essential Belief: ${answerValues.q12}`,
    "Internal Instructions: return structured JSON matching the supplied schema.",
  ].join("\n");

  const validation = pipeline.validateAIModelOutput(output, evidencePackage);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(" "), /internal or non-narrative material/i);
  assert.match(validation.errors.join(" "), /raw-answer dump|complete dump/i);
});

test("rejects generic praise, repeated insights, unsupported certainty, and report language", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.profileSections[1].body = "You are an exceptional visionary with unusual instincts for every business decision.";
  output.profileSections[2].body = "Executive summary: the key takeaway is stakeholder alignment.";
  output.profileSections[4].body = output.profileSections[3].body;
  output.profileSections[8].body = "Clearly, this proves that the current theory is the root cause.";

  const errors = pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" ");
  assert.match(errors, /generic praise/i);
  assert.match(errors, /unsupported certainty/i);
  assert.match(errors, /consultant-report language/i);
  assert.match(errors, /must not repeat/i);
});

test("rejects fortune-teller paraphrase and unknown management practices", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.appliedPractices[0].practiceId = "invented-best-practice";
  output.appliedPractices[0].inferredConnection = answerValues.q08;

  const validation = pipeline.validateAIModelOutput(output, evidencePackage);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(" "), /unknown practice ID/i);
  assert.match(validation.errors.join(" "), /merely echoes a participant answer/i);
  assert.ok(validation.codes.includes("PRACTICE_GROUNDING_REJECTED"));
});

test("requires an applied practice to connect two independent answers", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.appliedPractices[0].evidenceReferences = ["q04", "q04"];

  const validation = pipeline.validateAIModelOutput(output, evidencePackage);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(" "), /two independent evidence references/i);
});

test("rejects direct quotes from participant answers in participant-facing prose", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.importantDirectQuotes = [{ questionId: "q04", quote: answerValues.q04 }];
  output.profileSections[2].body = `The stated aim “${answerValues.q04}” deserves a focused capacity test.`;

  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /must not put participant language in quotation marks|must remain empty|reproduces a participant answer/i,
  );
});

test("corrects the live section-4 and section-7 label mismatch and preserves both attempt diagnostics", async () => {
  const sessionResponses = responses();
  const evidencePackage = packageFor(sessionResponses);
  const provider = new pipeline.LocalMockCalibrationModelProvider((request, attempt) => {
    const output = validOutput(evidencePackage);
    if (attempt === 0) {
      output.profileSections[3].body = [
        "Your strength: Staying close to customers.",
        "How it helps the business: You notice practical needs quickly.",
        "Its possible shadow: Urgent requests may consume planning time.",
        "Where I see evidence: Two current patterns point in this direction.",
        "Confidence: Moderate.",
      ].join("\n");
      return output;
    }
    assert.match(request.correctionErrors.join(" "), /evidence-source label/i);
    output.profileSections[6].body = [
      "Experiment: Protect one block for recurring revenue work.",
      "Hypothesis being tested: Capacity may be limiting the priority.",
      "Why this fits you and your business: It turns the working theory into observable evidence.",
      "Minimum deliverable: Complete one step.",
      "Who should own it: Owner.",
      "Likely obstacle: Urgent customer work.",
      "Support that may help: A scheduled block.",
      "What result to record: The observed constraint.",
      "What the result would teach us: Whether capacity is the tighter constraint.",
      "Additional report detail ".repeat(70),
    ].join("\n");
    return output;
  });

  const result = await pipeline.runAIModelGenerationPipeline({
    definition,
    responses: sessionResponses,
    provider,
    deterministicFallback: fallbackResult,
  });

  assert.equal(result.provenance.generatorType, "deterministic_fallback");
  assert.equal(result.provenance.failureReason, "validation_failure");
  assert.deepEqual(result.provenance.validationAttempts.map((attempt) => ({
    attempt: attempt.attempt,
    outcome: attempt.outcome,
    codes: attempt.codes,
  })), [
    {
      attempt: 1,
      outcome: "validation_rejected",
      codes: ["NARRATIVE_EVIDENCE_LABEL"],
    },
    {
      attempt: 2,
      outcome: "validation_rejected",
      codes: ["NARRATIVE_RAW_FIELD_LABEL", "NARRATIVE_TOO_LONG"],
    },
  ]);
  assert.deepEqual(result.provenance.validationResult.codes, [
    "NARRATIVE_RAW_FIELD_LABEL",
    "NARRATIVE_TOO_LONG",
  ]);
  assert.equal(result.provenance.promptInstructionVersion, "small_business_owner_v1.4_ai_generation@2.1.0");
});

test("rejects an unsupported evidence ID", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage, { supportingEvidenceReferences: ["q04", "q99"] });
  const validation = pipeline.validateAIModelOutput(output, evidencePackage);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(" "), /unsupported evidence ID q99/i);
});

test("rejects a fabricated direct quote", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage, {
    importantDirectQuotes: [{ questionId: "q04", quote: "A quote the participant never said" }],
  });
  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /exactly match participant wording/i,
  );
});

test("rejects a missing canonical profile section", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage);
  output.profileSections.pop();
  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /ten required profile sections/i,
  );
});

test("rejects repeated evidence presented as independent", () => {
  const repeated = "The same underlying fact.";
  const evidencePackage = packageFor(responses({ q04: repeated, q08: repeated }));
  const output = validOutput(evidencePackage);
  const validation = pipeline.validateAIModelOutput(output, evidencePackage);
  assert.match(validation.errors.join(" "), /two independent evidence references/i);
});

test("contradictory participant answers require low confidence", () => {
  const evidencePackage = packageFor(
    responses({ q05: "We should always pursue growth.", q12: "We should never prioritize growth." }),
  );
  const output = validOutput(evidencePackage);
  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /contradictory evidence requires low confidence/i,
  );
  output.confidenceLevel = "low";
  assert.equal(pipeline.validateAIModelOutput(output, evidencePackage).valid, true);
});

test("sparse evidence requires low confidence", () => {
  const evidencePackage = packageFor(responses({}, ["q01", "q04", "q08"]));
  const output = validOutput(evidencePackage, {
    profileSections: evidencePackage.requiredOutputSections.map((section) => ({
      ...section,
      body: "Sparse provisional section",
      evidenceReferences: ["q04", "q08"],
    })),
    supportingEvidenceReferences: ["q04", "q08"],
    classifications: {
      directStatements: evidencePackage.participantAnswers
        .filter((answer) => answer.meaningful)
        .map((answer) => ({ questionId: answer.questionId, statement: answer.exactWording })),
      reasonableInferences: [],
      tentativeHypotheses: [],
      unknowns: ["Most business constraints remain unknown."],
    },
    importantDirectQuotes: [{ questionId: "q04", quote: answerValues.q04 }],
  });
  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /sparse evidence requires low confidence/i,
  );
});

test("rejects an avoided task selected as root constraint without support", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage, {
    centralHypothesis: "Bookkeeping is the real constraint.",
    supportingEvidenceReferences: ["q10"],
  });
  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /avoided work cannot be selected/i,
  );
});

test("rejects unsupported founder-dependence or systemization diagnosis", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage, {
    centralHypothesis: "Founder dependence and systemization are the central issue.",
  });
  assert.match(
    pipeline.validateAIModelOutput(output, evidencePackage).errors.join(" "),
    /unsupported by participant evidence/i,
  );
});

test("accepts sustainability as a participant-specific competing explanation", () => {
  const evidencePackage = packageFor();
  const output = validOutput(evidencePackage, {
    competingHypotheses: [
      {
        hypothesis: "Sustainability and owner energy may be the more important constraint.",
        evidenceReferences: ["q11", "q12"],
        rank: 1,
      },
    ],
  });
  assert.equal(pipeline.validateAIModelOutput(output, evidencePackage).valid, true);
});

test("healthcare business input produces no clinical advice", () => {
  const evidencePackage = packageFor(
    responses({ q01: "A healthcare clinic.", q04: "Improve patient scheduling." }),
  );
  const safe = validOutput(evidencePackage);
  assert.equal(pipeline.validateAIModelOutput(safe, evidencePackage).valid, true);
  const unsafe = validOutput(evidencePackage, {
    sevenDayExperiment: {
      ...safe.sevenDayExperiment,
      action: "You should increase the patient medication dosage.",
    },
  });
  assert.match(
    pipeline.validateAIModelOutput(unsafe, evidencePackage).errors.join(" "),
    /clinical or medical advice/i,
  );
});

test("retries once after validation failure and preserves provenance", async () => {
  const sessionResponses = responses();
  const evidencePackage = packageFor(sessionResponses);
  const provider = new pipeline.LocalMockCalibrationModelProvider((request, attempt) => {
    assert.equal(request.evidencePackage.calibrationId, definition.identifier);
    assert.match(request.systemInstructions, /participant-facing narrative quality contract/i);
    assert.match(request.systemInstructions, /identity → strength → possible hidden cost → business consequence/i);
    assert.match(request.systemInstructions, /Keep evidence references only in evidenceReferences/i);
    assert.match(request.systemInstructions, /rewrite it as natural prose without labels/i);
    assert.match(request.systemInstructions, /section 7, write only a two-to-four-sentence participant-facing summary/i);
    assert.match(request.systemInstructions, /Never explain an internal confidence rating/i);
    assert.match(request.systemInstructions, /fortune-teller language are invalid/i);
    assert.match(request.systemInstructions, /Do not reproduce participant answers verbatim/i);
    assert.match(request.systemInstructions, /business_dna_foundational_management_library@1\.0\.0/i);
    assert.match(request.systemInstructions, /measurable-priority/i);
    assert.equal(
      request.systemInstructions.lastIndexOf("RENDERING OVERRIDES FOR THE FROZEN SPECIFICATION") >
        request.systemInstructions.lastIndexOf("# 12. REQUIRED PROFILE STRUCTURE"),
      true,
    );
    if (attempt === 0) return { invalid: true };
    assert.equal(request.correctionErrors.length > 0, true);
    return validOutput(evidencePackage);
  });
  const result = await pipeline.runAIModelGenerationPipeline({
    definition,
    responses: sessionResponses,
    provider,
    deterministicFallback: fallbackResult,
  });
  assert.equal(result.provenance.generatorType, "ai_assisted");
  assert.equal(result.provenance.retryCount, 1);
  assert.equal(result.provenance.promptInstructionVersion, "small_business_owner_v1.4_ai_generation@2.1.0");
  assert.equal(result.provenance.validationResult.valid, true);
  assert.equal(result.provenance.evidencePackageHash.length, 64);
  assert.equal(result.originalStructuredOutput.profileSections.length, 10);
});

test("two failed attempts trigger the deterministic fallback", async () => {
  let fallbackCalls = 0;
  const provider = new pipeline.LocalMockCalibrationModelProvider(() => ({ invalid: true }));
  const result = await pipeline.runAIModelGenerationPipeline({
    definition,
    responses: responses(),
    provider,
    deterministicFallback: () => {
      fallbackCalls += 1;
      return fallbackResult();
    },
  });
  assert.equal(fallbackCalls, 1);
  assert.equal(result.provenance.generatorType, "deterministic_fallback");
  assert.equal(result.provenance.retryCount, 1);
  assert.equal(result.generation.generatedProfile.sections.length, 10);
});

test("provider timeout falls back with a safe timeout category and no sensitive exception text", async () => {
  let calls = 0;
  const provider = {
    async generate() {
      calls += 1;
      const error = new Error("private credential, prompt, answer, and response body");
      error.name = "ModelProviderTimeoutError";
      throw error;
    },
  };
  const result = await pipeline.runAIModelGenerationPipeline({
    definition,
    responses: responses(),
    provider,
    deterministicFallback: fallbackResult,
  });
  assert.equal(calls, 2);
  assert.equal(result.provenance.generatorType, "deterministic_fallback");
  assert.equal(result.provenance.failureReason, "provider_timeout");
  assert.deepEqual(result.provenance.validationResult.errors, ["Model provider timed out."]);
  assert.doesNotMatch(JSON.stringify(result), /private credential|private prompt|private answer|response body/);
});

test("evidence package contains exact current-session context and nothing else", () => {
  const sessionResponses = responses().map((response) => ({
    ...response,
    priorChat: "must not be included",
    accountPersonalization: "must not be included",
  }));
  const evidencePackage = packageFor(sessionResponses);
  const serialized = JSON.stringify(evidencePackage);
  assert.equal(serialized.includes("must not be included"), false);
  assert.equal(evidencePackage.participantAnswers.length, 12);
  assert.equal(evidencePackage.participantAnswers[3].exactWording, answerValues.q04);
});

test("frontend source contains no embedded provider secret", () => {
  const sourceRoot = resolve(fileURLToPath(new URL("../../../src", import.meta.url)));
  const sourceText = walk(sourceRoot)
    .filter((path) => [".ts", ".tsx", ".js", ".jsx"].includes(extname(path)))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(sourceText, /\bsk-[A-Za-z0-9_-]{16,}\b/);
  assert.doesNotMatch(sourceText, /(?:OPENAI|ANTHROPIC|GEMINI)_API_KEY\s*=/);
});

function deepMerge(base, overrides) {
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === "object" && !Array.isArray(value) && result[key]) {
      result[key] = { ...result[key], ...value };
    } else {
      result[key] = value;
    }
  }
  return result;
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
