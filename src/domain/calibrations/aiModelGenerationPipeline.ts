import type {
  CalibrationEvidenceReference,
  CalibrationGenerationProvenance,
  CalibrationGenerationResult,
  CalibrationResponse,
  ConfidenceLevel,
} from "../models";
import {
  buildCalibrationEvidencePackage,
  hashCalibrationEvidencePackage,
  type CalibrationDefinition,
  type CalibrationEvidenceAnswer,
  type CalibrationEvidencePackage,
} from "./calibrationEvidencePackage";

export { buildCalibrationEvidencePackage } from "./calibrationEvidencePackage";
export type { CalibrationDefinition, CalibrationEvidenceAnswer, CalibrationEvidencePackage } from "./calibrationEvidencePackage";

export const AI_GENERATION_INSTRUCTION_VERSION =
  "small_business_owner_v1.3_ai_generation@1.1.2";

export type AIModelOutput = {
  profileSections: Array<{
    id: string;
    title: string;
    body: string;
    evidenceReferences: string[];
  }>;
  centralHypothesis: string;
  supportingEvidenceReferences: string[];
  possibleDisconfirmingEvidence: string[];
  competingHypotheses: Array<{
    hypothesis: string;
    evidenceReferences: string[];
    rank: number;
  }>;
  confidenceLevel: "low" | "medium" | "high";
  confidenceRationale: string;
  classifications: {
    directStatements: Array<{ questionId: string; statement: string }>;
    reasonableInferences: Array<{ statement: string; evidenceReferences: string[] }>;
    tentativeHypotheses: Array<{ statement: string; evidenceReferences: string[] }>;
    unknowns: string[];
  };
  importantDirectQuotes: Array<{ questionId: string; quote: string }>;
  sevenDayExperiment: {
    action: string;
    hypothesis: string;
    minimumDeliverable: string;
    owner: string;
    likelyObstacle: string;
    supportThatMayHelp: string;
    resultToRecord: string;
    whatResultWouldTeach: string;
  };
  majorConclusions: Array<{ claim: string; evidenceReferences: string[] }>;
  safetyFlags: string[];
};

export type ModelProviderRequest = {
  systemInstructions: string;
  evidencePackage: CalibrationEvidencePackage;
  structuredOutputSchema: typeof aiModelOutputSchema;
  modelConfiguration: { temperature: number; maxOutputTokens: number };
  correctionErrors: string[];
};

export type ModelProviderResponse = {
  structuredResult: unknown;
  provider: string;
  modelIdentifier: string;
  generationTimestamp: string;
  usage?: Record<string, number>;
};

export interface CalibrationModelProvider {
  generate(request: ModelProviderRequest): Promise<ModelProviderResponse>;
}

export class UnavailableCalibrationModelProvider implements CalibrationModelProvider {
  async generate(): Promise<ModelProviderResponse> {
    throw new Error("Secure server-side calibration model provider is not configured.");
  }
}

export class LocalMockCalibrationModelProvider implements CalibrationModelProvider {
  private readonly responder: (
    request: ModelProviderRequest,
    attempt: number,
  ) => unknown | Promise<unknown>;
  private readonly provider: string;
  private readonly modelIdentifier: string;

  constructor(
    responder: (
      request: ModelProviderRequest,
      attempt: number,
    ) => unknown | Promise<unknown>,
    provider = "local_mock",
    modelIdentifier = "local-structured-mock",
  ) {
    this.responder = responder;
    this.provider = provider;
    this.modelIdentifier = modelIdentifier;
  }

  private attempt = 0;

  async generate(request: ModelProviderRequest): Promise<ModelProviderResponse> {
    const attempt = this.attempt;
    this.attempt += 1;
    return {
      structuredResult: await this.responder(request, attempt),
      provider: this.provider,
      modelIdentifier: this.modelIdentifier,
      generationTimestamp: new Date().toISOString(),
    };
  }
}

