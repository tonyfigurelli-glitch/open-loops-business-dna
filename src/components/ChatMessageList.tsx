import type { ChatMessage } from "../domain/models";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (!messages.length) {
    return (
      <div className="chat-empty-state">
        <p>No messages in this chat yet.</p>
        <p>Start with whatever feels open, unfinished, or worth exploring.</p>
      </div>
    );
  }

  return (
    <div className="chat-message-list" aria-label="Chat messages">
      {messages.map((message) => (
        <article className={`chat-message ${message.role}`} key={message.id}>
          <div className="chat-message-meta">
            <strong>{message.role === "lumi" ? "Lumi" : "You"}</strong>
            <span>{formatMessageTime(message.createdAt)}</span>
          </div>
          <p>{message.content}</p>
        </article>
      ))}
    </div>
  );
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
