import { createHash, randomUUID } from "node:crypto";
import { backup as backupDatabaseFile, DatabaseSync } from "node:sqlite";

export class CalibrationDatabase {
  constructor(path = ":memory:") {
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS calibration_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        participant_code TEXT,
        calibration_id TEXT NOT NULL,
        semantic_version TEXT NOT NULL,
        frozen_hash TEXT NOT NULL,
        status TEXT NOT NULL,
        current_question_index INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        session_json TEXT NOT NULL,
        original_model_json TEXT,
        fallback_output_json TEXT,
        import_fingerprint TEXT,
        migration_provenance_json TEXT,
        UNIQUE(user_id, import_fingerprint)
      );
      CREATE INDEX IF NOT EXISTS calibration_sessions_owner_updated
        ON calibration_sessions(user_id, updated_at DESC);
      CREATE TABLE IF NOT EXISTS calibration_generation_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        source_session_id TEXT NOT NULL,
        outcome TEXT NOT NULL CHECK(outcome IN ('ai_assisted','failed_with_fallback')),
        attempt_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(source_session_id) REFERENCES calibration_sessions(id)
      );
      CREATE INDEX IF NOT EXISTS calibration_generation_attempts_session
        ON calibration_generation_attempts(user_id, source_session_id, created_at DESC);
      CREATE TABLE IF NOT EXISTS business_dna_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        source_session_id TEXT NOT NULL UNIQUE,
        effective_date TEXT NOT NULL,
        source_version TEXT NOT NULL,
        source_hash TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status = 'initial_provisional_model'),
        record_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(source_session_id) REFERENCES calibration_sessions(id)
      );
      CREATE TABLE IF NOT EXISTS calibration_evaluations (
        id TEXT PRIMARY KEY,
        reviewer_id TEXT NOT NULL,
        participant_user_id TEXT NOT NULL,
        source_session_id TEXT,
        source_kind TEXT NOT NULL CHECK(source_kind IN ('deterministic_fallback','ai_assisted','historical_pilot')),
        source_json TEXT NOT NULL,
        scores_json TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(source_session_id) REFERENCES calibration_sessions(id)
      );
      CREATE INDEX IF NOT EXISTS calibration_evaluations_participant
        ON calibration_evaluations(participant_user_id, created_at DESC);
    `);
  }

  close() { this.db.close(); }

  createSession(userId, input) {
    const now = input.startedAt ?? new Date().toISOString();
    const session = {
      ...input,
      id: input.id ?? randomUUID(),
      participantId: userId,
      status: input.status ?? "collecting_answers",
      currentQuestionIndex: input.currentQuestionIndex ?? 0,
      startedAt: now,
      lastUpdatedAt: input.lastUpdatedAt ?? now,
      participantResponses: input.participantResponses ?? [],
      supportingEvidence: input.supportingEvidence ?? [],
      possibleDisconfirmingEvidence: input.possibleDisconfirmingEvidence ?? [],
      evidenceReferences: input.evidenceReferences ?? [],
      unknowns: input.unknowns ?? [],
      importantDirectQuotes: input.importantDirectQuotes ?? [],
      numericalFeedback: input.numericalFeedback ?? {},
      openEndedFeedback: input.openEndedFeedback ?? {},
    };
    this.#insert(userId, session, null, null);
    if (session.status === "completed") this.#createBusinessDNARecord(userId, session);
    return session;
  }

  saveSession(userId, session) {
    session = stripSessionReadModel(session);
    const existing = this.#rowForOwner(userId, session.id);
    if (!existing) throw Object.assign(new Error("Session not found."), { status: 404 });
    if (existing.status === "completed") {
      const existingJson = JSON.parse(existing.session_json);
      if (JSON.stringify(existingJson) !== JSON.stringify(session)) {
        throw Object.assign(new Error("Completed calibration sessions are immutable."), { status: 409 });
      }
      return existingJson;
    }
    const existingJson = JSON.parse(existing.session_json);
    if (session.participantResponses.length < existingJson.participantResponses.length ||
        statusRank(session.status) < statusRank(existing.status) ||
        Object.keys(session.numericalFeedback ?? {}).length < Object.keys(existingJson.numericalFeedback ?? {}).length ||
        Object.keys(session.openEndedFeedback ?? {}).length < Object.keys(existingJson.openEndedFeedback ?? {}).length) {
      throw Object.assign(new Error("Calibration progress cannot move backward."), { status: 409 });
    }
    const priorResponses = session.participantResponses.slice(0, existingJson.participantResponses.length);
    if (JSON.stringify(priorResponses) !== JSON.stringify(existingJson.participantResponses)) {
      throw Object.assign(new Error("Saved participant answers are immutable."), { status: 409 });
    }
    const priorOriginal = existing.original_model_json;
    const incomingOriginal = session.originalStructuredGenerationOutput
      ? JSON.stringify(session.originalStructuredGenerationOutput)
      : session.generatedProfile
        ? JSON.stringify(session.generatedProfile)
        : null;
    if (priorOriginal && incomingOriginal && priorOriginal !== incomingOriginal) {
      throw Object.assign(new Error("The original generated model cannot be overwritten."), { status: 409 });
    }
    const updated = { ...session, lastUpdatedAt: new Date().toISOString() };
    this.db.prepare(`UPDATE calibration_sessions SET
      participant_code=?, status=?, current_question_index=?, updated_at=?, completed_at=?,
      session_json=?, original_model_json=COALESCE(original_model_json, ?),
      fallback_output_json=COALESCE(fallback_output_json, ?)
      WHERE id=? AND user_id=?`).run(
      updated.participantCode ?? null,
      updated.status,
      updated.currentQuestionIndex,
      updated.lastUpdatedAt,
      updated.completedAt ?? null,
      JSON.stringify(updated),
      incomingOriginal,
      updated.generationProvenance?.generatorType === "deterministic_fallback"
        ? JSON.stringify(updated.generatedProfile ?? null)
        : null,
      updated.id,
      userId,
    );
    if (updated.status === "completed") this.#createBusinessDNARecord(userId, updated);
    return updated;
  }

  getSession(userId, id) {
    const row = this.#rowForOwner(userId, id);
    if (!row) throw Object.assign(new Error("Session not found."), { status: 404 });
    return this.#withGenerationAttempts(userId, JSON.parse(row.session_json));
  }

  listSessions(userId) {
    return this.db.prepare(
      "SELECT session_json FROM calibration_sessions WHERE user_id=? ORDER BY updated_at DESC",
    ).all(userId).map((row) => this.#withGenerationAttempts(userId, JSON.parse(row.session_json)));
  }

  createGenerationAttempt(userId, sessionId, pipelineResult) {
    const session = this.#rowForOwner(userId, sessionId);
    if (!session) throw Object.assign(new Error("Session not found."), { status: 404 });
    const createdAt = new Date().toISOString();
    const attempt = {
      id: randomUUID(),
      sourceSessionId: sessionId,
      outcome: pipelineResult.provenance.generatorType === "ai_assisted"
        ? "ai_assisted"
        : "failed_with_fallback",
      requestedModelFamily: "GPT-5.6",
      generation: pipelineResult.generation,
      provenance: pipelineResult.provenance,
      originalStructuredOutput: pipelineResult.originalStructuredOutput,
      createdAt,
    };
    this.db.prepare(`INSERT INTO calibration_generation_attempts
      (id,user_id,source_session_id,outcome,attempt_json,created_at)
      VALUES (?,?,?,?,?,?)`).run(
      attempt.id, userId, sessionId, attempt.outcome, JSON.stringify(attempt), createdAt,
    );
    return attempt;
  }

  listGenerationAttempts(userId, sessionId) {
    return this.db.prepare(`SELECT attempt_json FROM calibration_generation_attempts
      WHERE user_id=? AND source_session_id=? ORDER BY created_at DESC`).all(
      userId, sessionId,
    ).map((row) => JSON.parse(row.attempt_json));
  }

  importSessions(userId, sessions, canonical) {
    const imported = [];
    const duplicates = [];
    this.db.exec("BEGIN IMMEDIATE");
    try {
      for (const session of sessions) {
        validateCanonicalSession(session, canonical);
        const fingerprint = migrationFingerprint(userId, session);
        const duplicate = this.db.prepare(
          "SELECT id FROM calibration_sessions WHERE user_id=? AND import_fingerprint=?",
        ).get(userId, fingerprint);
        if (duplicate) { duplicates.push(duplicate.id); continue; }
        const migration = {
          source: "localStorage",
          importedAt: new Date().toISOString(),
          originalSessionId: session.id,
          fingerprint,
        };
        const importedSession = {
          ...session,
          participantId: userId,
          migrationProvenance: migration,
        };
        this.#insert(userId, importedSession, fingerprint, migration);
        if (session.status === "completed") this.#createBusinessDNARecord(userId, session);
        imported.push(session.id);
      }
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    return { imported, duplicates };
  }

  getBusinessDNARecord(userId, sessionId) {
    const row = this.db.prepare(
      "SELECT record_json FROM business_dna_records WHERE user_id=? AND source_session_id=?",
    ).get(userId, sessionId);
    if (!row) throw Object.assign(new Error("Business DNA record not found."), { status: 404 });
    return JSON.parse(row.record_json);
  }

  createEvaluation(reviewerId, participantUserId, input) {
    const evaluation = {
      id: input.id ?? randomUUID(), reviewerId, participantUserId,
      sourceSessionId: input.sourceSessionId ?? null,
      sourceKind: input.sourceKind, source: input.source,
      scores: input.scores, notes: input.notes ?? "",
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    this.db.prepare(`INSERT INTO calibration_evaluations
      (id,reviewer_id,participant_user_id,source_session_id,source_kind,source_json,scores_json,notes,created_at)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(
      evaluation.id, reviewerId, participantUserId, evaluation.sourceSessionId,
      evaluation.sourceKind, JSON.stringify(evaluation.source), JSON.stringify(evaluation.scores),
      evaluation.notes, evaluation.createdAt,
    );
    return evaluation;
  }

  listEvaluations(reviewerId, participantUserId) {
    return this.db.prepare(`SELECT * FROM calibration_evaluations
      WHERE reviewer_id=? AND participant_user_id=? ORDER BY created_at DESC`).all(
      reviewerId, participantUserId,
    ).map((row) => ({
      id: row.id, reviewerId: row.reviewer_id, participantUserId: row.participant_user_id,
      sourceSessionId: row.source_session_id, sourceKind: row.source_kind,
      source: JSON.parse(row.source_json), scores: JSON.parse(row.scores_json),
      notes: row.notes, createdAt: row.created_at,
    }));
  }

  exportParticipant(userId) {
    const sessions = this.listSessions(userId);
    const records = this.db.prepare(
      "SELECT record_json FROM business_dna_records WHERE user_id=? ORDER BY created_at",
    ).all(userId).map((row) => JSON.parse(row.record_json));
    const evaluations = this.db.prepare(
      "SELECT * FROM calibration_evaluations WHERE participant_user_id=? ORDER BY created_at",
    ).all(userId).map((row) => ({
      id: row.id, reviewerId: row.reviewer_id, participantUserId: row.participant_user_id,
      sourceSessionId: row.source_session_id, sourceKind: row.source_kind,
      source: JSON.parse(row.source_json), scores: JSON.parse(row.scores_json),
      notes: row.notes, createdAt: row.created_at,
    }));
    const generationAttempts = this.db.prepare(
      "SELECT attempt_json FROM calibration_generation_attempts WHERE user_id=? ORDER BY created_at",
    ).all(userId).map((row) => JSON.parse(row.attempt_json));
    return { exportedAt: new Date().toISOString(), userId, sessions, generationAttempts, businessDNARecords: records, evaluations };
  }

  deleteParticipant(userId) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const evaluations = this.db.prepare(
        "DELETE FROM calibration_evaluations WHERE participant_user_id=?",
      ).run(userId).changes;
      const generationAttempts = this.db.prepare(
        "DELETE FROM calibration_generation_attempts WHERE user_id=?",
      ).run(userId).changes;
      const records = this.db.prepare("DELETE FROM business_dna_records WHERE user_id=?").run(userId).changes;
      const sessions = this.db.prepare("DELETE FROM calibration_sessions WHERE user_id=?").run(userId).changes;
      this.db.exec("COMMIT");
      return { userId, deleted: { sessions, generationAttempts, businessDNARecords: records, evaluations } };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  async backupTo(destinationPath) {
    this.db.exec("PRAGMA wal_checkpoint(FULL)");
    await backupDatabaseFile(this.db, destinationPath);
    return destinationPath;
  }

  #insert(userId, session, fingerprint, migration) {
    session = stripSessionReadModel(session);
    const original = session.originalStructuredGenerationOutput ?? session.generatedProfile ?? null;
    this.db.prepare(`INSERT INTO calibration_sessions (
      id,user_id,participant_code,calibration_id,semantic_version,frozen_hash,status,
      current_question_index,started_at,updated_at,completed_at,session_json,
      original_model_json,fallback_output_json,import_fingerprint,migration_provenance_json
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      session.id, userId, session.participantCode ?? null, session.calibrationId,
      session.semanticVersion, session.frozenSourceHash, session.status,
      session.currentQuestionIndex, session.startedAt,
      session.lastUpdatedAt ?? session.startedAt, session.completedAt ?? null,
      JSON.stringify(session), original ? JSON.stringify(original) : null,
      session.generationProvenance?.generatorType === "deterministic_fallback"
        ? JSON.stringify(session.generatedProfile ?? null) : null,
      fingerprint, migration ? JSON.stringify(migration) : null,
    );
  }

  #rowForOwner(userId, id) {
    return this.db.prepare(
      "SELECT * FROM calibration_sessions WHERE id=? AND user_id=?",
    ).get(id, userId);
  }

  #withGenerationAttempts(userId, session) {
    return { ...session, generationAttempts: this.listGenerationAttempts(userId, session.id) };
  }

  #createBusinessDNARecord(userId, session) {
    const record = {
      id: randomUUID(),
      effectiveDate: session.completedAt,
      sourceCalibrationSessionId: session.id,
      sourceCalibrationVersion: session.semanticVersion,
      sourceHash: session.frozenSourceHash,
      centralHypothesis: session.centralHypothesis,
      evidence: session.supportingEvidence,
      confidence: session.confidenceLevel,
      unknowns: session.unknowns,
      contradictions: session.possibleDisconfirmingEvidence,
      experiment: session.proposedExperiment,
      generationProvenance: session.generationProvenance,
      status: "initial_provisional_model",
    };
    this.db.prepare(`INSERT OR IGNORE INTO business_dna_records
      (id,user_id,source_session_id,effective_date,source_version,source_hash,status,record_json,created_at)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(
      record.id, userId, session.id, session.completedAt, session.semanticVersion,
      session.frozenSourceHash, record.status, JSON.stringify(record), new Date().toISOString(),
    );
  }
}

