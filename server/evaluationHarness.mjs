export const evaluationDimensions = [
  "specificity",
  "evidenceGrounding",
  "confidenceDiscipline",
  "participantVoice",
  "alternativeHypotheses",
  "respectfulChallenge",
  "sevenDayExperimentQuality",
  "usefulness",
  "repetition",
  "unsupportedInferenceRisk",
];

export function storeCalibrationEvaluation(database, reviewerId, participantUserId, input) {
  if (!["deterministic_fallback", "ai_assisted", "historical_pilot"].includes(input?.sourceKind)) {
    throw new Error("Evaluation source kind is invalid.");
  }
  if (!input.source || typeof input.source !== "object") throw new Error("Evaluation source is required.");
  for (const dimension of evaluationDimensions) {
    const score = input.scores?.[dimension];
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      throw new Error(`Evaluation score ${dimension} must be an integer from 1 to 5.`);
    }
  }
  return database.createEvaluation(reviewerId, participantUserId, input);
}

export function compareCalibrationEvaluations(evaluations) {
  return evaluations.map((evaluation) => ({
    id: evaluation.id,
    sourceKind: evaluation.sourceKind,
    scores: evaluation.scores,
    total: evaluationDimensions.reduce((sum, dimension) => sum + evaluation.scores[dimension], 0),
  }));
}
