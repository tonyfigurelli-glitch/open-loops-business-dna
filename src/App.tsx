import { useState } from "react";
import {
  chatMessagesSeed,
  chatSessionsSeed,
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
import { MeScreen } from "./screens/Me";
import { ThoughtCapture } from "./screens/ThoughtCapture";
import {
  clearPrototypeState,
  loadPrototypeState,
  savePrototypeState,
  type PrototypeAppState,
} from "./storage/prototypeStorage";

type Surface = "Home" | "Loops" | "Lumi" | "Universe" | "Me";
type ActiveSurface = Surface | "ThoughtCapture";

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

const seedPrototypeState: PrototypeAppState = {
  thoughts: thoughtsSeed,
  openLoops: openLoopsSeed,
  loopConnections: loopConnectionsSeed,
  insights: insightsSeed,
  chatSessions: chatSessionsSeed,
  chatMessages: chatMessagesSeed,
};

function App() {
  const [activeSurface, setActiveSurface] = useState<ActiveSurface>("Home");
  const [prototypeState, setPrototypeState] = useState<PrototypeAppState>(() =>
    loadPrototypeState(seedPrototypeState),
  );
  const [selectedLoopId, setSelectedLoopId] = useState(openLoopsSeed[0]?.id ?? "");

  const {
    chatMessages,
    chatSessions,
    insights,
    loopConnections,
    openLoops: loops,
    thoughts,
  } = prototypeState;
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

    updatePrototypeState((currentState) => ({
      ...currentState,
      openLoops: [newLoop, ...currentState.openLoops],
    }));
    setSelectedLoopId(newLoop.id);
    setActiveSurface("Loops");
  }

  function handleLinkThoughtToLoop(thoughtId: string, loopId: string) {
    updatePrototypeState((currentState) => ({
      ...currentState,
      thoughts: currentState.thoughts.map((thought) => {
        if (thought.id !== thoughtId || thought.relatedLoopIds.includes(loopId)) {
          return thought;
        }

        return {
          ...thought,
          updatedAt: new Date().toISOString(),
          relatedLoopIds: [...thought.relatedLoopIds, loopId],
        };
      }),
      openLoops: currentState.openLoops.map((loop) => {
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
    }));
    setSelectedLoopId(loopId);
  }

  function handleSaveThought(body: string) {
    const now = new Date().toISOString();
    const title = createThoughtTitle(body);
    const newThought: Thought = {
      id: `thought-${Date.now()}`,
      title,
      body,
      createdAt: now,
      updatedAt: now,
      sourceType: "thought",
      relatedThoughtIds: [],
      relatedLoopIds: [],
      relatedChatSessionIds: [],
      tags: [],
      themes: [],
    };

    updatePrototypeState((currentState) => ({
      ...currentState,
      thoughts: [newThought, ...currentState.thoughts],
    }));

    return newThought;
  }

  function handleEntryPathSelect(entryPathId: string) {
    if (entryPathId === "enter-thought") {
      setActiveSurface("ThoughtCapture");
      return;
    }

    if (entryPathId === "chat-with-lumi") {
      setActiveSurface("Lumi");
    }
  }

  function handleResetPrototypeData() {
    clearPrototypeState();
    setPrototypeState(seedPrototypeState);
    savePrototypeState(seedPrototypeState);
    setSelectedLoopId(openLoopsSeed[0]?.id ?? "");
    setActiveSurface("Home");
  }

  function updatePrototypeState(updater: (currentState: PrototypeAppState) => PrototypeAppState) {
    setPrototypeState((currentState) => {
      const nextState = updater(currentState);
      savePrototypeState(nextState);
      return nextState;
    });
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
            connectionPreview={loopConnections[0] ?? loopConnectionsSeed[0]}
            entryPaths={entryPathSeed}
            insight={insights[0] ?? insightsSeed[0]}
            loops={loops}
            onAddThoughtToLoop={() => showLoopsSurface(spotlightLoop?.id)}
            onEntryPathSelect={handleEntryPathSelect}
            onNewLoop={() => showLoopsSurface()}
            recentThought={recentThought}
            spotlightLoop={spotlightLoop}
            user={userSeed}
          />
        ) : null}

        {activeSurface === "ThoughtCapture" ? (
          <ThoughtCapture onCancel={() => setActiveSurface("Home")} onSaveThought={handleSaveThought} />
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

        {activeSurface === "Me" ? <MeScreen onResetPrototypeData={handleResetPrototypeData} /> : null}

        {activeSurface === "Lumi" || activeSurface === "Universe" ? (
          <SurfacePlaceholder
            chatMessageCount={chatMessages.length}
            chatSessionCount={chatSessions.length}
            surface={activeSurface}
          />
        ) : null}

        <BottomNavigation activeSurface={activeSurface} setActiveSurface={setActiveSurface} />
      </section>
    </main>
  );
}

type SurfacePlaceholderProps = {
  chatMessageCount: number;
  chatSessionCount: number;
  surface: "Lumi" | "Universe";
};

function SurfacePlaceholder({ chatMessageCount, chatSessionCount, surface }: SurfacePlaceholderProps) {
  return (
    <section className="surface-placeholder" aria-live="polite">
      <p className="eyebrow">{surface}</p>
      <h1>{surface} Surface</h1>
      <p>{surfaceCopy[surface]}</p>
      {surface === "Lumi" ? (
        <p className="placeholder-note">
          Chat with Lumi remains a separate future conversational mode. Prototype state currently
          carries {chatSessionCount} chat sessions and {chatMessageCount} ordered messages, but this
          milestone does not turn Lumi into thought capture.
        </p>
      ) : null}
    </section>
  );
}

type BottomNavigationProps = {
  activeSurface: ActiveSurface;
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

function createThoughtTitle(body: string) {
  const words = body.split(/\s+/).slice(0, 6).join(" ");

  if (words.length <= 44) {
    return words;
  }

  return `${words.slice(0, 41)}...`;
}

export default App;