export const aiModelOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "profileSections",
    "centralHypothesis",
    "supportingEvidenceReferences",
    "possibleDisconfirmingEvidence",
    "competingHypotheses",
    "confidenceLevel",
    "confidenceRationale",
    "classifications",
    "importantDirectQuotes",
    "sevenDayExperiment",
    "majorConclusions",
    "safetyFlags",
  ],
  properties: {
    profileSections: { type: "array", minItems: 10, maxItems: 10, items: {
      type: "object", additionalProperties: false, required: ["id", "title", "body", "evidenceReferences"],
      properties: { id: { type: "string" }, title: { type: "string" }, body: { type: "string" },
        evidenceReferences: { type: "array", items: { type: "string" } } },
    } },
    centralHypothesis: { type: "string" },
    supportingEvidenceReferences: { type: "array", items: { type: "string" } },
    possibleDisconfirmingEvidence: { type: "array", items: { type: "string" } },
    competingHypotheses: { type: "array", items: {
      type: "object", additionalProperties: false, required: ["hypothesis", "evidenceReferences", "rank"],
      properties: { hypothesis: { type: "string" }, evidenceReferences: { type: "array", items: { type: "string" } }, rank: { type: "integer" } },
    } },
    confidenceLevel: { type: "string", enum: ["low", "medium"] },
    confidenceRationale: { type: "string" },
    classifications: { type: "object", additionalProperties: false,
      required: ["directStatements", "reasonableInferences", "tentativeHypotheses", "unknowns"],
      properties: {
        directStatements: { type: "array", items: { type: "object", additionalProperties: false,
          required: ["questionId", "statement"], properties: { questionId: { type: "string" }, statement: { type: "string" } } } },
        reasonableInferences: { type: "array", items: classificationSchema() },
        tentativeHypotheses: { type: "array", items: classificationSchema() },
        unknowns: { type: "array", items: { type: "string" } },
      },
    },
    importantDirectQuotes: { type: "array", items: { type: "object", additionalProperties: false,
      required: ["questionId", "quote"], properties: { questionId: { type: "string" }, quote: { type: "string" } } } },
    sevenDayExperiment: { type: "object", additionalProperties: false,
      required: ["action", "hypothesis", "minimumDeliverable", "owner", "likelyObstacle", "supportThatMayHelp", "resultToRecord", "whatResultWouldTeach"],
      properties: Object.fromEntries(["action", "hypothesis", "minimumDeliverable", "owner", "likelyObstacle", "supportThatMayHelp", "resultToRecord", "whatResultWouldTeach"].map((key) => [key, { type: "string" }])) },
    majorConclusions: { type: "array", items: { type: "object", additionalProperties: false,
      required: ["claim", "evidenceReferences"], properties: { claim: { type: "string" }, evidenceReferences: { type: "array", items: { type: "string" } } } } },
    safetyFlags: { type: "array", items: { type: "string" } },
  },
} as const;

function classificationSchema() {
  return { type: "object", additionalProperties: false, required: ["statement", "evidenceReferences"],
    properties: { statement: { type: "string" }, evidenceReferences: { type: "array", items: { type: "string" } } } } as const;
}

type PipelineInput = {
  definition: CalibrationDefinition;
  responses: CalibrationResponse[];
  provider: CalibrationModelProvider;
  deterministicFallback: (responses: CalibrationResponse[]) => CalibrationGenerationResult;
  promptInstructionVersion?: string;
};

export type ModelGenerationPipelineResult = {
  generation: CalibrationGenerationResult;
  provenance: CalibrationGenerationProvenance;
  originalStructuredOutput?: Record<string, unknown>;
};

