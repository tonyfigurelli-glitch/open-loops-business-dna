import { useState } from "react";
import { smallBusinessOwnerCalibration } from "../domain/calibrations/smallBusinessOwnerCalibration";
import type {
  CalibrationResponse,
  CalibrationSession,
} from "../domain/models";

type BusinessCalibrationProps = {
  session: CalibrationSession;
  onAnswer: (response: CalibrationResponse) => void | Promise<void>;
  onBackHome: () => void;
  onNumericalFeedback: (feedbackId: string, value: 1 | 2 | 3 | 4 | 5) => void;
  onOpenEndedFeedback: (feedbackId: string, value: string) => void;
};

export function BusinessCalibration({
  session,
  onAnswer,
  onBackHome,
  onNumericalFeedback,
  onOpenEndedFeedback,
}: BusinessCalibrationProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collectingFeedback, setCollectingFeedback] = useState(
    session.status === "collecting_feedback",
  );
  const questions = smallBusinessOwnerCalibration.onboarding_questions;
  const currentQuestion = questions[session.currentQuestionIndex];

  if (session.status === "completed") {
    return <CompletedCalibration session={session} onBackHome={onBackHome} />;
  }

  if (currentQuestion) {
    const needsOtherDetail =
      draft === "Something else" || draft.startsWith("Something else:");

    return (
      <section className="calibration-screen">
        <header className="surface-header">
          <p className="eyebrow">Business DNA · Calibration 1.3</p>
          <h1>Let’s begin with your business.</h1>
          <p className="hero-copy">Question {currentQuestion.order} of {questions.length}</p>
          <CalibrationIdentity session={session} />
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
      <div className="model-sections">
        {session.generatedProfile?.sections.map((section) => (
          <article className="model-section" key={section.id}>
            <p className="section-label">{section.title}</p>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
      <button className="primary-button" onClick={onBeginFeedback} type="button">
        Share feedback
      </button>
      <button className="ghost-button" onClick={onBackHome} type="button">Back home</button>
    </section>
  );
}

function FeedbackFlow({ session, onNumericalFeedback, onOpenEndedFeedback }: {
  session: CalibrationSession;
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

  return (
    <section className="calibration-screen">
      <header className="surface-header">
        <p className="eyebrow">Help this understanding improve</p>
        <h1>{rating ? rating.statement : openQuestion?.prompt}</h1>
        <CalibrationIdentity session={session} />
      </header>
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
    </section>
  );
}

function CalibrationIdentity({ session }: { session: CalibrationSession }) {
  return <p className="source-hash">Version {session.semanticVersion} · Source {session.frozenSourceHash}</p>;
}

function CompletedCalibration({ session, onBackHome }: { session: CalibrationSession; onBackHome: () => void }) {
  const questionById = new Map(
    smallBusinessOwnerCalibration.onboarding_questions.map((question) => [question.id, question]),
  );
  const ratingById = new Map(
    smallBusinessOwnerCalibration.participant_feedback.rating_questions.map((question) => [question.id, question]),
  );
  const openFeedbackById = new Map(
    smallBusinessOwnerCalibration.participant_feedback.open_ended_questions.map((question) => [question.id, question]),
  );

  return (
    <section className="calibration-screen">
      <article className="calibration-card completion-card">
        <p className="eyebrow">Calibration preserved</p>
        <h1>Your complete session is saved.</h1>
        <p>Version {session.semanticVersion} · {session.participantResponses.length} answers · {session.confidenceLevel} confidence</p>
        <p>
          Generator: {session.generationProvenance?.generatorType ?? "legacy"}
          {session.generationProvenance
            ? ` · ${session.generationProvenance.provider} · ${session.generationProvenance.modelIdentifier}`
            : ""}
        </p>
        <p className="source-hash">Source {session.frozenSourceHash}</p>
      </article>
      <div className="model-sections">
        {session.generatedProfile?.sections.map((section) => (
          <article className="model-section" key={section.id}>
            <p className="section-label">{section.title}</p>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
      <article className="model-section">
        <p className="section-label">Stored interpretation</p>
        <p><strong>Central hypothesis:</strong> {session.centralHypothesis}</p>
        <p><strong>Confidence:</strong> {session.confidenceLevel}</p>
        <p><strong>Unknowns:</strong> {session.unknowns.join(" · ")}</p>
        <p><strong>Possible disconfirming evidence:</strong> {session.possibleDisconfirmingEvidence.join(" · ")}</p>
      </article>
      <article className="model-section">
        <p className="section-label">Original answers</p>
        <dl className="session-record-list">
          {session.participantResponses.map((response) => (
            <div key={response.questionId}>
              <dt>{questionById.get(response.questionId)?.prompt ?? response.questionId}</dt>
              <dd>{Array.isArray(response.response) ? response.response.join(", ") : response.response}</dd>
            </div>
          ))}
        </dl>
      </article>
      <article className="model-section">
        <p className="section-label">Seven-day experiment</p>
        <p>{session.proposedExperiment?.action}</p>
        <p><strong>Hypothesis:</strong> {session.proposedExperiment?.hypothesis}</p>
        <p><strong>Result to record:</strong> {session.proposedExperiment?.resultToRecord}</p>
      </article>
      <article className="model-section">
        <p className="section-label">Participant feedback</p>
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
      </article>
      <button className="primary-button" onClick={onBackHome} type="button">Return home</button>
    </section>
  );
}
