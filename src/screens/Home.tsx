import { BubbleWorkspace } from "../components/BubbleWorkspace";
import type { Insight, LoopConnection, OpenLoop, Thought } from "../domain/models";

type EntryPath = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: string;
};

type HomeScreenProps = {
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
};

export function HomeScreen({
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
}: HomeScreenProps) {
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
        {entryPaths.map((path) => (
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
      </section>

      <section className="loop-section" aria-labelledby="loops-title">
        <div className="section-heading">
          <div>
            <p className="section-label">Your Open Loops</p>
            <h2 id="loops-title">A living map of what you keep returning to.</h2>
          </div>
          <button className="ghost-button" onClick={onNewLoop} type="button">
            New Loop
          </button>
        </div>
        <BubbleWorkspace loops={loops} />
      </section>

      <InsightCard connection={connectionPreview} insight={insight} loops={loops} />

      <section className="preview-grid" aria-label="Home previews">
        <RecentThoughtCard onAddThoughtToLoop={onAddThoughtToLoop} thought={recentThought} />
        <SpotlightLoopCard loop={spotlightLoop} />
      </section>
    </div>
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
    .join(" and ");

  return (
    <article className="insight-card">
      <div className="spark" aria-hidden="true" />
      <div>
        <p>{insight.body}</p>
        <h3>{connectedLoopTitles || insight.title}</h3>
        <button className="text-action" type="button">
          View connection
        </button>
      </div>
    </article>
  );
}

type RecentThoughtCardProps = {
  thought: Thought;
  onAddThoughtToLoop: () => void;
};

function RecentThoughtCard({ thought, onAddThoughtToLoop }: RecentThoughtCardProps) {
  return (
    <article className="small-card">
      <div className="card-meta">
        <p>Recent Thought</p>
        <span>{formatPreviewDate(thought.createdAt)}</span>
      </div>
      <p className="quote">{thought.body}</p>
      <button className="text-action" onClick={onAddThoughtToLoop} type="button">
        Add to an Open Loop
      </button>
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
        <p>Open Loop</p>
        <span className="status-pill">{formatStatus(loop.status)}</span>
      </div>
      <h3>{loop.title}</h3>
      <p className="spotlight-description">{loop.description}</p>
      <button className="text-action green" type="button">
        Continue exploring
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