export async function runAIModelGenerationPipeline({
  definition,
  responses,
  provider,
  deterministicFallback,
  promptInstructionVersion = AI_GENERATION_INSTRUCTION_VERSION,
}: PipelineInput): Promise<ModelGenerationPipelineResult> {
  const evidencePackage = buildCalibrationEvidencePackage(definition, responses);
  const evidencePackageHash = await hashCalibrationEvidencePackage(evidencePackage);
  const systemInstructions = buildSystemInstructions(definition);
  let validationErrors: string[] = [];
  let validationCodes: string[] = [];
  const validationAttempts: NonNullable<CalibrationGenerationProvenance["validationAttempts"]> = [];
  let lastProvider = "unavailable";
  let lastModelIdentifier = "unavailable";
  let lastUsage: Record<string, number> | undefined;
  let lastFailureReason: CalibrationGenerationProvenance["failureReason"];

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await provider.generate({
        systemInstructions,
        evidencePackage,
        structuredOutputSchema: aiModelOutputSchema,
        modelConfiguration: { temperature: 0.2, maxOutputTokens: 6000 },
        correctionErrors: validationErrors,
      });
      lastProvider = response.provider;
      lastModelIdentifier = response.modelIdentifier;
      lastUsage = response.usage;
      const validation = validateAIModelOutput(response.structuredResult, evidencePackage);
      validationAttempts.push({
        attempt: attempt + 1,
        outcome: validation.valid ? "accepted" : "validation_rejected",
        codes: validation.codes,
        errors: validation.errors,
      });

      if (validation.valid) {
        const output = response.structuredResult as AIModelOutput;
        return {
          generation: mapAIOutputToGeneration(output, evidencePackage),
          provenance: {
            generatorType: "ai_assisted",
            provider: response.provider,
            modelIdentifier: response.modelIdentifier,
            promptInstructionVersion,
            calibrationVersion: definition.version,
            frozenCalibrationHash: definition.canonical_source.sha256,
            generationTimestamp: response.generationTimestamp,
            validationResult: validation,
            validationAttempts,
            retryCount: attempt,
            evidencePackageHash,
            usage: response.usage,
          },
          originalStructuredOutput: output as unknown as Record<string, unknown>,
        };
      }

      validationErrors = validation.errors;
      validationCodes = validation.codes;
      lastFailureReason = "validation_failure";
    } catch (error) {
      lastFailureReason = isProviderTimeout(error) ? "provider_timeout" : "provider_failure";
      validationErrors = [lastFailureReason === "provider_timeout"
        ? "Model provider timed out."
        : "Model provider generation failed."];
      validationCodes = [lastFailureReason === "provider_timeout"
        ? "PROVIDER_TIMEOUT"
        : "PROVIDER_FAILURE"];
      validationAttempts.push({
        attempt: attempt + 1,
        outcome: lastFailureReason,
        codes: validationCodes,
        errors: validationErrors,
      });
    }
  }

  const generationTimestamp = new Date().toISOString();
  return {
    generation: deterministicFallback(responses),
    provenance: {
      generatorType: "deterministic_fallback",
      provider: lastProvider,
      modelIdentifier: lastModelIdentifier,
      promptInstructionVersion,
      calibrationVersion: definition.version,
      frozenCalibrationHash: definition.canonical_source.sha256,
      generationTimestamp,
      validationResult: { valid: false, errors: validationErrors, codes: validationCodes },
      validationAttempts,
      retryCount: 1,
      evidencePackageHash,
      usage: lastUsage,
      failureReason: lastFailureReason,
    },
  };
}

function isProviderTimeout(error: unknown) {
  return error instanceof Error && ["ModelProviderTimeoutError", "TimeoutError", "AbortError"].includes(error.name);
}

