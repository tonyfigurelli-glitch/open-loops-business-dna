export type SourceType = "thought" | "chat" | "manual" | "system";

export type LoopStatus = "new" | "active" | "growing" | "ready" | "archived";

export type ConfidenceLevel = "low" | "medium" | "high";

export type BubbleTone = "violet" | "blue" | "green" | "orange" | "silver";

export type BubbleSize = "large" | "medium" | "small";

export type Thought = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  sourceType: SourceType;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type OpenLoop = {
  id: string;
  title: string;
  description: string;
  status: LoopStatus;
  createdAt: string;
  updatedAt: string;
  thoughtCount: number;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
  bubble: {
    tone: BubbleTone;
    size: BubbleSize;
    x: string;
    y: string;
  };
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type ChatMessage = {
  id: string;
  chatSessionId: string;
  role: "user" | "lumi";
  content: string;
  createdAt: string;
  sourceType: SourceType;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  tags: string[];
  themes: string[];
};

export type LoopConnection = {
  id: string;
  loopIds: [string, string];
  connectionReason: string;
  confidenceLevel: ConfidenceLevel;
  createdAt: string;
  updatedAt: string;
  relatedThoughtIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type Insight = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  sourceType: SourceType;
  confidenceLevel: ConfidenceLevel;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  connectionId?: string;
  tags: string[];
  themes: string[];
};

export type TimelineEvent = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  sourceType: SourceType;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type CalibrationResponse = {
  questionId: string;
  response: string | string[];
  answeredAt: string;
};

export type CalibrationEvidenceReference = {
  questionId: string;
  classification: "direct_statement" | "reasonable_inference" | "tentative_hypothesis";
  summary: string;
};

export type CalibrationExperiment = {
  action: string;
  hypothesis: string;
  minimumDeliverable: string;
  owner: string;
  likelyObstacle: string;
  supportThatMayHelp: string;
  resultToRecord: string;
  whatResultWouldTeach: string;
};

export type CalibrationGeneratedProfile = {
  generatedAt: string;
  participantFacingProfile: string;
  sections: Array<{
    id: string;
    title: string;
    body: string;
  }>;
};

export type CalibrationGenerationResult = {
  generatedProfile: CalibrationGeneratedProfile;
  centralHypothesis: string;
  evidenceReferences: CalibrationEvidenceReference[];
  supportingEvidence: CalibrationEvidenceReference[];
  possibleDisconfirmingEvidence: string[];
  confidenceLevel: ConfidenceLevel;
  unknowns: string[];
  importantDirectQuotes: string[];
  proposedExperiment: CalibrationExperiment;
  competingHypotheses?: Array<{
    hypothesis: string;
    evidenceReferences: string[];
    rank: number;
  }>;
  confidenceRationale?: string;
  directStatements?: Array<{ questionId: string; statement: string }>;
  reasonableInferences?: Array<{ statement: string; evidenceReferences: string[] }>;
  tentativeHypotheses?: Array<{ statement: string; evidenceReferences: string[] }>;
};

export type CalibrationGenerationProvenance = {
  generatorType: "ai_assisted" | "deterministic_fallback";
  provider: string;
  modelIdentifier: string;
  promptInstructionVersion: string;
  calibrationVersion: string;
  frozenCalibrationHash: string;
  generationTimestamp: string;
  validationResult: {
    valid: boolean;
    errors: string[];
  };
  retryCount: number;
  evidencePackageHash: string;
  usage?: Record<string, number>;
};

export type CalibrationGenerationAttempt = {
  id: string;
  sourceSessionId: string;
  outcome: "ai_assisted" | "failed_with_fallback";
  requestedModelFamily: "GPT-5.6";
  generation: CalibrationGenerationResult;
  provenance: CalibrationGenerationProvenance;
  originalStructuredOutput?: Record<string, unknown>;
  createdAt: string;
};

export type CalibrationSessionStatus =
  | "collecting_answers"
  | "model_ready"
  | "collecting_feedback"
  | "completed";

export type CalibrationSession = {
  id: string;
  participantId: string;
  calibrationId: string;
  semanticVersion: string;
  frozenSourceHash: string;
  status: CalibrationSessionStatus;
  startedAt: string;
  lastUpdatedAt?: string;
  completedAt?: string;
  participantCode?: string;
  currentQuestionIndex: number;
  participantResponses: CalibrationResponse[];
  generatedProfile?: CalibrationGeneratedProfile;
  centralHypothesis?: string;
  supportingEvidence: CalibrationEvidenceReference[];
  possibleDisconfirmingEvidence: string[];
  evidenceReferences: CalibrationEvidenceReference[];
  confidenceLevel?: ConfidenceLevel;
  unknowns: string[];
  importantDirectQuotes: string[];
  proposedExperiment?: CalibrationExperiment;
  competingHypotheses?: CalibrationGenerationResult["competingHypotheses"];
  confidenceRationale?: string;
  directStatements?: CalibrationGenerationResult["directStatements"];
  reasonableInferences?: CalibrationGenerationResult["reasonableInferences"];
  tentativeHypotheses?: CalibrationGenerationResult["tentativeHypotheses"];
  generationProvenance?: CalibrationGenerationProvenance;
  originalStructuredGenerationOutput?: Record<string, unknown>;
  deterministicFallbackOutput?: CalibrationGenerationResult;
  generationAttempts?: CalibrationGenerationAttempt[];
  migrationProvenance?: {
    source: "localStorage";
    importedAt: string;
    originalSessionId: string;
    fingerprint: string;
  };
  numericalFeedback: Record<string, 1 | 2 | 3 | 4 | 5>;
  openEndedFeedback: Record<string, string>;
};
