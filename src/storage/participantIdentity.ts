export const participantIdentityStorageKey = "open-loops.participant-identity.v1";

export function getOrCreateParticipantIdentity() {
  if (!canUseLocalStorage()) return "server-rendered";
  const existing = window.localStorage.getItem(participantIdentityStorageKey);
  if (existing && /^[a-z0-9-]{8,80}$/i.test(existing)) return existing;
  const identity = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(participantIdentityStorageKey, identity);
  return identity;
}

export function participantScopedStorageKey(baseKey: string, participantIdentity: string) {
  return `${baseKey}.${participantIdentity}`;
}

export function clearParticipantIdentity() {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(participantIdentityStorageKey);
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}