export function validateAIModelOutput(
  candidate: unknown,
  evidencePackage: CalibrationEvidencePackage,
) {
  const errors: string[] = [];
  if (!isRecord(candidate)) {
    const errors = ["Output must be an object."];
    return { valid: false, errors, codes: errors.map(validationFailureCode) };
  }

  const output = candidate as Partial<AIModelOutput>;
  const requiredArrays = [
    "profileSections",
    "supportingEvidenceReferences",
    "possibleDisconfirmingEvidence",
    "competingHypotheses",
    "importantDirectQuotes",
    "majorConclusions",
    "safetyFlags",
  ] as const;
  for (const key of requiredArrays) if (!Array.isArray(output[key])) errors.push(`${key} must be an array.`);
  if (!isRecord(output.classifications)) errors.push("classifications must be present.");
  if (!isRecord(output.sevenDayExperiment)) errors.push("sevenDayExperiment must be present.");
  if (!nonEmpty(output.centralHypothesis)) errors.push("centralHypothesis is required.");
  if (!nonEmpty(output.confidenceRationale)) errors.push("confidenceRationale is required.");
  if (output.confidenceLevel === "high") errors.push("High confidence is not allowed in Version 1.3.");
  if (!["low", "medium"].includes(output.confidenceLevel ?? "")) errors.push("Confidence must be low or medium.");

  const sections = Array.isArray(output.profileSections) ? output.profileSections : [];
  if (sections.length !== evidencePackage.requiredOutputSections.length) {
    errors.push("All ten required profile sections must be present.");
  }
  evidencePackage.requiredOutputSections.forEach((required, index) => {
    const section = sections[index];
    if (!section || section.id !== required.id || section.title !== required.title) {
      errors.push(`Profile section ${required.order} must use canonical ID and title.`);
    }
    if (!section || !nonEmpty(section.body)) errors.push(`Profile section ${required.order} requires body text.`);
    if (!section || !Array.isArray(section.evidenceReferences)) {
      errors.push(`Profile section ${required.order} requires evidence references.`);
    }
  });
  validateParticipantFacingNarrative(
    sections,
    evidencePackage,
    Array.isArray(output.importantDirectQuotes) ? output.importantDirectQuotes : [],
    errors,
  );

  const validAnswers = new Map(
    evidencePackage.participantAnswers
      .filter((answer) => answer.meaningful)
      .map((answer) => [answer.questionId, answer]),
  );
  const validateReferences = (references: unknown, label: string) => {
    if (!Array.isArray(references)) return;
    for (const reference of references) {
      if (typeof reference !== "string" || !validAnswers.has(reference)) {
        errors.push(`${label} contains unsupported evidence ID ${String(reference)}.`);
      }
    }
  };
  sections.forEach((section, index) => validateReferences(section?.evidenceReferences, `Section ${index + 1}`));
  validateReferences(output.supportingEvidenceReferences, "Supporting evidence");
  for (const conclusion of Array.isArray(output.majorConclusions) ? output.majorConclusions : []) {
    validateReferences(conclusion?.evidenceReferences, "Major conclusion");
    if (!nonEmpty(conclusion?.claim)) errors.push("Every major conclusion requires a claim.");
    if (output.confidenceLevel === "medium") {
      const independent = independentEvidenceCount(conclusion?.evidenceReferences, validAnswers);
      if (independent < 2) errors.push("Moderate-confidence major conclusions require two independent evidence references.");
    }
  }
  for (const hypothesis of Array.isArray(output.competingHypotheses) ? output.competingHypotheses : []) {
    validateReferences(hypothesis?.evidenceReferences, "Competing hypothesis");
  }

  const classifications: Record<string, any> = isRecord(output.classifications)
    ? output.classifications
    : {};
  for (const key of ["directStatements", "reasonableInferences", "tentativeHypotheses", "unknowns"]) {
    if (!Array.isArray(classifications[key])) errors.push(`classifications.${key} must be present.`);
  }
  for (const statement of Array.isArray(classifications.directStatements) ? classifications.directStatements : []) {
    const answer = validAnswers.get(statement?.questionId);
    if (!answer || statement.statement !== answer.exactWording) {
      errors.push("Direct statements must exactly match current-session answers.");
    }
  }
  for (const key of ["reasonableInferences", "tentativeHypotheses"] as const) {
    for (const item of Array.isArray(classifications[key]) ? classifications[key] : []) {
      validateReferences(item?.evidenceReferences, `classifications.${key}`);
    }
  }
  for (const quote of Array.isArray(output.importantDirectQuotes) ? output.importantDirectQuotes : []) {
    const answer = validAnswers.get(quote?.questionId);
    if (!answer || quote.quote !== answer.exactWording) errors.push("Direct quotes must exactly match participant wording.");
  }

  const completeText = JSON.stringify(candidate);
  if (containsClinicalAdvice(completeText)) errors.push("Output contains clinical or medical advice.");
  if (/\b(?:from (?:your )?prior|previous profile|saved memory|earlier chat|outside research|account history)\b/i.test(completeText)) {
    errors.push("Output claims access to prohibited prior information.");
  }
  const avoidedTaskClaim = /\b(?:real|root|primary) (?:problem|constraint|issue)\b/i.test(output.centralHypothesis ?? "");
  if (avoidedTaskClaim) {
    const refs = Array.isArray(output.supportingEvidenceReferences) ? output.supportingEvidenceReferences : [];
    const independentBeyondAvoidance = refs.filter((id) => id !== "q10");
    if (refs.includes("q10") && independentEvidenceCount(independentBeyondAvoidance, validAnswers) < 1) {
      errors.push("Avoided work cannot be selected as the root constraint without additional evidence.");
    }
  }
  const founderDefault = /\b(?:founder dependence|founder-dependent|systemization|delegat\w*)\b/i.test(output.centralHypothesis ?? "");
  const participantUsedFounderPattern = evidencePackage.participantAnswers.some((answer) =>
    /\b(?:founder dependence|founder-dependent|systemization|delegat\w*)\b/i.test(answer.exactWording),
  );
  if (founderDefault && !participantUsedFounderPattern) errors.push("Founder dependence or systemization is unsupported by participant evidence.");

  if (evidencePackage.qualitySignals.meaningfulAnswerCount < 6 && output.confidenceLevel !== "low") {
    errors.push("Sparse evidence requires low confidence.");
  }
  if (evidencePackage.qualitySignals.hasContradiction && output.confidenceLevel !== "low") {
    errors.push("Contradictory evidence requires low confidence.");
  }
  validateExperiment(output.sevenDayExperiment, errors);
  return { valid: errors.length === 0, errors, codes: errors.map(validationFailureCode) };
}

