import type {
  CalibrationSession,
  ChatMessage,
  ChatSession,
  Insight,
  LoopConnection,
  OpenLoop,
  Thought,
} from "../domain/models";

export const prototypeStorageKey = "open-loops.prototype-state.v1";

export type PrototypeAppState = {
  calibrationSessions: CalibrationSession[];
  thoughts: Thought[];
  openLoops: OpenLoop[];
  loopConnections: LoopConnection[];
  insights: Insight[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
};

export function loadPrototypeState(seedState: PrototypeAppState): PrototypeAppState {
  if (!canUseLocalStorage()) {
    return seedState;
  }

  const storedState = window.localStorage.getItem(prototypeStorageKey);

  if (!storedState) {
    return seedState;
  }

  try {
    const parsedState = JSON.parse(storedState) as Partial<PrototypeAppState> & {
      calibrationSessions?: Array<Partial<CalibrationSession> & Record<string, unknown>>;
    };

    return {
      ...seedState,
      ...parsedState,
      calibrationSessions: (parsedState.calibrationSessions ?? seedState.calibrationSessions).map(
        normalizeCalibrationSession,
      ),
    };
  } catch {
    return seedState;
  }
}

function normalizeCalibrationSession(
  session: Partial<CalibrationSession> & Record<string, unknown>,
): CalibrationSession {
  const participantResponses = session.participantResponses ?? [];
  const legacyModel = session.generatedInitialModel as CalibrationSession["generatedProfile"] | undefined;
  const legacyFeedback = session.participantFeedback as
    | { ratings?: CalibrationSession["numericalFeedback"]; openEndedResponses?: Record<string, string> }
    | undefined;
  const generatedProfile = session.generatedProfile ?? legacyModel;
  const numericalFeedback = session.numericalFeedback ?? legacyFeedback?.ratings ?? {};
  const openEndedFeedback = session.openEndedFeedback ?? legacyFeedback?.openEndedResponses ?? {};
  const status =
    session.status ??
    (session.completedAt
      ? "completed"
      : Object.keys(numericalFeedback).length || Object.keys(openEndedFeedback).length
        ? "collecting_feedback"
        : generatedProfile
          ? "model_ready"
          : "collecting_answers");

  return {
    id: session.id ?? `calibration-recovered-${Date.now()}`,
    participantId: session.participantId ?? "participant-recovered",
    calibrationId: session.calibrationId ?? "unknown",
    semanticVersion: session.semanticVersion ?? "unknown",
    frozenSourceHash: session.frozenSourceHash ?? "unknown",
    status,
    startedAt: session.startedAt ?? new Date().toISOString(),
    lastUpdatedAt: session.lastUpdatedAt ?? session.startedAt ?? new Date().toISOString(),
    completedAt: session.completedAt,
    participantCode: session.participantCode,
    currentQuestionIndex: session.currentQuestionIndex ?? participantResponses.length,
    participantResponses,
    generatedProfile,
    centralHypothesis: session.centralHypothesis,
    supportingEvidence: session.supportingEvidence ?? session.evidenceReferences ?? [],
    possibleDisconfirmingEvidence: session.possibleDisconfirmingEvidence ?? [],
    evidenceReferences: session.evidenceReferences ?? session.supportingEvidence ?? [],
    confidenceLevel: session.confidenceLevel,
    unknowns: session.unknowns ?? [],
    importantDirectQuotes: session.importantDirectQuotes ?? [],
    proposedExperiment: session.proposedExperiment,
    competingHypotheses: session.competingHypotheses,
    confidenceRationale: session.confidenceRationale,
    directStatements: session.directStatements,
    reasonableInferences: session.reasonableInferences,
    tentativeHypotheses: session.tentativeHypotheses,
    generationProvenance: session.generationProvenance,
    originalStructuredGenerationOutput: session.originalStructuredGenerationOutput,
    deterministicFallbackOutput: session.deterministicFallbackOutput,
    migrationProvenance: session.migrationProvenance,
    numericalFeedback,
    openEndedFeedback,
  };
}

export function savePrototypeState(state: PrototypeAppState) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(prototypeStorageKey, JSON.stringify(state));
}

export function clearPrototypeState() {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(prototypeStorageKey);
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}
