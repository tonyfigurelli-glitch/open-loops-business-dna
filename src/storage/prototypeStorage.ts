import type {
  ChatMessage,
  ChatSession,
  Insight,
  LoopConnection,
  OpenLoop,
  Thought,
} from "../domain/models";

export const prototypeStorageKey = "open-loops.prototype-state.v1";

export type PrototypeAppState = {
  thoughts: Thought[];
  openLoops: OpenLoop[];
  loopConnections: LoopConnection[];
  insights: Insight[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
};

export function loadPrototypeState(seedState: PrototypeAppState): PrototypeAppState {
  if (!canUseLocalStorage()) {
    return seedState;
  }

  const storedState = window.localStorage.getItem(prototypeStorageKey);

  if (!storedState) {
    return seedState;
  }

  try {
    return {
      ...seedState,
      ...JSON.parse(storedState),
    };
  } catch {
    return seedState;
  }
}

export function savePrototypeState(state: PrototypeAppState) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(prototypeStorageKey, JSON.stringify(state));
}

export function clearPrototypeState() {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(prototypeStorageKey);
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}