function validationFailureCode(error: string) {
  if (/evidence-source label/i.test(error)) return "NARRATIVE_EVIDENCE_LABEL";
  if (/raw field label/i.test(error)) return "NARRATIVE_RAW_FIELD_LABEL";
  if (/date or completion metadata/i.test(error)) return "NARRATIVE_DATE_METADATA";
  if (/participant metadata/i.test(error)) return "NARRATIVE_PARTICIPANT_METADATA";
  if (/question identifier/i.test(error)) return "NARRATIVE_QUESTION_IDENTIFIER";
  if (/calibration boilerplate|internal narrator label|internal instruction or prompt text/i.test(error)) return "NARRATIVE_INTERNAL_BOILERPLATE";
  if (/consultant-report language/i.test(error)) return "NARRATIVE_REPORT_LANGUAGE";
  if (/internal evaluation language/i.test(error)) return "NARRATIVE_EVALUATION_LANGUAGE";
  if (/generic praise/i.test(error)) return "NARRATIVE_GENERIC_PRAISE";
  if (/unsupported certainty/i.test(error)) return "NARRATIVE_UNSUPPORTED_CERTAINTY";
  if (/must be concise/i.test(error)) return "NARRATIVE_TOO_LONG";
  if (/same insight|same narrative sentence/i.test(error)) return "NARRATIVE_REPETITION";
  if (/raw-answer dump|complete dump/i.test(error)) return "NARRATIVE_ANSWER_DUMP";
  if (/verbatim without declaring|direct quotes must be used naturally/i.test(error)) return "NARRATIVE_QUOTE_USE";
  if (/repeat canonical section titles/i.test(error)) return "NARRATIVE_CANONICAL_TITLE";
  if (/clinical or medical advice/i.test(error)) return "SAFETY_CLINICAL_ADVICE";
  if (/prohibited prior information/i.test(error)) return "CONTEXT_ISOLATION_VIOLATION";
  if (/evidence ID|evidence references|independent evidence|participant evidence/i.test(error)) return "EVIDENCE_DISCIPLINE_REJECTED";
  if (/confidence/i.test(error)) return "CONFIDENCE_DISCIPLINE_REJECTED";
  if (/seven-day experiment|sevenDayExperiment/i.test(error)) return "EXPERIMENT_INVALID";
  if (/profile section|ten required profile sections/i.test(error)) return "CANONICAL_SECTION_INVALID";
  if (/must exactly match participant wording|Direct statements/i.test(error)) return "DIRECT_EVIDENCE_INVALID";
  return "OUTPUT_VALIDATION_REJECTED";
}

function mapAIOutputToGeneration(
  output: AIModelOutput,
  evidencePackage: CalibrationEvidencePackage,
): CalibrationGenerationResult {
  const answerById = new Map(evidencePackage.participantAnswers.map((answer) => [answer.questionId, answer]));
  const evidenceReferences = output.classifications.directStatements.map((statement) => ({
    questionId: statement.questionId,
    classification: "direct_statement" as const,
    summary: statement.statement,
  }));
  const supportingEvidence: CalibrationEvidenceReference[] = output.supportingEvidenceReferences.map((questionId) => ({
    questionId,
    classification: "reasonable_inference",
    summary: answerById.get(questionId)?.exactWording ?? "",
  }));
  const confidenceLevel: ConfidenceLevel = output.confidenceLevel;

  return {
    generatedProfile: {
      generatedAt: new Date().toISOString(),
      participantFacingProfile: output.profileSections
        .map((section) => `${section.title}\n${section.body}`)
        .join("\n\n"),
      sections: output.profileSections.map(({ id, title, body }) => ({ id, title, body })),
    },
    centralHypothesis: output.centralHypothesis,
    evidenceReferences,
    supportingEvidence,
    possibleDisconfirmingEvidence: deduplicateUncertaintyItems([
      ...output.possibleDisconfirmingEvidence,
      ...output.competingHypotheses.map((item) => item.hypothesis),
    ]),
    confidenceLevel,
    unknowns: deduplicateUncertaintyItems(output.classifications.unknowns),
    importantDirectQuotes: output.importantDirectQuotes.map((item) => item.quote),
    proposedExperiment: output.sevenDayExperiment,
    competingHypotheses: output.competingHypotheses,
    confidenceRationale: output.confidenceRationale,
    directStatements: output.classifications.directStatements,
    reasonableInferences: output.classifications.reasonableInferences,
    tentativeHypotheses: output.classifications.tentativeHypotheses,
  };
}

