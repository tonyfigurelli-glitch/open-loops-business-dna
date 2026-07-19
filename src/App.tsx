import { useEffect, useRef, useState } from "react";
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
import { createLumiMockResponse } from "./domain/lumiMockResponse";
import { generateInitialBusinessModel } from "./domain/calibrations/generateInitialBusinessModel";
import { smallBusinessOwnerCalibrationIdentity } from "./domain/calibrations/smallBusinessOwnerCalibration";
import { smallBusinessOwnerCalibration } from "./domain/calibrations/smallBusinessOwnerCalibration";
import {
  createCalibrationSession,
  saveCalibrationAnswer,
  saveNumericalFeedback,
  saveOpenEndedFeedback,
  preserveAndPrependCalibrationSession,
  selectCalibrationToOpen,
} from "./domain/calibrations/calibrationSession";
import {
  buildCalibrationEvidencePackage,
  hashCalibrationEvidencePackage,
} from "./domain/calibrations/calibrationEvidencePackage";
import { AI_GENERATION_INSTRUCTION_VERSION } from "./domain/calibrations/aiModelGenerationPipeline";
import type {
  BubbleSize,
  BubbleTone,
  CalibrationResponse,
  CalibrationSession,
  ChatMessage,
  ChatSession,
  OpenLoop,
  Thought,
} from "./domain/models";
import { HomeScreen } from "./screens/Home";
import { BusinessCalibration } from "./screens/BusinessCalibration";
import { LumiScreen } from "./screens/Lumi";
import { LoopsScreen, type NewLoopInput } from "./screens/Loops";
import { MeScreen } from "./screens/Me";
import { ThoughtCapture } from "./screens/ThoughtCapture";
import { ThoughtLibrary } from "./screens/ThoughtLibrary";
import {
  clearPrototypeState,
  loadPrototypeState,
  savePrototypeState,
  type PrototypeAppState,
} from "./storage/prototypeStorage";
import {
  establishCalibrationSession,
  calibrationSessionWriteFingerprint,
  migrateAndLoadCalibrationSessions,
  requestGenerationWithNetworkFallback,
  retryCalibrationGeneration,
  syncCalibrationSession,
} from "./storage/calibrationApi";

