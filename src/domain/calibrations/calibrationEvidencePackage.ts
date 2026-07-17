import type { CalibrationResponse } from "../models";

export type CalibrationDefinition = {
  identifier: string;
  version: string;
  canonical_source: { sha256: string };
  onboarding_questions: Array<{
    id: string;
    order: number;
    title: string;
    prompt: string;
    response_type: string;
  }>;
  profile_output: {
    sections: Array<{ id: string; order: number; title: string; canonical_markdown: string }>;
  };
  canonical_sections: Array<{ number: number; title: string; markdown: string }>;
};

export type CalibrationEvidenceAnswer = {
  questionId: string;
  order: number;
  answerType: string;
  exactWording: string;
  meaningful: boolean;
  independenceKey: string;
};

export type CalibrationEvidencePackage = {
  calibrationId: string;
  calibrationVersion: string;
  frozenSourceHash: string;
  participantAnswers: CalibrationEvidenceAnswer[];
  statedContext: {
    businessDescription: string;
    businessSize: string;
    ownerRole: string;
    ninetyDayPriority: string;
    tradeoffAnswers: Record<string, string>;
    behavioralAnswers: Record<string, string>;
  };
  requiredEvidenceRules: {
    minimumIndependentEvidence: number;
    highConfidenceAllowed: false;
    currentSessionOnly: true;
  };
  requiredOutputSections: Array<{ id: string; order: number; title: string }>;
  prohibitedInferencePatterns: string[];
  safetyConstraints: string[];
  qualitySignals: {
    meaningfulAnswerCount: number;
    hasAmbiguity: boolean;
    hasContradiction: boolean;
  };
};

export function buildCalibrationEvidencePackage(
  definition: CalibrationDefinition,
  responses: CalibrationResponse[],
): CalibrationEvidencePackage {
  const responseById = new Map(responses.map((response) => [response.questionId, response]));
  const participantAnswers = definition.onboarding_questions.map((question) => {
    const response = responseById.get(question.id);
    const exactWording = formatExactResponse(response?.response);
    return {
      questionId: question.id,
      order: question.order,
      answerType: question.response_type,
      exactWording,
      meaningful: Boolean(exactWording.trim()),
      independenceKey: normalizeEvidence(exactWording),
    };
  });
  const answer = (questionId: string) =>
    participantAnswers.find((item) => item.questionId === questionId)?.exactWording ?? "";
  const allWording = participantAnswers.map((item) => item.exactWording);

  return {
    calibrationId: definition.identifier,
    calibrationVersion: definition.version,
    frozenSourceHash: definition.canonical_source.sha256,
    participantAnswers,
    statedContext: {
      businessDescription: answer("q01"), businessSize: answer("q02"),
      ownerRole: answer("q03"), ninetyDayPriority: answer("q04"),
      tradeoffAnswers: Object.fromEntries(["q05", "q06", "q07", "q08"].map((id) => [id, answer(id)])),
      behavioralAnswers: Object.fromEntries(["q09", "q10", "q11", "q12"].map((id) => [id, answer(id)])),
    },
    requiredEvidenceRules: { minimumIndependentEvidence: 2, highConfidenceAllowed: false, currentSessionOnly: true },
    requiredOutputSections: definition.profile_output.sections.map(({ id, order, title }) => ({ id, order, title })),
    prohibitedInferencePatterns: [
      "Avoided work is automatically the root constraint",
      "Founder dependence, delegation, or systemization is the default diagnosis",
      "Unsupported personal, psychological, medical, legal, or financial diagnosis",
      "Claims based on prior chats, memory, profiles, research, or unrelated metadata",
    ],
    safetyConstraints: [
      "Business-oriented observations and evidence-generating experiments only",
      "No medical, clinical, legal, psychological, or financial diagnosis or advice",
      "Direct quotes must exactly match current-session participant wording",
    ],
    qualitySignals: {
      meaningfulAnswerCount: participantAnswers.filter((item) => item.meaningful).length,
      hasAmbiguity: allWording.some((value) => /\b(?:depends|unsure|uncertain|mixed|maybe|however|but)\b/i.test(value)),
      hasContradiction: allWording.some((value) => /\balways\b/i.test(value)) && allWording.some((value) => /\bnever\b/i.test(value)),
    },
  };
}

export async function hashCalibrationEvidencePackage(evidencePackage: CalibrationEvidencePackage) {
  const bytes = new TextEncoder().encode(stableStringify(evidencePackage));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeEvidence(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function formatExactResponse(response: string | string[] | undefined) { return Array.isArray(response) ? response.join(", ") : response ?? ""; }
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
