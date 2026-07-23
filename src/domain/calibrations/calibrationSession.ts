import type {
  CalibrationGenerationResult,
  CalibrationResponse,
  CalibrationSession,
} from "../models";

type CalibrationIdentity = {
  calibrationId: string;
  semanticVersion: string;
  frozenSourceHash: string;
};

type NewCalibrationSessionInput = CalibrationIdentity & {
  id: string;
  participantId: string;
  startedAt: string;
};

export function createCalibrationSession(
  input: NewCalibrationSessionInput,
): CalibrationSession {
  return {
    ...input,
    lastUpdatedAt: input.startedAt,
    status: "collecting_answers",
    currentQuestionIndex: 0,
    participantResponses: [],
    supportingEvidence: [],
    possibleDisconfirmingEvidence: [],
    evidenceReferences: [],
    unknowns: [],
    importantDirectQuotes: [],
    numericalFeedback: {},
    openEndedFeedback: {},
  };
}

export function saveCalibrationAnswer(
  session: CalibrationSession,
  response: CalibrationResponse,
  orderedQuestionIds: string[],
  generate: (responses: CalibrationResponse[]) => CalibrationGenerationResult,
): CalibrationSession {
  if (session.status !== "collecting_answers") {
    throw new Error("Calibration answers can only be saved while collecting answers.");
  }

  const expectedQuestionId = orderedQuestionIds[session.currentQuestionIndex];
  if (!expectedQuestionId || response.questionId !== expectedQuestionId) {
    throw new Error(`Expected calibration question ${expectedQuestionId ?? "none"}.`);
  }

  const participantResponses = [...session.participantResponses, response];
  const currentQuestionIndex = participantResponses.length;

  if (currentQuestionIndex < orderedQuestionIds.length) {
    return { ...session, participantResponses, currentQuestionIndex };
  }

  const result = generate(participantResponses);
  return {
    ...session,
    status: "model_ready",
    currentQuestionIndex,
    participantResponses,
    generatedProfile: result.generatedProfile,
    centralHypothesis: result.centralHypothesis,
    supportingEvidence: result.supportingEvidence,
    possibleDisconfirmingEvidence: result.possibleDisconfirmingEvidence,
    evidenceReferences: result.evidenceReferences,
    confidenceLevel: result.confidenceLevel,
    unknowns: result.unknowns,
    importantDirectQuotes: result.importantDirectQuotes,
    proposedExperiment: result.proposedExperiment,
    competingHypotheses: result.competingHypotheses,
    confidenceRationale: result.confidenceRationale,
    directStatements: result.directStatements,
    reasonableInferences: result.reasonableInferences,
    tentativeHypotheses: result.tentativeHypotheses,
    appliedPractices: result.appliedPractices,
    managementLibraryVersion: result.managementLibraryVersion,
  };
}

export function saveNumericalFeedback(
  session: CalibrationSession,
  feedbackId: string,
  value: 1 | 2 | 3 | 4 | 5,
  orderedFeedbackIds: string[],
): CalibrationSession {
  if (!["model_ready", "collecting_feedback"].includes(session.status)) {
    throw new Error("Numerical feedback cannot be saved in the current session state.");
  }

  const expectedFeedbackId = orderedFeedbackIds[Object.keys(session.numericalFeedback).length];
  if (!expectedFeedbackId || feedbackId !== expectedFeedbackId) {
    throw new Error(`Expected numerical feedback ${expectedFeedbackId ?? "none"}.`);
  }

  return {
    ...session,
    status: "collecting_feedback",
    numericalFeedback: { ...session.numericalFeedback, [feedbackId]: value },
  };
}

export function saveOpenEndedFeedback(
  session: CalibrationSession,
  feedbackId: string,
  value: string,
  orderedFeedbackIds: string[],
  completedAt: string,
): CalibrationSession {
  if (session.status !== "collecting_feedback") {
    throw new Error("Open-ended feedback requires numerical feedback first.");
  }

  const expectedFeedbackId = orderedFeedbackIds[Object.keys(session.openEndedFeedback).length];
  if (!expectedFeedbackId || feedbackId !== expectedFeedbackId) {
    throw new Error(`Expected open-ended feedback ${expectedFeedbackId ?? "none"}.`);
  }

  const openEndedFeedback = { ...session.openEndedFeedback, [feedbackId]: value };
  const complete = Object.keys(openEndedFeedback).length === orderedFeedbackIds.length;

  return {
    ...session,
    status: complete ? "completed" : "collecting_feedback",
    completedAt: complete ? completedAt : undefined,
    openEndedFeedback,
  };
}

export function selectCalibrationToOpen(sessions: CalibrationSession[]) {
  return sessions.find((session) => session.status !== "completed") ?? sessions[0];
}

export function preserveAndPrependCalibrationSession(
  sessions: CalibrationSession[],
  newSession: CalibrationSession,
) {
  if (sessions.some((session) => session.id === newSession.id)) {
    throw new Error("A calibration session with this ID already exists.");
  }
  return [newSession, ...sessions];
}

export function selectCalibrationSession(sessions: CalibrationSession[], sessionId: string) {
  return sessions.find((session) => session.id === sessionId) ?? selectCalibrationToOpen(sessions);
}