export function validateCanonicalSession(session, canonical) {
  if (!session || typeof session !== "object") throw Object.assign(new Error("Invalid session."), { status: 400 });
  if (session.calibrationId !== canonical.identifier ||
      session.semanticVersion !== canonical.version ||
      session.frozenSourceHash !== canonical.canonical_source.sha256) {
    throw Object.assign(new Error("Session does not match the canonical calibration."), { status: 400 });
  }
  if (!Array.isArray(session.participantResponses) || session.participantResponses.length > 12) {
    throw Object.assign(new Error("Invalid participant responses."), { status: 400 });
  }
  if (!Number.isInteger(session.currentQuestionIndex) ||
      session.currentQuestionIndex !== session.participantResponses.length) {
    throw Object.assign(new Error("Invalid calibration progress."), { status: 400 });
  }
  session.participantResponses.forEach((response, index) => {
    const expected = canonical.onboarding_questions[index];
    if (!expected || response?.questionId !== expected.id ||
        !(typeof response.response === "string" ||
          (Array.isArray(response.response) && response.response.every((item) => typeof item === "string")))) {
      throw Object.assign(new Error("Participant responses must follow canonical question order."), { status: 400 });
    }
  });
  if (!["collecting_answers", "model_ready", "collecting_feedback", "completed"].includes(session.status)) {
    throw Object.assign(new Error("Invalid calibration status."), { status: 400 });
  }
}

function migrationFingerprint(userId, session) {
  return createHash("sha256").update(JSON.stringify({
    userId,
    id: session.id,
    calibrationId: session.calibrationId,
    version: session.semanticVersion,
    hash: session.frozenSourceHash,
    startedAt: session.startedAt,
  })).digest("hex");
}

function statusRank(status) {
  return { collecting_answers: 0, model_ready: 1, collecting_feedback: 2, completed: 3 }[status] ?? -1;
}

function stripSessionReadModel(session) {
  const { generationAttempts: _generationAttempts, ...persisted } = session;
  return persisted;
}