type Surface = "Home" | "Loops" | "Lumi" | "Universe" | "Me";
type ActiveSurface = Surface | "ThoughtCapture" | "ThoughtLibrary" | "Calibration";

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
  calibrationSessions: [],
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
  const [activeChatSessionId, setActiveChatSessionId] = useState(() =>
    getNewestChatSessionId(loadPrototypeState(seedPrototypeState).chatSessions),
  );
  const [activeCalibrationSessionId, setActiveCalibrationSessionId] = useState(() =>
    selectCalibrationToOpen(loadPrototypeState(seedPrototypeState).calibrationSessions)?.id ?? "",
  );
  const durableStorageReady = useRef(false);
  const previousCalibrationWriteFingerprints = useRef(new Map<string, string>());

  const {
    calibrationSessions,
    chatMessages,
    chatSessions,
    insights,
    loopConnections,
    openLoops: loops,
    thoughts,
  } = prototypeState;
  const recentThought = thoughts[0] ?? thoughtsSeed[0];
  const spotlightLoop = loops.find((loop) => loop.status !== "archived") ?? loops[0];

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (!await establishCalibrationSession("local-prototype-user")) return;
        const sessions = await migrateAndLoadCalibrationSessions(calibrationSessions);
        if (!active || !sessions) return;
        durableStorageReady.current = true;
        previousCalibrationWriteFingerprints.current = new Map(sessions.map((session) => [
          session.id,
          calibrationSessionWriteFingerprint(session),
        ]));
        updatePrototypeState((current) => ({ ...current, calibrationSessions: sessions }));
      } catch {
        // localStorage remains a recoverable cache while the API is unavailable.
      }
    })();
    return () => { active = false; };
    // This migration runs once for the local prototype identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!durableStorageReady.current) return;
    const prior = previousCalibrationWriteFingerprints.current;
    const next = new Map(calibrationSessions.map((session) => [
      session.id,
      calibrationSessionWriteFingerprint(session),
    ]));
    const changedSessions = calibrationSessions.filter((session) =>
      prior.get(session.id) !== next.get(session.id));
    previousCalibrationWriteFingerprints.current = next;
    if (!changedSessions.length) return;
    void Promise.all(changedSessions.map((session) => syncCalibrationSession(session))).catch(() => {
      // The local cache already contains the update and will be retried after reconnect/reload.
    });
  }, [calibrationSessions]);

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

  function handleUpdateThought(thoughtId: string, body: string) {
    updatePrototypeState((currentState) => ({
      ...currentState,
      thoughts: currentState.thoughts.map((thought) => {
        if (thought.id !== thoughtId) {
          return thought;
        }

        return {
          ...thought,
          title: createThoughtTitle(body),
          body,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
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
      setActiveChatSessionId(getNewestChatSessionId(chatSessions));
      setActiveSurface("Lumi");
      return;
    }

    if (entryPathId === "business-dna-calibration") {
      const existingSession = selectCalibrationToOpen(calibrationSessions);

      if (existingSession) {
        setActiveCalibrationSessionId(existingSession.id);
      } else {
        handleStartNewCalibration();
      }

      setActiveSurface("Calibration");
    }
  }

  function handleStartNewCalibration() {
    const session = createNewCalibrationSession();
    updatePrototypeState((currentState) => ({
      ...currentState,
      calibrationSessions: preserveAndPrependCalibrationSession(
        currentState.calibrationSessions,
        session,
      ),
    }));
    setActiveCalibrationSessionId(session.id);
    setActiveSurface("Calibration");
  }

  async function handleRetryCalibrationGeneration(sessionId: string) {
    const attempt = await retryCalibrationGeneration(sessionId);
    updatePrototypeState((currentState) => ({
      ...currentState,
      calibrationSessions: currentState.calibrationSessions.map((session) =>
        session.id === sessionId
          ? { ...session, generationAttempts: [attempt, ...(session.generationAttempts ?? [])] }
          : session,
      ),
    }));
    return attempt;
  }

  async function handleCalibrationAnswer(response: CalibrationResponse) {
    const orderedQuestionIds = smallBusinessOwnerCalibration.onboarding_questions.map(
      (question) => question.id,
    );
    const activeSession = calibrationSessions.find(
      (session) => session.id === activeCalibrationSessionId,
    );
    const isFinalAnswer =
      activeSession?.currentQuestionIndex === orderedQuestionIds.length - 1;

    if (activeSession && isFinalAnswer) {
      const responses = [...activeSession.participantResponses, response];
      const evidencePackage = buildCalibrationEvidencePackage(smallBusinessOwnerCalibration, responses);
      const generation = await requestGenerationWithNetworkFallback(evidencePackage, async () => ({
        generation: generateInitialBusinessModel(responses),
        provenance: {
          generatorType: "deterministic_fallback",
          provider: "network_unavailable",
          modelIdentifier: "unavailable",
          promptInstructionVersion: AI_GENERATION_INSTRUCTION_VERSION,
          calibrationVersion: smallBusinessOwnerCalibration.version,
          frozenCalibrationHash: smallBusinessOwnerCalibration.canonical_source.sha256,
          generationTimestamp: new Date().toISOString(),
          validationResult: { valid: false, errors: ["Secure generation endpoint unavailable."] },
          retryCount: 0,
          evidencePackageHash: await hashCalibrationEvidencePackage(evidencePackage),
        },
      }));

      updatePrototypeState((currentState) => ({
        ...currentState,
        calibrationSessions: currentState.calibrationSessions.map((session) => {
          if (session.id !== activeCalibrationSessionId) return session;
          const completed = saveCalibrationAnswer(
            session,
            response,
            orderedQuestionIds,
            () => generation.generation,
          );
          return {
            ...completed,
            generationProvenance: generation.provenance,
            originalStructuredGenerationOutput: generation.originalStructuredOutput,
            deterministicFallbackOutput:
              generation.provenance.generatorType === "deterministic_fallback"
                ? generation.generation
                : undefined,
          };
        }),
      }));
      return;
    }

    updatePrototypeState((currentState) => ({
      ...currentState,
      calibrationSessions: currentState.calibrationSessions.map((session) => {
        if (session.id !== activeCalibrationSessionId) return session;

        return saveCalibrationAnswer(
          session,
          response,
          orderedQuestionIds,
          generateInitialBusinessModel,
        );
      }),
    }));
  }

  function handleNumericalCalibrationFeedback(
    feedbackId: string,
    value: 1 | 2 | 3 | 4 | 5,
  ) {
    const orderedFeedbackIds =
      smallBusinessOwnerCalibration.participant_feedback.rating_questions.map(
        (question) => question.id,
      );

    updatePrototypeState((currentState) => ({
      ...currentState,
      calibrationSessions: currentState.calibrationSessions.map((session) =>
        session.id === activeCalibrationSessionId
          ? saveNumericalFeedback(session, feedbackId, value, orderedFeedbackIds)
          : session,
      ),
    }));
  }

  function handleOpenEndedCalibrationFeedback(feedbackId: string, value: string) {
    const orderedFeedbackIds =
      smallBusinessOwnerCalibration.participant_feedback.open_ended_questions.map(
        (question) => question.id,
      );

    updatePrototypeState((currentState) => ({
      ...currentState,
      calibrationSessions: currentState.calibrationSessions.map((session) =>
        session.id === activeCalibrationSessionId
          ? saveOpenEndedFeedback(
              session,
              feedbackId,
              value,
              orderedFeedbackIds,
              new Date().toISOString(),
            )
          : session,
      ),
    }));
  }

  function handleCreateChatSession() {
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: `Lumi chat ${formatSessionTitleDate(now)}`,
      createdAt: now,
      updatedAt: now,
      relatedThoughtIds: [],
      relatedLoopIds: [],
      relatedChatSessionIds: [],
      tags: [],
      themes: [],
    };

    updatePrototypeState((currentState) => ({
      ...currentState,
      chatSessions: [newSession, ...currentState.chatSessions],
    }));
    setActiveChatSessionId(newSession.id);
  }

  function handleSendChatMessage(content: string) {
    const chatSessionId = activeChatSessionId || getNewestChatSessionId(chatSessions);
    const now = new Date().toISOString();

    updatePrototypeState((currentState) => {
      const activeSession =
        currentState.chatSessions.find((session) => session.id === chatSessionId) ??
        createFallbackChatSession(now);
      const priorMessages = currentState.chatMessages
        .filter((message) => message.chatSessionId === activeSession.id)
        .sort((first, second) => first.createdAt.localeCompare(second.createdAt));
      const userMessage: ChatMessage = {
        id: `message-user-${Date.now()}`,
        chatSessionId: activeSession.id,
        role: "user",
        content,
        createdAt: now,
        sourceType: "chat",
        relatedThoughtIds: [],
        relatedLoopIds: [],
        tags: [],
        themes: [],
      };
      const lumiMessage: ChatMessage = {
        id: `message-lumi-${Date.now()}`,
        chatSessionId: activeSession.id,
        role: "lumi",
        content: createLumiMockResponse({
          currentUserMessage: content,
          priorMessages,
        }),
        createdAt: new Date(Date.now() + 1).toISOString(),
        sourceType: "chat",
        relatedThoughtIds: [],
        relatedLoopIds: [],
        tags: [],
        themes: [],
      };
      const sessionExists = currentState.chatSessions.some((session) => session.id === activeSession.id);
      const nextSessions = sessionExists
        ? currentState.chatSessions.map((session) =>
            session.id === activeSession.id
              ? {
                  ...session,
                  title: priorMessages.length ? session.title : createChatTitle(content),
                  updatedAt: lumiMessage.createdAt,
                }
              : session,
          )
        : [
            {
              ...activeSession,
              title: createChatTitle(content),
              updatedAt: lumiMessage.createdAt,
            },
            ...currentState.chatSessions,
          ];

      return {
        ...currentState,
        chatSessions: nextSessions,
        chatMessages: [...currentState.chatMessages, userMessage, lumiMessage],
      };
    });

    setActiveChatSessionId(chatSessionId);
  }

  function handleResetPrototypeData() {
    clearPrototypeState();
    setPrototypeState(seedPrototypeState);
    savePrototypeState(seedPrototypeState);
    setSelectedLoopId(openLoopsSeed[0]?.id ?? "");
    setActiveChatSessionId(getNewestChatSessionId(chatSessionsSeed));
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
            onViewThoughtLibrary={() => setActiveSurface("ThoughtLibrary")}
            recentThought={recentThought}
            spotlightLoop={spotlightLoop}
            user={userSeed}
          />
        ) : null}

        {activeSurface === "ThoughtCapture" ? (
          <ThoughtCapture onCancel={() => setActiveSurface("Home")} onSaveThought={handleSaveThought} />
        ) : null}

        {activeSurface === "ThoughtLibrary" ? (
          <ThoughtLibrary
            loops={loops}
            onBackHome={() => setActiveSurface("Home")}
            onConnectThoughtToLoop={handleLinkThoughtToLoop}
            onUpdateThought={handleUpdateThought}
            thoughts={thoughts}
          />
        ) : null}

        {activeSurface === "Calibration" ? (
          <BusinessCalibration
            key={activeCalibrationSessionId}
            onAnswer={handleCalibrationAnswer}
            onBackHome={() => setActiveSurface("Home")}
            onNumericalFeedback={handleNumericalCalibrationFeedback}
            onOpenEndedFeedback={handleOpenEndedCalibrationFeedback}
            onRetryGeneration={handleRetryCalibrationGeneration}
            onSelectSession={setActiveCalibrationSessionId}
            onStartNewCalibration={handleStartNewCalibration}
            session={
              calibrationSessions.find((session) => session.id === activeCalibrationSessionId) ??
              calibrationSessions[0]
            }
            sessions={calibrationSessions}
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

        {activeSurface === "Lumi" ? (
          <LumiScreen
            activeChatSessionId={activeChatSessionId}
            chatMessages={chatMessages}
            chatSessions={chatSessions}
            onNewChatSession={handleCreateChatSession}
            onSelectChatSession={setActiveChatSessionId}
            onSendChatMessage={handleSendChatMessage}
          />
        ) : null}

        {activeSurface === "Me" ? <MeScreen onResetPrototypeData={handleResetPrototypeData} /> : null}

        {activeSurface === "Universe" ? (
          <SurfacePlaceholder surface={activeSurface} />
        ) : null}

        <BottomNavigation activeSurface={activeSurface} setActiveSurface={setActiveSurface} />
      </section>
    </main>
  );
}

function createNewCalibrationSession(): CalibrationSession {
  const now = new Date().toISOString();
  const uniqueId = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return createCalibrationSession({
    id: `calibration-${uniqueId}`,
    participantId: `participant-${uniqueId}`,
    startedAt: now,
    ...smallBusinessOwnerCalibrationIdentity,
  });
}

type SurfacePlaceholderProps = {
  surface: "Universe";
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

function getNewestChatSessionId(chatSessions: ChatSession[]) {
  return [...chatSessions].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))[0]?.id ?? "";
}

function createFallbackChatSession(createdAt: string): ChatSession {
  return {
    id: `chat-${Date.now()}`,
    title: `Lumi chat ${formatSessionTitleDate(createdAt)}`,
    createdAt,
    updatedAt: createdAt,
    relatedThoughtIds: [],
    relatedLoopIds: [],
    relatedChatSessionIds: [],
    tags: [],
    themes: [],
  };
}

function createChatTitle(content: string) {
  const words = content.split(/\s+/).slice(0, 5).join(" ");

  if (!words) {
    return "Lumi chat";
  }

  if (words.length <= 36) {
    return words;
  }

  return `${words.slice(0, 33)}...`;
}

function formatSessionTitleDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default App;
