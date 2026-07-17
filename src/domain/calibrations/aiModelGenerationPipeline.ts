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
  promptInstructionVersion = "small_business_owner_v1.3_ai_generation@1.0.0",
}: PipelineInput): Promise<ModelGenerationPipelineResult> {
  const evidencePackage = buildCalibrationEvidencePackage(definition, responses);
  const evidencePackageHash = await hashCalibrationEvidencePackage(evidencePackage);
  const systemInstructions = buildSystemInstructions(definition);
  let validationErrors: string[] = [];
  let lastProvider = "unavailable";
  let lastModelIdentifier = "unavailable";
  let lastUsage: Record<string, number> | undefined;

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
            retryCount: attempt,
            evidencePackageHash,
            usage: response.usage,
          },
          originalStructuredOutput: output as unknown as Record<string, unknown>,
        };
      }

      validationErrors = validation.errors;
    } catch (error) {
      validationErrors = [error instanceof Error ? error.message : "Unknown provider failure"];
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
      validationResult: { valid: false, errors: validationErrors },
      retryCount: 1,
      evidencePackageHash,
      usage: lastUsage,
    },
  };
}

export function validateAIModelOutput(
  candidate: unknown,
  evidencePackage: CalibrationEvidencePackage,
) {
  const errors: string[] = [];
  if (!isRecord(candidate)) return { valid: false, errors: ["Output must be an object."] };

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
  return { valid: errors.length === 0, errors };
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
    possibleDisconfirmingEvidence: [
      ...output.possibleDisconfirmingEvidence,
      ...output.competingHypotheses.map((item) => item.hypothesis),
    ],
    confidenceLevel,
    unknowns: output.classifications.unknowns,
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
    canonicalInstructions,
  ].join("\n\n");
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
