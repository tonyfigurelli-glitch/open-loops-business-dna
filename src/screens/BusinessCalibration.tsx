import { useState } from "react";
import {
  calibrationDefinitionForVersion,
  smallBusinessOwnerCalibration,
} from "../domain/calibrations/smallBusinessOwnerCalibration";
import type {
  CalibrationGenerationAttempt,
  CalibrationResponse,
  CalibrationSession,
} from "../domain/models";
import {
  completeCalibrationGenerationRetry,
  generationStateForAttempt,
  type GenerationDisplayState,
} from "../storage/calibrationApi";
import { deduplicateUncertaintyItems } from "../domain/calibrations/aiModelGenerationPipeline";

type BusinessCalibrationProps = {
  session: CalibrationSession;
  onAnswer: (response: CalibrationResponse) => void | Promise<void>;
  onBackHome: () => void;
  onNumericalFeedback: (feedbackId: string, value: 1 | 2 | 3 | 4 | 5) => void;
  onOpenEndedFeedback: (feedbackId: string, value: string) => void;
  onRetryGeneration: (sessionId: string) => Promise<CalibrationGenerationAttempt>;
  onSelectSession: (sessionId: string) => void;
  onStartNewCalibration: () => void | Promise<void>;
  sessions: CalibrationSession[];
};

