import { useState } from "react";

type Surface = "Home" | "Loops" | "Lumi" | "Universe" | "Me";

type LoopPreview = {
  title: string;
  count: string;
  tone: "violet" | "blue" | "green" | "orange" | "silver";
  size: "large" | "medium" | "small";
  x: string;
  y: string;
};

const surfaces: Surface[] = ["Home", "Loops", "Lumi", "Universe", "Me"];

const loops: LoopPreview[] = [
  {
    title: "Financial Freedom",
    count: "31 thoughts",
    tone: "violet",
    size: "large",
    x: "38%",
    y: "34%",
  },
  { title: "Family", count: "24 thoughts", tone: "blue", size: "medium", x: "10%", y: "15%" },
  { title: "Health", count: "16 thoughts", tone: "green", size: "small", x: "8%", y: "62%" },
  { title: "Lumi Podcast", count: "22 thoughts", tone: "green", size: "medium", x: "61%", y: "11%" },
  { title: "Book Idea", count: "18 thoughts", tone: "orange", size: "medium", x: "66%", y: "58%" },
  { title: "Past Reflections", count: "Archived", tone: "silver", size: "small", x: "70%", y: "79%" },
];

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
  return (
    <div className="home-screen">
      <header className="hero">
        <div>
          <p className="eyebrow">Open Loops</p>
          <h1>Good morning, Tony</h1>
          <p className="hero-copy">I&apos;m Lumi. What shall we explore today?</p>
        </div>
        <div className="lumi-orb" aria-label="Lumi presence">
          <span className="lumi-face">
            <span />
            <span />
          </span>
        </div>
      </header>

      <section className="entry-paths" aria-label="Primary entry paths">
        <button className="entry-path thought-path" type="button">
          <span className="entry-path-icon" aria-hidden="true">
            +
          </span>
          <span className="entry-path-copy">
            <strong>Enter a Thought</strong>
            <span>Capture an open loop, memory, question, feeling, or idea.</span>
          </span>
        </button>

        <button className="entry-path lumi-path" type="button">
          <span className="entry-path-icon" aria-hidden="true">
            ..
          </span>
          <span className="entry-path-copy">
            <strong>Chat with Lumi</strong>
            <span>Start a deeper conversation and let Lumi respond.</span>
          </span>
        </button>
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
        <BubbleWorkspace />
      </section>

      <InsightCard />

      <section className="preview-grid" aria-label="Home previews">
        <article className="small-card">
          <div className="card-meta">
            <p>Recent Thought</p>
            <span>2 hours ago</span>
          </div>
          <p className="quote">I had another idea about simplifying my life even more...</p>
          <button className="text-action" type="button">
            Add to an Open Loop
          </button>
        </article>

        <article className="small-card spotlight-card">
          <div className="card-meta">
            <p>Open Loop Spotlight</p>
            <span className="status-pill">Growing</span>
          </div>
          <h3>Financial Freedom</h3>
          <p>5 new thoughts this week</p>
          <button className="text-action green" type="button">
            Continue exploring
          </button>
        </article>
      </section>
    </div>
  );
}

function BubbleWorkspace() {
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
          className={`loop-bubble ${loop.tone} ${loop.size}`}
          key={loop.title}
          style={{ left: loop.x, top: loop.y }}
        >
          <strong>{loop.title}</strong>
          <span>{loop.count}</span>
        </div>
      ))}
    </div>
  );
}

function InsightCard() {
  return (
    <article className="insight-card">
      <div className="spark" aria-hidden="true" />
      <div>
        <p>These two loops have been getting closer.</p>
        <h3>Financial Freedom and Health</h3>
        <button className="text-action" type="button">
          View connection
        </button>
      </div>
    </article>
  );
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
