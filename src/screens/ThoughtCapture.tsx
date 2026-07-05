import { useState, type FormEvent } from "react";
import type { Thought } from "../domain/models";

type ThoughtCaptureProps = {
  onCancel: () => void;
  onSaveThought: (body: string) => Thought;
};

export function ThoughtCapture({ onCancel, onSaveThought }: ThoughtCaptureProps) {
  const [body, setBody] = useState("");
  const [savedThought, setSavedThought] = useState<Thought | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!body.trim()) {
      return;
    }

    const thought = onSaveThought(body.trim());
    setSavedThought(thought);
    setBody("");
  }

  return (
    <div className="thought-capture-screen">
      <header className="surface-header">
        <p className="eyebrow">Enter a Thought</p>
        <h1>Capture what is open.</h1>
        <p className="hero-copy">
          Save a dated thought, memory, question, feeling, or idea. Lumi does not need to respond
          here.
        </p>
      </header>

      <form className="thought-capture-form" onSubmit={handleSubmit}>
        <label>
          <span>Thought</span>
          <textarea
            autoFocus
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write the thought as it is, even if it is unfinished."
            rows={7}
            value={body}
          />
        </label>
        <div className="form-actions">
          <button className="ghost-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Save Thought
          </button>
        </div>
      </form>

      {savedThought ? (
        <article className="save-confirmation" aria-live="polite">
          <p className="section-label">Saved</p>
          <h2>{savedThought.title}</h2>
          <p>{formatCaptureDate(savedThought.createdAt)}</p>
        </article>
      ) : null}
    </div>
  );
}

function formatCaptureDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
