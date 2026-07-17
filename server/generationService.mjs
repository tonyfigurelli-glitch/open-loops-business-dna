export class CalibrationGenerationService {
  constructor({ canonical, pipeline, generator, provider }) {
    this.canonical = canonical;
    this.pipeline = pipeline;
    this.generator = generator;
    this.provider = provider;
  }

  async generate(requestBody) {
    const supplied = requestBody?.evidencePackage;
    validateEvidencePackageShape(supplied, this.canonical);
    const responses = supplied.participantAnswers.map((answer) => ({
      questionId: answer.questionId,
      response: answer.exactWording,
      answeredAt: requestBody.requestedAt ?? new Date().toISOString(),
    }));
    const rebuilt = this.pipeline.buildCalibrationEvidencePackage(this.canonical, responses);
    if (stableStringify(rebuilt) !== stableStringify(supplied)) {
      throw Object.assign(new Error("Evidence package does not match the canonical current session."), { status: 400 });
    }
    return this.pipeline.runAIModelGenerationPipeline({
      definition: this.canonical,
      responses,
      provider: this.provider,
      deterministicFallback: this.generator.generateInitialBusinessModel,
    });
  }
}

function validateEvidencePackageShape(value, canonical) {
  if (!value || typeof value !== "object" || Array.isArray(value)) badRequest();
  if (value.calibrationId !== canonical.identifier ||
      value.calibrationVersion !== canonical.version ||
      value.frozenSourceHash !== canonical.canonical_source.sha256) badRequest();
  if (!Array.isArray(value.participantAnswers) ||
      value.participantAnswers.length !== canonical.onboarding_questions.length) badRequest();
  for (let index = 0; index < canonical.onboarding_questions.length; index += 1) {
    const answer = value.participantAnswers[index];
    const question = canonical.onboarding_questions[index];
    if (!answer || answer.questionId !== question.id || answer.order !== question.order ||
        typeof answer.exactWording !== "string") badRequest();
  }
}

function badRequest() {
  throw Object.assign(new Error("Invalid canonical evidence package."), { status: 400 });
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
