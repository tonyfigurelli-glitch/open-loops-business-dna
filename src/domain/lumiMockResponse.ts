import type { ChatMessage } from "./models";

type LumiMockResponseInput = {
  currentUserMessage: string;
  priorMessages: ChatMessage[];
};

export function createLumiMockResponse({
  currentUserMessage,
  priorMessages,
}: LumiMockResponseInput) {
  const priorUserMessageCount = priorMessages.filter((message) => message.role === "user").length;
  const trimmedMessage = currentUserMessage.trim();

  if (priorUserMessageCount === 0) {
    return `I'm hearing the beginning of a thread: "${trimForReflection(trimmedMessage)}" What part of it feels most unresolved right now?`;
  }

  return `I'm keeping this in the same conversation. It feels like this follow-up is adding another layer to what you were circling. What changed or became clearer as you said that?`;
}

function trimForReflection(value: string) {
  if (value.length <= 96) {
    return value;
  }

  return `${value.slice(0, 93)}...`;
}
