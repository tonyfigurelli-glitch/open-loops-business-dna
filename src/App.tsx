import { useState } from "react";
import { homeSeed } from "./data/seed";
import type { Insight, LoopConnection, OpenLoop, Thought } from "./domain/models";

type Surface = "Home" | "Loops" | "Lumi" | "Universe" | "Me";

const surfaces: Surface[] = ["Home", "Loops", "Lumi", "Universe", "Me"];

const surfaceCopy: Record<Surface, string> = {
  Home: "Your calm starting point for capturing and connecting thoughts.",
  Loops: "A future workspace for Open Loop bubbles and list view.",
  Lumi: "A future focused conversation space with Lumi.",
  Universe: "A future zoomed-out view of patterns and life themes.",
  Me: "A future home for profile, preferences, and settings.",
};

function App() {
  const [activeSurface, setActiveSurface] = useState<Surface>("Home");

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Open Loops app shell">
        {activeSurface === "Home" ? <HomeScreen /> : <SurfacePlaceholder surface={activeSurface} />}

        <BottomNavigation activeSurface={activeSurface} setActiveSurface={setActiveSurface} />
      </section>
    </main>
  );
}

function HomeScreen() {
  const { connectionPreview, entryPaths, insight, loops, recentThought, spotlightLoop, user } =
    homeSeed;

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
          <button className={`entry-path ${path.tone}-path`} key={path.id} type="button">
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
          <button className="ghost-button" type="button">
            New Loop
          </button>
        </div>
        <BubbleWorkspace loops={loops} />
      </section>

      <InsightCard connection={connectionPreview} insight={insight} loops={loops} />

      <section className="preview-grid" aria-label="Home previews">
        <RecentThoughtCard thought={recentThought} />
        <SpotlightLoopCard loop={spotlightLoop} />
      </section>
    </div>
  );
}

type BubbleWorkspaceProps = {
  loops: OpenLoop[];
};

function BubbleWorkspace({ loops }: BubbleWorkspaceProps) {
  return (
    <div className="bubble-workspace" aria-label="Open Loops bubble workspace preview">
      <svg className="connection-lines" aria-hidden="true" viewBox="0 0 360 270">
        <path d="M73 88 C125 132, 148 133, 201 119" />
        <path d="M214 122 C258 105, 279 84, 309 68" />
        <path d="M210 146 C162 175, 118 199, 74 213" />
        <path d="M231 166 C267 187, 287 205, 320 224" />
      </svg>
      {loops.map((loop) => (
        <div
          className={`loop-bubble ${loop.bubble.tone} ${loop.bubble.size}`}
          key={loop.id}
          style={{ left: loop.bubble.x, top: loop.bubble.y }}
        >
          <strong>{loop.title}</strong>
          <span>{loop.status === "archived" ? "Archived" : `${loop.thoughtCount} thoughts`}</span>
        </div>
      ))}
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
};

function RecentThoughtCard({ thought }: RecentThoughtCardProps) {
  return (
    <article className="small-card">
      <div className="card-meta">
        <p>Recent Thought</p>
        <span>{formatPreviewDate(thought.createdAt)}</span>
      </div>
      <p className="quote">{thought.body}</p>
      <button className="text-action" type="button">
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

type SurfacePlaceholderProps = {
  surface: Surface;
};

function SurfacePlaceholder({ surface }: SurfacePlaceholderProps) {
  return (
    <section className="surface-placeholder" aria-live="polite">
      <p className="eyebrow">{surface}</p>
      <h1>{surface} Surface</h1>
      <p>{surfaceCopy[surface]}</p>
    </section>
  );
}

type BottomNavigationProps = {
  activeSurface: Surface;
  setActiveSurface: (surface: Surface) => void;
};

function BottomNavigation({ activeSurface, setActiveSurface }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {surfaces.map((surface) => (
        <button
          className={activeSurface === surface ? "nav-item active" : "nav-item"}
          key={surface}
          onClick={() => setActiveSurface(surface)}
          type="button"
        >
          <span className="nav-dot" aria-hidden="true" />
          {surface}
        </button>
      ))}
    </nav>
  );
}

export default App;