function buildSystemInstructions(definition: CalibrationDefinition) {
  const canonicalInstructions = definition.canonical_sections
    .filter((section) => section.number >= 6)
    .map((section) => `# ${section.number}. ${section.title}\n${section.markdown}`)
    .join("\n\n");
  return [
    "Use only the supplied current-session evidence package.",
    "Return structured JSON matching the supplied schema; do not add prose outside it.",
    "Do not claim access to prior chats, memory, profiles, research, or metadata.",
    "PARTICIPANT-FACING NARRATIVE QUALITY CONTRACT:",
    "The ten profileSections must retain the exact supplied canonical IDs, titles, and order.",
    "Each profileSections.body must contain only polished narrative written directly for the participant. Do not expose calibration titles, the phrase Rapid Connection Narrator, participant code, dates, estimated completion time, context-isolation confirmations, evidence-source labels, question IDs, raw field labels, internal instructions, prompt text, or a list/dump of participant answers.",
    "Keep evidence references only in evidenceReferences and the other structured evidence fields. Never write question IDs or evidence labels inside participant-facing prose.",
    "Use an exact direct quote only when it materially sharpens the reflection, list it in importantDirectQuotes, and integrate it naturally rather than presenting it as source data.",
    "Across the complete narrative, follow this sequence: identity → strength → possible hidden cost → business consequence → leverage point → respectful challenge → seven-day experiment → reason to continue.",
    "Write with perceptive, grounded, concise, nonclinical, participant-specific language. Avoid generic praise, repeated insights, unsupported certainty, diagnostic claims, and consultant-report language.",
    "Keep uncertainty natural and participant-facing. Use phrases such as ‘may,’ ‘appears,’ ‘one possibility,’ or ‘we do not know yet’ where warranted.",
    "Never explain an internal confidence rating, evidence count, classification, validation decision, or evaluation rationale inside a profileSections.body. Do not write phrases such as ‘moderate-confidence interpretation,’ ‘this is rated medium confidence because,’ or ‘the evidence supports this assessment.’ Put explicit confidence and its rationale only in confidenceLevel and confidenceRationale.",
    "Treat section titles as presentation chrome: do not repeat any canonical section title inside its body.",
    canonicalInstructions,
    "RENDERING OVERRIDES FOR THE FROZEN SPECIFICATION:",
    "The frozen specification's required header and internal summary are represented by structured fields outside profileSections.body. Never render that header, metadata, answer summary, or internal summary inside a section body.",
    "Where the frozen specification says ‘Use this structure’ or shows bold field labels, preserve the requested meaning but rewrite it as natural prose without labels.",
    "For profile section 4, synthesize the strength, benefit, possible shadow, and evidence-supported basis into one or two short paragraphs. Express uncertainty naturally; put the explicit confidence rating and rationale only in confidenceLevel and confidenceRationale. Put evidence IDs only in evidenceReferences.",
    "For profile section 5, express both legitimate sides, their consequence, and the current tension as connected prose without field headings.",
    "For profile section 7, write only a two-to-four-sentence participant-facing summary of the action, hypothesis, fit, and learning value. Put the full deliverable, owner, obstacle, support, result, and learning details only in sevenDayExperiment.",
    "For profile sections 8 and 9, concise bullets are allowed, but do not prefix them with raw source, evidence, question, or answer labels.",
  ].join("\n\n");
}