export function BusinessCalibration({
  session,
  onAnswer,
  onBackHome,
  onNumericalFeedback,
  onOpenEndedFeedback,
  onRetryGeneration,
  onSelectSession,
  onStartNewCalibration,
  sessions,
}: BusinessCalibrationProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collectingFeedback, setCollectingFeedback] = useState(
    session.status === "collecting_feedback",
  );
  const questions = smallBusinessOwnerCalibration.onboarding_questions;
  const currentQuestion = questions[session.currentQuestionIndex];

  if (session.status === "completed") {
    return (
      <CompletedCalibration
        onBackHome={onBackHome}
        onRetryGeneration={onRetryGeneration}
        onSelectSession={onSelectSession}
        onStartNewCalibration={onStartNewCalibration}
        session={session}
        sessions={sessions}
      />
    );
  }

  if (currentQuestion) {
    const needsOtherDetail =
      draft === "Something else" || draft.startsWith("Something else:");

    return (
      <section className="calibration-screen">
        <header className="surface-header">
          <p className="eyebrow">Business DNA · Calibration {smallBusinessOwnerCalibration.display_version}</p>
          <h1>Let’s begin with your business.</h1>
          <p className="hero-copy">Question {currentQuestion.order} of {questions.length}</p>
          <CalibrationIdentity session={session} />
          <SessionHistory onSelectSession={onSelectSession} session={session} sessions={sessions} />
        </header>
        <div className="calibration-progress" aria-hidden="true">
          <span style={{ width: `${(currentQuestion.order / questions.length) * 100}%` }} />
        </div>
        <article className="calibration-card">
          <h2>{currentQuestion.prompt}</h2>
          {currentQuestion.options.length ? (
            <div className="calibration-options">
              {currentQuestion.options.map((option) => (
                <button
                  className={draft === option ? "calibration-option selected" : "calibration-option"}
                  key={option}
                  onClick={() => setDraft(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Your answer"
              rows={5}
              value={draft}
            />
          )}
          {needsOtherDetail ? (
            <input
              aria-label="Describe your role"
              onChange={(event) => setDraft(`Something else: ${event.target.value}`)}
              placeholder="Describe your role"
              type="text"
              value={draft.replace(/^Something else:\s*/, "")}
            />
          ) : null}
          <button
            className="primary-button"
            disabled={
              submitting ||
              !draft.trim() ||
              draft === "Something else" ||
              draft === "Something else:"
            }
            onClick={() => {
              setSubmitting(true);
              Promise.resolve(onAnswer({
                questionId: currentQuestion.id,
                response: draft.trim(),
                answeredAt: new Date().toISOString(),
              })).finally(() => {
                setDraft("");
                setSubmitting(false);
              });
            }}
            type="button"
          >
            {submitting
              ? "Building your model…"
              : currentQuestion.order === questions.length
                ? "Create my first model"
                : "Continue"}
          </button>
        </article>
      </section>
    );
  }

  if (!collectingFeedback) {
    return (
      <ModelView
        onBeginFeedback={() => setCollectingFeedback(true)}
        onBackHome={onBackHome}
        session={session}
      />
    );
  }

  return (
    <FeedbackFlow
      onBackHome={onBackHome}
      onNumericalFeedback={onNumericalFeedback}
      onOpenEndedFeedback={onOpenEndedFeedback}
      session={session}
    />
  );
}

function ModelView({ session, onBeginFeedback, onBackHome }: {
  session: CalibrationSession;
  onBeginFeedback: () => void;
  onBackHome: () => void;
}) {
  return (
    <section className="calibration-screen">
      <header className="surface-header">
        <p className="eyebrow">Your initial Business DNA</p>
        <h1>A first model, not a final judgment.</h1>
        <p className="hero-copy">Confidence: {session.confidenceLevel ?? "unknown"}</p>
        <CalibrationIdentity session={session} />
      </header>
      <ProfileSections sections={session.generatedProfile?.sections ?? []} />
      <button className="primary-button" onClick={onBeginFeedback} type="button">
        Share feedback
      </button>
      <button className="ghost-button" onClick={onBackHome} type="button">Back home</button>
    </section>
  );
}

function FeedbackFlow({ session, onBackHome, onNumericalFeedback, onOpenEndedFeedback }: {
  session: CalibrationSession;
  onBackHome: () => void;
  onNumericalFeedback: (feedbackId: string, value: 1 | 2 | 3 | 4 | 5) => void;
  onOpenEndedFeedback: (feedbackId: string, value: string) => void;
}) {
  const ratings = smallBusinessOwnerCalibration.participant_feedback.rating_questions;
  const openQuestions = smallBusinessOwnerCalibration.participant_feedback.open_ended_questions;
  const ratingIndex = Object.keys(session.numericalFeedback).length;
  const openIndex = Object.keys(session.openEndedFeedback).length;
  const [draft, setDraft] = useState("");
  const rating = ratings[ratingIndex];
  const openQuestion = rating ? undefined : openQuestions[openIndex];
  const totalQuestions = ratings.length + openQuestions.length;
  const completedQuestions = ratingIndex + openIndex;
  const currentQuestionNumber = Math.min(completedQuestions + 1, totalQuestions);

  return (
    <section className="calibration-screen">
      <header className="surface-header">
        <p className="eyebrow">Help this understanding improve</p>
        <h1>{rating ? rating.statement : openQuestion?.prompt}</h1>
        <p className="hero-copy">Feedback question {currentQuestionNumber} of {totalQuestions}</p>
        <CalibrationIdentity session={session} />
      </header>
      <div
        className="calibration-progress"
        aria-label={`Feedback question ${currentQuestionNumber} of ${totalQuestions}`}
      >
        <span style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }} />
      </div>
      <article className="calibration-card">
        {rating ? (
          <div className="rating-options">
            {smallBusinessOwnerCalibration.participant_feedback.rating_scale.map((option) => (
              <button
                key={option.value}
                onClick={() => onNumericalFeedback(
                  rating.id,
                  option.value as 1 | 2 | 3 | 4 | 5,
                )}
                type="button"
              >
                <strong>{option.value}</strong><span>{option.label}</span>
              </button>
            ))}
          </div>
        ) : openQuestion ? (
          <>
            <textarea onChange={(event) => setDraft(event.target.value)} rows={5} value={draft} />
            <button
              className="primary-button"
              disabled={!draft.trim()}
              onClick={() => {
                onOpenEndedFeedback(openQuestion.id, draft.trim());
                setDraft("");
              }}
              type="button"
            >
              {openIndex === openQuestions.length - 1 ? "Complete calibration" : "Continue"}
            </button>
          </>
        ) : null}
      </article>
      <button className="ghost-button" onClick={onBackHome} type="button">Finish later</button>
    </section>
  );
}

function CalibrationIdentity({ session }: { session: CalibrationSession }) {
  return <p className="calibration-version">Calibration version {session.semanticVersion}</p>;
}

function CompletedCalibration({
  session,
  sessions,
  onBackHome,
  onRetryGeneration,
  onSelectSession,
  onStartNewCalibration,
}: {
  session: CalibrationSession;
  sessions: CalibrationSession[];
  onBackHome: () => void;
  onRetryGeneration: (sessionId: string) => Promise<CalibrationGenerationAttempt>;
  onSelectSession: (sessionId: string) => void;
  onStartNewCalibration: () => void | Promise<void>;
}) {
  const sessionDefinition = calibrationDefinitionForVersion(session.semanticVersion);
  const [generationState, setGenerationState] = useState<GenerationDisplayState>("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const latestAttempt = session.generationAttempts?.[0];
  const successfulAttempt = session.generationAttempts?.find(
    (attempt) => attempt.outcome === "ai_assisted",
  );
  const displayedGeneration = successfulAttempt?.generation;
  const displayedProfile = displayedGeneration?.generatedProfile ?? session.generatedProfile;
  const displayedProvenance = successfulAttempt?.provenance ?? session.generationProvenance;
  const displayedUnknowns = deduplicateUncertaintyItems(
    displayedGeneration?.unknowns ?? session.unknowns,
  );
  const displayedDisconfirmingEvidence = deduplicateUncertaintyItems(
    displayedGeneration?.possibleDisconfirmingEvidence ?? session.possibleDisconfirmingEvidence,
  );
  const displayedExperiment = displayedGeneration?.proposedExperiment ?? session.proposedExperiment;
  const canRetry = session.generationProvenance?.generatorType === "deterministic_fallback"
    && !successfulAttempt;
  const questionById = new Map(
    sessionDefinition.onboarding_questions.map((question) => [question.id, question]),
  );
  const ratingById = new Map(
    sessionDefinition.participant_feedback.rating_questions.map((question) => [question.id, question]),
  );
  const openFeedbackById = new Map(
    sessionDefinition.participant_feedback.open_ended_questions.map((question) => [question.id, question]),
  );

  return (
    <section className="calibration-screen">
      <article className="calibration-card completion-card">
        <div className="completion-heading">
          <div>
            <p className="eyebrow">Your initial Business DNA</p>
            <h1>Your business-owner model</h1>
          </div>
          <span className="completion-badge">Saved</span>
        </div>
        <p className="completion-intro">A living starting point for understanding how you lead, decide, and move your business forward.</p>
        <div className="completion-stats" aria-label="Calibration summary">
          <div><strong>{session.participantResponses.length}</strong><span>answers</span></div>
          <div><strong>{displayedGeneration?.confidenceLevel ?? session.confidenceLevel}</strong><span>confidence</span></div>
          <div><strong>v{session.semanticVersion}</strong><span>calibration</span></div>
        </div>
        <SessionHistory onSelectSession={onSelectSession} session={session} sessions={sessions} />
      </article>
      <GenerationStatus
        error={generationError}
        state={generationState === "idle" && latestAttempt
          ? generationStateForAttempt(latestAttempt)
          : generationState}
      />
      <ProfileSections sections={displayedProfile?.sections ?? []} />
      <section className="review-details" aria-labelledby="review-details-title">
        <div className="review-details-heading">
          <p className="eyebrow">Complete session record</p>
          <h2 id="review-details-title">Review details</h2>
          <p>Open any section when you want to inspect the evidence and saved record.</p>
        </div>
        <details>
          <summary>Stored Interpretation</summary>
          <div className="review-details-content">
            <p><strong>Central hypothesis:</strong> {displayedGeneration?.centralHypothesis ?? session.centralHypothesis}</p>
            <p><strong>Confidence:</strong> {displayedGeneration?.confidenceLevel ?? session.confidenceLevel}</p>
            <p><strong>Unknowns</strong></p>
            <UncertaintyList items={displayedUnknowns} />
            <p><strong>Possible disconfirming evidence</strong></p>
            <UncertaintyList items={displayedDisconfirmingEvidence} />
          </div>
        </details>
        <details>
          <summary>Original Answers</summary>
          <div className="review-details-content">
            <dl className="session-record-list">
              {session.participantResponses.map((response) => (
                <div key={response.questionId}>
                  <dt>{questionById.get(response.questionId)?.prompt ?? response.questionId}</dt>
                  <dd>{Array.isArray(response.response) ? response.response.join(", ") : response.response}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
        <details>
          <summary>Full Seven-Day Experiment</summary>
          <div className="review-details-content">
            <dl className="session-record-list">
              {experimentDetails(displayedExperiment).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </div>
        </details>
        <details>
          <summary>Participant Feedback</summary>
          <div className="review-details-content">
            <dl className="session-record-list">
              {Object.entries(session.numericalFeedback).map(([feedbackId, value]) => (
                <div key={feedbackId}>
                  <dt>{ratingById.get(feedbackId)?.statement ?? feedbackId}</dt>
                  <dd>{value} / 5</dd>
                </div>
              ))}
              {Object.entries(session.openEndedFeedback).map(([feedbackId, value]) => (
                <div key={feedbackId}>
                  <dt>{openFeedbackById.get(feedbackId)?.prompt ?? feedbackId}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
        <details>
          <summary>Generation and Source</summary>
          <div className="review-details-content">
            <p><strong>Generator:</strong> {displayedProvenance?.generatorType ?? "legacy"}</p>
            {displayedProvenance ? (
              <>
                <p><strong>Provider:</strong> {displayedProvenance.provider}</p>
                <p><strong>Model:</strong> {displayedProvenance.modelIdentifier}</p>
                <p><strong>Instruction version:</strong> {displayedProvenance.promptInstructionVersion}</p>
                <p><strong>Generated:</strong> {displayedProvenance.generationTimestamp}</p>
                <p><strong>Provider retries:</strong> {displayedProvenance.retryCount}</p>
                <p><strong>Evidence package hash:</strong> <span className="source-hash">{displayedProvenance.evidencePackageHash}</span></p>
                <p><strong>Validation:</strong> {displayedProvenance.validationResult.valid ? "accepted" : "rejected"}</p>
                {displayedProvenance.validationAttempts?.length ? (
                  <ul className="interpretation-list">
                    {displayedProvenance.validationAttempts.map((attempt) => (
                      <li key={attempt.attempt}>
                        Attempt {attempt.attempt}: {attempt.outcome}
                        {attempt.codes.length ? ` · ${attempt.codes.join(", ")}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : null}
            <p className="source-hash">Version {session.semanticVersion} · Source {session.frozenSourceHash}</p>
          </div>
        </details>
      </section>
      <div className="calibration-actions">
        <button className="primary-button" onClick={onStartNewCalibration} type="button">
          Start New Calibration
        </button>
        {canRetry ? (
          <button
            className="ghost-button"
            disabled={generationState === "connecting"}
            onClick={async () => {
              setGenerationState("connecting");
              setGenerationError(null);
              const result = await completeCalibrationGenerationRetry(
                () => onRetryGeneration(session.id),
              );
              setGenerationState(result.state);
              setGenerationError(result.error);
            }}
            type="button"
          >
            {generationState === "connecting" ? "Connecting…" : "Retry with GPT-5.6"}
          </button>
        ) : null}
        <button className="ghost-button" onClick={onBackHome} type="button">Return home</button>
      </div>
    </section>
  );
}

function ProfileSections({ sections }: {
  sections: Array<{ id: string; title: string; body: string }>;
}) {
  return (
    <div className="model-sections">
      {sections.map((section, index) => (
        <article className="model-section" key={section.id}>
          <div className="model-section-heading">
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p className="section-label">{section.title}</p>
          </div>
          <ProfileSectionBody body={section.body} />
        </article>
      ))}
    </div>
  );
}

function ProfileSectionBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="model-section-body">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const isList = lines.length > 0 && lines.every((line) => /^[•*-]\s+/.test(line));

        return isList ? (
          <ul key={`${index}-${block.slice(0, 24)}`}>
            {lines.map((line) => <li key={line}>{line.replace(/^[•*-]\s+/, "")}</li>)}
          </ul>
        ) : (
          <p key={`${index}-${block.slice(0, 24)}`}>{block}</p>
        );
      })}
    </div>
  );
}

function UncertaintyList({ items }: { items: string[] }) {
  return items.length ? (
    <ul className="interpretation-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  ) : <p>None recorded.</p>;
}

function experimentDetails(experiment: CalibrationSession["proposedExperiment"]) {
  if (!experiment) return [];
  return [
    ["Action", experiment.action],
    ["Hypothesis", experiment.hypothesis],
    ["Minimum deliverable", experiment.minimumDeliverable],
    ["Owner", experiment.owner],
    ["Likely obstacle", experiment.likelyObstacle],
    ["Support that may help", experiment.supportThatMayHelp],
    ["Result to record", experiment.resultToRecord],
    ["What the result would teach", experiment.whatResultWouldTeach],
  ];
}

function SessionHistory({ session, sessions, onSelectSession }: {
  session: CalibrationSession;
  sessions: CalibrationSession[];
  onSelectSession: (sessionId: string) => void;
}) {
  if (sessions.length < 2) return null;

  return (
    <label className="session-history">
      <span>Calibration history</span>
      <select
        aria-label="Calibration history"
        onChange={(event) => onSelectSession(event.target.value)}
        value={session.id}
      >
        {sessions.map((candidate, index) => (
          <option key={candidate.id} value={candidate.id}>
            {formatSessionLabel(candidate, index)}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatSessionLabel(session: CalibrationSession, index: number) {
  const date = new Date(session.startedAt);
  const dateLabel = Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
  return `${index === 0 ? "Latest" : dateLabel} · Version ${session.semanticVersion} · ${formatSessionStatus(session.status)}`;
}

function formatSessionStatus(status: CalibrationSession["status"]) {
  return {
    collecting_answers: "In progress",
    model_ready: "Profile ready",
    collecting_feedback: "Feedback in progress",
    completed: "Complete",
  }[status];
}

function GenerationStatus({ state, error }: {
  state: GenerationDisplayState;
  error: string | null;
}) {
  if (state === "idle") return null;

  const copy = state === "connecting"
    ? "Connecting securely to GPT-5.6… The full validated model may require two provider attempts."
    : state === "successful_ai_assisted"
      ? "AI-assisted generation succeeded. Your original saved result is still preserved."
      : state === "timed_out_with_fallback"
        ? "GPT-5.6 timed out before completing the full model. Your saved deterministic result remains available."
        : state === "validation_rejected_with_fallback"
          ? "The AI-assisted model was generated but did not pass narrative and evidence validation. Your saved deterministic result remains available."
          : state === "request_failed"
            ? "The retry request did not complete in this browser. Your saved deterministic result remains available."
            : "AI-assisted generation failed. Your saved deterministic result remains available.";

  return (
    <div className={`generation-status ${state}`} role="status">
      <strong>{copy}</strong>
      {error ? <p>{error}</p> : null}
    </div>
  );
}
