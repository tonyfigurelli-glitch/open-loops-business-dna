import { useState } from "react";

type Surface = "Home" | "Loops" | "Lumi" | "Universe" | "Me";
type Mode = "Enter Thought" | "Chat with Lumi";

const surfaces: Surface[] = ["Home", "Loops", "Lumi", "Universe", "Me"];
const modes: Mode[] = ["Enter Thought", "Chat with Lumi"];

const surfaceCopy: Record<Surface, string> = {
  Home: "A calm starting point for capturing and connecting thoughts.",
  Loops: "A future workspace for Open Loop bubbles and list view.",
  Lumi: "A future focused conversation space with Lumi.",
  Universe: "A future zoomed-out view of patterns and life themes.",
  Me: "A future home for profile, preferences, and settings.",
};

function App() {
  const [activeSurface, setActiveSurface] = useState<Surface>("Home");
  const [activeMode, setActiveMode] = useState<Mode>("Enter Thought");

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Open Loops app shell">
        <header className="hero">
          <div>
            <p className="eyebrow">Open Loops</p>
            <h1>Good morning, Tony</h1>
            <p className="hero-copy">I&apos;m Lumi. What shall we explore today?</p>
          </div>
          <div className="lumi-orb" aria-label="Lumi placeholder">
            <span>.</span>
          </div>
        </header>

        <section className="mode-card" aria-label="Primary modes">
          <div className="mode-switch" role="tablist" aria-label="Choose mode">
            {modes.map((mode) => (
              <button
                aria-selected={activeMode === mode}
                className={activeMode === mode ? "mode-button active" : "mode-button"}
                key={mode}
                onClick={() => setActiveMode(mode)}
                role="tab"
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="mode-placeholder">
            <p>{activeMode}</p>
            <span>
              {activeMode === "Enter Thought"
                ? "A simple capture space will live here."
                : "A focused Lumi chat surface will live here."}
            </span>
          </div>
        </section>

        <section className="surface-panel" aria-live="polite">
          <p className="section-label">{activeSurface}</p>
          <h2>{activeSurface === "Home" ? "Your Open Loops" : `${activeSurface} Surface`}</h2>
          <p>{surfaceCopy[activeSurface]}</p>
          <div className="bubble-preview" aria-hidden="true">
            <span className="bubble bubble-large">Financial Freedom</span>
            <span className="bubble bubble-medium">Family</span>
            <span className="bubble bubble-small">Health</span>
          </div>
        </section>

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
      </section>
    </main>
  );
}

export default App;