function validateParticipantFacingNarrative(
  sections: any[],
  evidencePackage: CalibrationEvidencePackage,
  importantDirectQuotes: any[],
  errors: string[],
) {
  const bodies = sections.map((section) => typeof section?.body === "string" ? section.body : "");
  const allowedQuotes = new Set(
    importantDirectQuotes
      .map((item) => typeof item?.quote === "string" ? normalizeNarrative(item.quote) : "")
      .filter(Boolean),
  );
  const longAnswers = evidencePackage.participantAnswers.filter(
    (answer) => answer.meaningful && normalizeNarrative(answer.exactWording).length >= 20,
  );
  let exactAnswerAppearances = 0;
  const seenBodies = new Set<string>();
  const seenSentences = new Set<string>();

  bodies.forEach((body, index) => {
    if (!body) return;
    const label = `Profile section ${index + 1}`;
    const normalizedBody = normalizeNarrative(body);
    const prohibited = participantFacingProhibitedPattern(body);
    if (prohibited) errors.push(`${label} contains internal or non-narrative material (${prohibited}).`);
    if (body.length > 1_400) errors.push(`${label} must be concise participant-facing narrative.`);
    if (seenBodies.has(normalizedBody)) errors.push("Participant-facing sections must not repeat the same insight.");
    seenBodies.add(normalizedBody);

    for (const required of evidencePackage.requiredOutputSections) {
      if (normalizedBody.includes(normalizeNarrative(required.title))) {
        errors.push(`${label} must not repeat canonical section titles inside its body.`);
        break;
      }
    }

    const matchedAnswers = longAnswers.filter((answer) =>
      normalizedBody.includes(normalizeNarrative(answer.exactWording)),
    );
    exactAnswerAppearances += matchedAnswers.length;
    if (matchedAnswers.length >= 3) {
      errors.push(`${label} contains a raw-answer dump instead of participant-facing narrative.`);
    }
    for (const answer of matchedAnswers) {
      if (!allowedQuotes.has(normalizeNarrative(answer.exactWording))) {
        errors.push(`${label} reproduces an answer verbatim without declaring a material direct quote.`);
        break;
      }
    }

    for (const sentence of body.split(/(?<=[.!?])\s+/)) {
      const normalizedSentence = normalizeNarrative(sentence);
      if (normalizedSentence.length < 45) continue;
      if (seenSentences.has(normalizedSentence)) {
        errors.push("Participant-facing sections must not repeat the same narrative sentence.");
        break;
      }
      seenSentences.add(normalizedSentence);
    }
  });

  if (exactAnswerAppearances >= Math.max(5, Math.ceil(longAnswers.length / 2))) {
    errors.push("Participant-facing sections must not contain a complete dump of participant answers.");
  }
  for (const quote of allowedQuotes) {
    const containingBody = bodies.find((body) => normalizeNarrative(body).includes(quote));
    if (!containingBody || normalizeNarrative(containingBody) === quote) {
      errors.push("Important direct quotes must be used naturally inside participant-facing narrative.");
    }
  }
}

