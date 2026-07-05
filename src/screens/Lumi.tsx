import { ChatComposer } from "../components/ChatComposer";
import { ChatMessageList } from "../components/ChatMessageList";
import type { ChatMessage, ChatSession } from "../domain/models";

type LumiScreenProps = {
  activeChatSessionId: string;
  chatMessages: ChatMessage[];
  chatSessions: ChatSession[];
  onNewChatSession: () => void;
  onSelectChatSession: (chatSessionId: string) => void;
  onSendChatMessage: (content: string) => void;
};

export function LumiScreen({
  activeChatSessionId,
  chatMessages,
  chatSessions,
  onNewChatSession,
  onSelectChatSession,
  onSendChatMessage,
}: LumiScreenProps) {
  const activeSession =
    chatSessions.find((session) => session.id === activeChatSessionId) ?? chatSessions[0];
  const orderedMessages = chatMessages
    .filter((message) => message.chatSessionId === activeSession?.id)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt));

  return (
    <div className="lumi-chat-screen">
      <header className="surface-header lumi-chat-header">
        <div>
          <p className="eyebrow">Chat with Lumi</p>
          <h1>{activeSession?.title ?? "New Lumi chat"}</h1>
          <p className="hero-copy">
            A local conversational space. Messages stay in this chat session and are not saved as
            thoughts.
          </p>
        </div>
        <button className="ghost-button" onClick={onNewChatSession} type="button">
          New Chat
        </button>
      </header>

      <section className="chat-session-switcher" aria-label="Recent chat sessions">
        {chatSessions.map((session) => (
          <button
            className={session.id === activeSession?.id ? "chat-session-pill active" : "chat-session-pill"}
            key={session.id}
            onClick={() => onSelectChatSession(session.id)}
            type="button"
          >
            {session.title}
          </button>
        ))}
      </section>

      <section className="chat-panel" aria-label="Active Lumi chat">
        <ChatMessageList messages={orderedMessages} />
        <ChatComposer onSendMessage={onSendChatMessage} />
      </section>
    </div>
  );
}
