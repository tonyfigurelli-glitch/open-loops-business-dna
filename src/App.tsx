import { useState } from "react";
import {
  entryPathSeed,
  insightsSeed,
  loopConnectionsSeed,
  openLoopsSeed,
  thoughtsSeed,
  userSeed,
} from "./data/seed";
import type { BubbleSize, BubbleTone, OpenLoop, Thought } from "./domain/models";
import { HomeScreen } from "./screens/Home";
import { LoopsScreen, type NewLoopInput } from "./screens/Loops";

type Surface = "Home" | "Loops" | "Lumi" | "Universe" | "Me";

const surfaces: Surface[] = ["Home", "Loops", "Lumi", "Universe", "Me"];

const surfaceCopy: Record<Surface, string> = {
  Home: "Your calm starting point for capturing and connecting thoughts.",
  Loops: "A workspace for Open Loop bubbles and list view.",
  Lumi: "A future focused conversation space with Lumi.",
  Universe: "A future zoomed-out view of patterns and life themes.",
  Me: "A future home for profile, preferences, and settings.",
};

const bubbleTones: BubbleTone[] = ["violet", "blue", "green", "orange"];
const bubbleSizes: BubbleSize[] = ["medium", "small", "medium", "small"];
const bubblePositions = [
  { x: "30%", y: "70%" },
  { x: "82%", y: "35%" },
  { x: "22%", y: "40%" },
  { x: "74%", y: "74%" },
];

function App() {
  const [activeSurface, setActiveSurface] = useState<Surface>("Home");
  const [loops, setLoops] = useState<OpenLoop[]>(() => openLoopsSeed);
  const [thoughts, setThoughts] = useState<Thought[]>(() => thoughtsSeed);
  const [selectedLoopId, setSelectedLoopId] = useState(openLoopsSeed[0]?.id ?? "");

  const recentThought = thoughts[0] ?? thoughtsSeed[0];
  const spotlightLoop = loops.find((loop) => loop.status !== "archived") ?? loops[0];

  function handleCreateLoop(input: NewLoopInput) {
    const now = new Date().toISOString();
    const loopIndex = loops.length;
    const position = bubblePositions[loopIndex % bubblePositions.length];
    const theme = input.theme || "new";
    const titleSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newLoop: OpenLoop = {
      id: `loop-${titleSlug || "new"}-${Date.now()}`,
      title: input.title,
      description: input.description || "A new Open Loop to keep exploring.",
      status: "new",
      createdAt: now,
      updatedAt: now,
      thoughtCount: 0,
      relatedThoughtIds: [],
      relatedLoopIds: [],
      relatedChatSessionIds: [],
      tags: input.theme ? [input.theme] : [],
      themes: [theme],
      bubble: {
        tone: bubbleTones[loopIndex % bubbleTones.length],
        size: bubbleSizes[loopIndex % bubbleSizes.length],
        x: position.x,
        y: position.y,
      },
    };

    setLoops((currentLoops) => [newLoop, ...currentLoops]);
    setSelectedLoopId(newLoop.id);
    setActiveSurface("Loops");
  }

  function handleLinkThoughtToLoop(thoughtId: string, loopId: string) {
    setThoughts((currentThoughts) =>
      currentThoughts.map((thought) => {
        if (thought.id !== thoughtId || thought.relatedLoopIds.includes(loopId)) {
          return thought;
        }

        return {
          ...thought,
          updatedAt: new Date().toISOString(),
          relatedLoopIds: [...thought.relatedLoopIds, loopId],
        };
      }),
    );

    setLoops((currentLoops) =>
      currentLoops.map((loop) => {
        if (loop.id !== loopId || loop.relatedThoughtIds.includes(thoughtId)) {
          return loop;
        }

        return {
          ...loop,
          updatedAt: new Date().toISOString(),
          thoughtCount: loop.thoughtCount + 1,
          relatedThoughtIds: [...loop.relatedThoughtIds, thoughtId],
        };
      }),
    );
    setSelectedLoopId(loopId);
  }

  function showLoopsSurface(loopId?: string) {
    if (loopId) {
      setSelectedLoopId(loopId);
    }
    setActiveSurface("Loops");
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Open Loops app shell">
        {activeSurface === "Home" ? (
          <HomeScreen
            connectionPreview={loopConnectionsSeed[0]}
            entryPaths={entryPathSeed}
            insight={insightsSeed[0]}
            loops={loops}
            onAddThoughtToLoop={() => showLoopsSurface(spotlightLoop?.id)}
            onNewLoop={() => showLoopsSurface()}
            recentThought={recentThought}
            spotlightLoop={spotlightLoop}
            user={userSeed}
          />
        ) : null}

        {activeSurface === "Loops" ? (
          <LoopsScreen
            loops={loops}
            onCreateLoop={handleCreateLoop}
            onLinkThoughtToLoop={handleLinkThoughtToLoop}
            onSelectLoop={setSelectedLoopId}
            selectedLoopId={selectedLoopId}
            thoughts={thoughts}
          />
        ) : null}

        {activeSurface !== "Home" && activeSurface !== "Loops" ? (
          <SurfacePlaceholder surface={activeSurface} />
        ) : null}

        <BottomNavigation activeSurface={activeSurface} setActiveSurface={setActiveSurface} />
      </section>
    </main>
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