function participantFacingProhibitedPattern(body: string) {
  const patterns: Array<[string, RegExp]> = [
    ["calibration boilerplate", /\b(?:open loops\s*[-—:|]\s*)?small business owner initial calibration\b|\bcalibration\s+(?:version\s*)?1\.3\b/i],
    ["internal narrator label", /\brapid connection narrator\b/i],
    ["participant metadata", /\bparticipant\s+(?:code|id)\b\s*[:#-]?/i],
    ["date or completion metadata", /(?:^|\n)\s*(?:date|completed on|generated on|estimated completion(?: time)?)\s*:|\b(?:estimated completion|takes? approximately)\s+\d+\s*(?:minutes?|mins?)\b|\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i],
    ["context-isolation confirmation", /\b(?:context isolation|current-session evidence only|using only (?:the )?(?:current|supplied) (?:session|answers)|no prior (?:chat|memory|profile))\b/i],
    ["evidence-source label", /(?:^|\n)\s*(?:evidence|evidence source|supporting evidence|where i see evidence|source answers?)\s*:/i],
    ["question identifier", /\bq(?:0[1-9]|1[0-2])\b|\bquestion\s*(?:number\s*)?(?:[1-9]|1[0-2])\b/i],
    ["raw field label", /(?:^|\n)\s*(?:business(?: description)?|team size|role|priority|growth orientation|decision style|energy source|avoided task|best operating conditions|essential belief|answer|your strength|how it helps the business|its possible shadow|confidence|on one side|on the other side|why both matter|what happens if the tension remains unresolved|where it may be appearing today|experiment|hypothesis being tested|why this fits you and your business|minimum deliverable|who should own it|likely obstacle|support that may help|what result to record|what the result would teach us)\s*:/i],
    ["internal instruction or prompt text", /\b(?:internal instructions?|system instructions?|prompt text|do not (?:use|include|claim)|return structured json|matching the supplied schema)\b/i],
    ["consultant-report language", /\b(?:executive summary|strategic recommendation|key takeaway|best-in-class|actionable insights?|optimi[sz]e synergies|stakeholder alignment)\b/i],
    ["internal evaluation language", /\b(?:(?:this|that) is (?:an? )?|i (?:would )?rate (?:this|that) as (?:an? )?|confidence (?:is|level is) |i have )(?:low|moderate|medium|high)[ -]confidence\b|\b(?:low|moderate|medium|high)-confidence (?:interpretation|assessment|conclusion|finding)\b|\bthe evidence supports (?:this|that|the) (?:interpretation|assessment|conclusion)\b/i],
    ["generic praise", /\b(?:you are (?:an? )?(?:exceptional|remarkable|visionary|outstanding|incredible)|natural-born leader)\b/i],
    ["unsupported certainty", /\b(?:clearly|definitely|undoubtedly|without question|the root cause is|this proves that)\b/i],
  ];
  return patterns.find(([, pattern]) => pattern.test(body))?.[0];
}

function normalizeNarrative(value: string) {
  return value.toLowerCase().replace(/[“”'"`*_#>|()[\]{}:;,.!?—–-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function deduplicateUncertaintyItems(items: string[]) {
  const kept: string[] = [];
  const tokenSets: Set<string>[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const tokens = uncertaintyTokens(trimmed);
    const duplicate = tokenSets.some((existing) => equivalentUncertainty(tokens, existing));
    if (duplicate) continue;
    kept.push(trimmed);
    tokenSets.push(tokens);
  }
  return kept;
}

function uncertaintyTokens(value: string) {
  const ignored = new Set([
    "a", "an", "and", "another", "are", "as", "be", "because", "could", "do", "does",
    "evidence", "important", "is", "it", "know", "may", "might", "more", "not", "of", "or", "other",
    "perhaps", "possible", "possibly", "remain", "remains", "still", "than", "that", "the", "this",
    "to", "unknown", "unclear", "we", "whether", "yet",
  ]);
  return new Set(value.toLowerCase()
    .replace(/\b(?:constraint|constraints|constraining|limitation|limitations|limiting|bottleneck|bottlenecks)\b/g, "constraint")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !ignored.has(token)));
}

function equivalentUncertainty(first: Set<string>, second: Set<string>) {
  if (!first.size || !second.size) return false;
  const intersection = [...first].filter((token) => second.has(token)).length;
  const union = new Set([...first, ...second]).size;
  return intersection / union >= 0.8;
}

function validateExperiment(experiment: unknown, errors: string[]) {
  if (!isRecord(experiment)) return;
  for (const key of [
    "action",
    "hypothesis",
    "minimumDeliverable",
    "owner",
    "likelyObstacle",
    "supportThatMayHelp",
    "resultToRecord",
    "whatResultWouldTeach",
  ]) {
    if (!nonEmpty(experiment[key])) errors.push(`sevenDayExperiment.${key} is required.`);
  }
  if (!/\b(?:record|observe|measure|evidence|result|test)\b/i.test(JSON.stringify(experiment))) {
    errors.push("The seven-day experiment must generate observable evidence.");
  }
}

function independentEvidenceCount(
  references: unknown,
  answers: Map<string, CalibrationEvidenceAnswer>,
) {
  if (!Array.isArray(references)) return 0;
  return new Set(
    references
      .map((reference) => answers.get(String(reference))?.independenceKey)
      .filter(Boolean),
  ).size;
}

function containsClinicalAdvice(value: string) {
  return /\b(?:you should|must|recommend(?:ed)?|prescribe|change|increase|decrease|stop|start)\b.{0,80}\b(?:medication|dosage|dose|treatment|therapy|diagnosis|clinical care|patient care)\b/i.test(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
