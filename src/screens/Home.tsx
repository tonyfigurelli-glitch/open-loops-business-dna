import { BubbleWorkspace } from "../components/BubbleWorkspace";
import { buildCalibrationDashboardSummary } from "../domain/calibrations/calibrationDashboard";
import { smallBusinessOwnerCalibration } from "../domain/calibrations/smallBusinessOwnerCalibration";
import type { CalibrationSession, Insight, LoopConnection, OpenLoop, Thought } from "../domain/models";

type EntryPath = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: string;
};

type HomeScreenProps = {
  calibrationSessions: CalibrationSession[];
  connectionPreview: LoopConnection;
  entryPaths: readonly EntryPath[];
  insight: Insight;
  loops: OpenLoop[];
  recentThought: Thought;
  spotlightLoop: OpenLoop;
  user: {
    greeting: string;
    lumiPrompt: string;
  };
  onAddThoughtToLoop: () => void;
  onEntryPathSelect: (entryPathId: string) => void;
  onNewLoop: () => void;
  onStartNewCalibration: () => void;
  onViewThoughtLibrary: () => void;
};

export function HomeScreen({
  calibrationSessions,
  connectionPreview,
  entryPaths,
  insight,
  loops,
  recentThought,
  spotlightLoop,
  user,
  onAddThoughtToLoop,
  onEntryPathSelect,
  onNewLoop,
  onStartNewCalibration,
  onViewThoughtLibrary,
}: HomeScreenProps) {
  const dashboard = buildCalibrationDashboardSummary(
    calibrationSessions,
    smallBusinessOwnerCalibration.onboarding_questions.length,
    smallBusinessOwnerCalibration.participant_feedback.rating_questions.length +
      smallBusinessOwnerCalibration.participant_feedback.open_ended_questions.length,
  );
  const standardEntryPaths = entryPaths.filter((path) => path.id !== "business-dna-calibration");
  const businessEntryPath = entryPaths.find((path) => path.id === "business-dna-calibration");

  return (
    <div className="home-screen">
      <header className="hero">
        <div>
          <p className="eyebrow">Open Loops</p>
          <h1>{user.greeting}</h1>
          <p className="hero-copy">{user.lumiPrompt}</p>
        </div>
        <div className="lumi-orb" aria-label="Lumi presence">
          <span className="lumi-face">
            <span />
            <span />
          </span>
        </div>
      </header>

      <section className="entry-paths" aria-label="Primary entry paths">
        {standardEntryPaths.map((path) => (
          <button
            className={`entry-path ${path.tone}-path`}
            key={path.id}
            onClick={() => onEntryPathSelect(path.id)}
            type="button"
          >
            <span className="entry-path-icon" aria-hidden="true">
              {path.icon}
            </span>
            <span className="entry-path-copy">
              <strong>{path.title}</strong>
              <span>{path.subtitle}</span>
            </span>
          </button>
        ))}
        {dashboard ? (
          <BusinessDnaDashboard
            onOpen={() => onEntryPathSelect("business-dna-calibration")}
            onStartNew={onStartNewCalibration}
            summary={dashboard}
          />
        ) : businessEntryPath ? (
          <button
            className={`entry-path ${businessEntryPath.tone}-path`}
            onClick={() => onEntryPathSelect(businessEntryPath.id)}
            type="button"
          >
            <span className="entry-path-icon" aria-hidden="true">{businessEntryPath.icon}</span>
            <span className="entry-path-copy">
              <strong>{businessEntryPath.title}</strong>
              <span>{businessEntryPath.subtitle}</span>
            </span>
          </button>
        ) : null}
      </section>

      <section className="loop-section" aria-labelledby="loops-title">
        <div className="section-heading">
          <div>
            <p className="section-label">Open Loops</p>
            <h2 id="loops-title">What keeps returning.</h2>
          </div>
          <button className="ghost-button" onClick={onNewLoop} type="button">
            New Loop
          </button>
        </div>
        <BubbleWorkspace loops={loops} />
      </section>

      <InsightCard connection={connectionPreview} insight={insight} loops={loops} />

      <section className="preview-grid" aria-label="Home previews">
        <RecentThoughtCard
          onAddThoughtToLoop={onAddThoughtToLoop}
          onViewThoughtLibrary={onViewThoughtLibrary}
          thought={recentThought}
        />
        <SpotlightLoopCard loop={spotlightLoop} />
      </section>
    </div>
  );
}

