import { useState, type FormEvent } from "react";

type ChatComposerProps = {
  onSendMessage: (content: string) => void;
};

export function ChatComposer({ onSendMessage }: ChatComposerProps) {
  const [content, setContent] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    onSendMessage(content.trim());
    setContent("");
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label>
        <span>Message Lumi</span>
        <textarea
          onChange={(event) => setContent(event.target.value)}
          placeholder="Ask, wonder, or keep going from the last message."
          rows={3}
          value={content}
        />
      </label>
      <button className="primary-button" type="submit">
        Send
      </button>
    </form>
  );
}
