import type { CalibrationGenerationAttempt, CalibrationSession } from "../domain/models";
import type { CalibrationEvidencePackage, ModelGenerationPipelineResult } from "../domain/calibrations/aiModelGenerationPipeline";
import { smallBusinessOwnerCalibrationIdentity } from "../domain/calibrations/smallBusinessOwnerCalibration";

export type GenerationDisplayState =
  | "idle"
  | "connecting"
  | "successful_ai_assisted"
  | "failed_with_fallback"
  | "validation_rejected_with_fallback"
  | "timed_out_with_fallback"
  | "request_failed";

const CALIBRATION_RETRY_CLIENT_TIMEOUT_MS = 1_230_000;
const INITIAL_GENERATION_CLIENT_TIMEOUT_MS = 45_000;

export async function establishCalibrationSession(userId: string) {
  const current = await fetch("/api/auth/session", { credentials: "include" });
  if (current.ok) {
    const session = await current.json() as { userId?: unknown };
    if (session.userId === userId) return true;
    if (!isDevelopmentBuild()) return false;
    await signOutCalibrationSession();
  }
  if (!isDevelopmentBuild()) return false;
  const development = await fetch("/api/auth/development", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return development.ok;
}

export async function signOutCalibrationSession() {
  const response = await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
  return response.ok;
}

export async function deleteCurrentParticipantData() {
  const response = await request("/api/participant-data", {
    method: "DELETE",
    body: JSON.stringify({ confirmation: "RESET_ENTIRE_WORKSPACE" }),
  });
  if (!response.ok) throw new Error("The workspace could not be reset.");
  return response.json() as Promise<{ deleted: Record<string, number> }>;
}

export async function migrateAndLoadCalibrationSessions(localSessions: CalibrationSession[]) {
  const canonicalSessions = localSessions.filter((session) =>
    session.calibrationId === smallBusinessOwnerCalibrationIdentity.calibrationId &&
      session.semanticVersion === smallBusinessOwnerCalibrationIdentity.semanticVersion &&
      session.frozenSourceHash === smallBusinessOwnerCalibrationIdentity.frozenSourceHash,
  );
  if (canonicalSessions.length) {
    const migration = await request("/api/calibration-sessions/import", {
      method: "POST",
      body: JSON.stringify({ sessions: canonicalSessions }),
    });
    if (!migration.ok) return null;
  }
  const response = await request("/api/calibration-sessions");
  if (!response.ok) return null;
  const body = await response.json() as { sessions: CalibrationSession[] };
  return mergeSessions(localSessions, body.sessions);
}

export async function syncCalibrationSession(session: CalibrationSession) {
  const update = await request(`/api/calibration-sessions/${encodeURIComponent(session.id)}`, {
    method: "PUT",
    body: JSON.stringify(session),
  });
  if (update.ok) return (await update.json() as { session: CalibrationSession }).session;
  return null;
}

export async function requestServerGeneration(evidencePackage: CalibrationEvidencePackage) {
  const response = await request("/api/calibrations/generate", {
    method: "POST",
    body: JSON.stringify({ evidencePackage }),
    signal: AbortSignal.timeout(INITIAL_GENERATION_CLIENT_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("Secure generation is temporarily unavailable.");
  return response.json() as Promise<ModelGenerationPipelineResult>;
}

export async function retryCalibrationGeneration(
  sessionId: string,
  knownAttemptIds: readonly string[] = [],
) {
  const knownAttempts = new Set(knownAttemptIds);
  let response: Response;
  try {
    response = await request(
      `/api/calibration-sessions/${encodeURIComponent(sessionId)}/retry-generation`,
      {
        method: "POST",
        body: "{}",
        signal: AbortSignal.timeout(CALIBRATION_RETRY_CLIENT_TIMEOUT_MS),
      },
    );
  } catch (error) {
    const recovered = await recoverPersistedGenerationAttempt(sessionId, knownAttempts);
    if (recovered) return recovered;
    throw new CalibrationGenerationRequestError(
      undefined,
      isTimeoutError(error) ? "network_timeout" : "network_failure",
    );
  }
  if (!response.ok) {
    const serverCode = await safeServerErrorCode(response);
    const recovered = await recoverPersistedGenerationAttempt(sessionId, knownAttempts);
    if (recovered) return recovered;
    throw new CalibrationGenerationRequestError(response.status, undefined, serverCode);
  }
  let body: { attempt?: unknown };
  try {
    body = await response.json() as { attempt?: unknown };
  } catch {
    const recovered = await recoverPersistedGenerationAttempt(sessionId, knownAttempts);
    if (recovered) return recovered;
    throw new CalibrationGenerationRequestError(undefined, "network_failure");
  }
  if (isGenerationAttempt(body.attempt)) return body.attempt;
  const recovered = await recoverPersistedGenerationAttempt(sessionId, knownAttempts);
  if (recovered) return recovered;
  throw new CalibrationGenerationRequestError(undefined, "network_failure");
}

function isGenerationAttempt(value: unknown): value is CalibrationGenerationAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<CalibrationGenerationAttempt>;
  return typeof attempt.id === "string" &&
    ["ai_assisted", "failed_with_fallback"].includes(attempt.outcome ?? "") &&
    Boolean(attempt.generation) && Boolean(attempt.provenance);
}

export function safeGenerationError(error: unknown) {
  if (error instanceof CalibrationGenerationRequestError) {
    if (error.status === 401) return "Your session expired. Sign in again before retrying.";
    if (error.status === 409) return "This saved calibration is not eligible for another generation attempt.";
    if (error.status === 429) return "GPT-5.6 is busy right now. Your saved result is unchanged.";
    if (error.status && error.status >= 500) {
      return "The secure generation service could not complete the retry. Your saved result is unchanged.";
    }
    if (error.reason === "network_timeout") {
      return "The secure generation connection timed out. Your saved fallback result is unchanged.";
    }
    if (error.reason === "network_failure") {
      return "The browser lost the secure generation connection. Any completed server result will be restored automatically.";
    }
  }
  return "The retry request could not be completed. Your saved fallback result is unchanged.";
}

export function generationStateForAttempt(attempt: CalibrationGenerationAttempt): GenerationDisplayState {
  if (attempt.outcome === "ai_assisted") return "successful_ai_assisted";
  if (attempt.provenance?.failureReason === "validation_failure") {
    return "validation_rejected_with_fallback";
  }
  return attempt.provenance?.failureReason === "provider_timeout"
    ? "timed_out_with_fallback"
    : "failed_with_fallback";
}

export async function completeCalibrationGenerationRetry(
  operation: () => Promise<CalibrationGenerationAttempt>,
) {
  try {
    const attempt = await operation();
    return { attempt, state: generationStateForAttempt(attempt), error: null } as const;
  } catch (error) {
    return {
      attempt: null,
      state: isTimeoutError(error) ||
        (error instanceof CalibrationGenerationRequestError && error.reason === "network_timeout")
        ? "timed_out_with_fallback" as const
        : "request_failed" as const,
      error: safeGenerationError(error),
    };
  }
}

async function recoverPersistedGenerationAttempt(
  sessionId: string,
  knownAttemptIds: ReadonlySet<string>,
) {
  try {
    const response = await request(`/api/calibration-sessions/${encodeURIComponent(sessionId)}`);
    if (!response.ok) return null;
    const { session } = await response.json() as { session: CalibrationSession };
    return session.generationAttempts?.find((attempt) => !knownAttemptIds.has(attempt.id)) ?? null;
  } catch {
    return null;
  }
}

async function safeServerErrorCode(response: Response) {
  try {
    const body = await response.clone().json() as { code?: unknown };
    return typeof body.code === "string" && /^[a-z_]{1,64}$/.test(body.code)
      ? body.code
      : undefined;
  } catch {
    return undefined;
  }
}

export async function requestGenerationWithNetworkFallback(
  evidencePackage: CalibrationEvidencePackage,
  fallback: () => Promise<ModelGenerationPipelineResult>,
) {
  try {
    return await requestServerGeneration(evidencePackage);
  } catch {
    return fallback();
  }
}

export function mergeSessions(local: CalibrationSession[], remote: CalibrationSession[]) {
  const merged = new Map(remote.map((session) => [session.id, session]));
  for (const session of local) {
    const existing = merged.get(session.id);
    if (!existing) {
      merged.set(session.id, session);
      continue;
    }
    const preferredBase = existing.status === "completed"
      ? existing
      : completionScore(session) > completionScore(existing) ||
          Date.parse(session.lastUpdatedAt ?? session.startedAt) > Date.parse(existing.lastUpdatedAt ?? existing.startedAt)
        ? session
        : existing;
    const generationAttempts = mergeGenerationAttempts(
      session.generationAttempts ?? [],
      existing.generationAttempts ?? [],
    );
    merged.set(session.id, generationAttempts.length
      ? { ...preferredBase, generationAttempts }
      : preferredBase);
  }
  return [...merged.values()].sort((a, b) =>
    Date.parse(b.lastUpdatedAt ?? b.startedAt) - Date.parse(a.lastUpdatedAt ?? a.startedAt));
}

export function calibrationSessionWriteFingerprint(session: CalibrationSession) {
  const { generationAttempts: _serverOwnedGenerationAttempts, ...persistedSession } = session;
  return JSON.stringify(persistedSession);
}

function mergeGenerationAttempts(
  local: CalibrationGenerationAttempt[],
  remote: CalibrationGenerationAttempt[],
) {
  const attempts = new Map(remote.map((attempt) => [attempt.id, attempt]));
  for (const attempt of local) {
    if (!attempts.has(attempt.id)) attempts.set(attempt.id, attempt);
  }
  return [...attempts.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

async function request(path: string, init: RequestInit = {}) {
  return fetch(path, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...init.headers },
  });
}

function completionScore(session: CalibrationSession) {
  const status = { collecting_answers: 0, model_ready: 100, collecting_feedback: 200, completed: 300 }[session.status];
  return status + session.participantResponses.length +
    Object.keys(session.numericalFeedback).length + Object.keys(session.openEndedFeedback).length;
}

function isDevelopmentBuild() {
  return Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);
}

class CalibrationGenerationRequestError extends Error {
  constructor(
    readonly status?: number,
    readonly reason?: "network_timeout" | "network_failure",
    readonly serverCode?: string,
  ) {
    super("Calibration generation request failed.");
  }
}

function isTimeoutError(error: unknown) {
  return error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
}