function BusinessDnaDashboard({ summary, onOpen, onStartNew }: {
  summary: NonNullable<ReturnType<typeof buildCalibrationDashboardSummary>>;
  onOpen: () => void;
  onStartNew: () => void;
}) {
  return (
    <article className="business-dashboard">
      <div className="business-dashboard-heading">
        <span className="business-mark" aria-hidden="true">DNA</span>
        <div>
          <p className="section-label">Business DNA</p>
          <h2>Your business-owner model</h2>
        </div>
        <span className={`business-status ${summary.activeSession.status}`}>{summary.statusLabel}</span>
      </div>
      <p className="business-progress-copy">{summary.progressLabel}</p>
      <div className="business-progress" aria-label={summary.progressLabel}>
        <span style={{ width: `${summary.progressPercent}%` }} />
      </div>
      <div className="business-dashboard-meta">
        <span>Version {summary.activeSession.semanticVersion}</span>
        <span>{summary.sessionCount} saved {summary.sessionCount === 1 ? "session" : "sessions"}</span>
      </div>
      <div className="business-dashboard-actions">
        <button className="business-primary-action" onClick={onOpen} type="button">
          {summary.actionLabel}
        </button>
        {summary.activeSession.status === "completed" ? (
          <button className="business-secondary-action" onClick={onStartNew} type="button">
            Start another
          </button>
        ) : null}
      </div>
    </article>
  );
}

type InsightCardProps = {
  connection: LoopConnection;
  insight: Insight;
  loops: OpenLoop[];
};

function InsightCard({ connection, insight, loops }: InsightCardProps) {
  const connectedLoopTitles = connection.loopIds
    .map((loopId) => loops.find((loop) => loop.id === loopId)?.title)
    .filter(Boolean)
    .join(" + ");

  return (
    <article className="insight-card">
      <div className="spark" aria-hidden="true" />
      <div>
        <p>Connection forming</p>
        <h3>{connectedLoopTitles || insight.title}</h3>
        <button className="text-action" type="button">
          View
        </button>
      </div>
    </article>
  );
}

type RecentThoughtCardProps = {
  thought: Thought;
  onAddThoughtToLoop: () => void;
  onViewThoughtLibrary: () => void;
};

function RecentThoughtCard({
  thought,
  onAddThoughtToLoop,
  onViewThoughtLibrary,
}: RecentThoughtCardProps) {
  return (
    <article className="small-card">
      <div className="card-meta">
        <p>Recent Thought</p>
        <span>{formatPreviewDate(thought.createdAt)}</span>
      </div>
      <p className="quote">{formatRecentThoughtPreview(thought)}</p>
      <div className="card-actions">
        <button className="text-action" onClick={onAddThoughtToLoop} type="button">
          Add to Loop
        </button>
        <button className="text-action" onClick={onViewThoughtLibrary} type="button">
          View all thoughts
        </button>
      </div>
    </article>
  );
}

type SpotlightLoopCardProps = {
  loop: OpenLoop;
};

function SpotlightLoopCard({ loop }: SpotlightLoopCardProps) {
  return (
    <article className="small-card spotlight-card">
      <div className="card-meta">
        <p>Spotlight</p>
        <span className="status-pill">{formatStatus(loop.status)}</span>
      </div>
      <h3>{loop.title}</h3>
      <button className="text-action green" type="button">
        Continue
      </button>
    </article>
  );
}

function formatPreviewDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatStatus(status: OpenLoop["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRecentThoughtPreview(thought: Thought) {
  if (thought.id === "thought-simplifying-life") {
    return "Simplifying life even more...";
  }

  if (thought.body.length <= 72) {
    return thought.body;
  }

  return `${thought.body.slice(0, 69)}...`;
}
