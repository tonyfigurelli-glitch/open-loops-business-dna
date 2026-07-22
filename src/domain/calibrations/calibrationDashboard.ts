import type { CalibrationSession } from "../models";

export type CalibrationDashboardSummary = {
  activeSession: CalibrationSession;
  actionLabel: string;
  completedSessionCount: number;
  progressLabel: string;
  progressPercent: number;
  sessionCount: number;
  statusLabel: string;
};

export function buildCalibrationDashboardSummary(
  sessions: CalibrationSession[],
  totalQuestionCount: number,
  totalFeedbackQuestionCount: number,
): CalibrationDashboardSummary | null {
  const activeSession = sessions.find((session) => session.status !== "completed") ?? sessions[0];
  if (!activeSession) return null;

  const sessionCount = sessions.length;
  const completedSessionCount = sessions.filter((session) => session.status === "completed").length;

  if (activeSession.status === "collecting_answers") {
    const answered = Math.min(activeSession.participantResponses.length, totalQuestionCount);
    return {
      activeSession,
      actionLabel: "Continue calibration",
      completedSessionCount,
      progressLabel: `${answered} of ${totalQuestionCount} questions answered`,
      progressPercent: totalQuestionCount ? (answered / totalQuestionCount) * 100 : 0,
      sessionCount,
      statusLabel: "In progress",
    };
  }

  if (activeSession.status === "collecting_feedback") {
    const answered = Object.keys(activeSession.numericalFeedback).length +
      Object.keys(activeSession.openEndedFeedback).length;
    return {
      activeSession,
      actionLabel: "Continue feedback",
      completedSessionCount,
      progressLabel: `${Math.min(answered, totalFeedbackQuestionCount)} of ${totalFeedbackQuestionCount} feedback questions answered`,
      progressPercent: totalFeedbackQuestionCount
        ? (Math.min(answered, totalFeedbackQuestionCount) / totalFeedbackQuestionCount) * 100
        : 100,
      sessionCount,
      statusLabel: "Profile ready",
    };
  }

  return {
    activeSession,
    actionLabel: "View profile",
    completedSessionCount,
    progressLabel: activeSession.status === "completed"
      ? "Your Business DNA profile and session record are saved."
      : "Your initial Business DNA profile is ready for review.",
    progressPercent: 100,
    sessionCount,
    statusLabel: activeSession.status === "completed" ? "Complete" : "Profile ready",
  };
}
