import { useState, type FormEvent } from "react";
import { BubbleWorkspace } from "../components/BubbleWorkspace";
import type { OpenLoop, Thought } from "../domain/models";

type LoopViewMode = "bubble" | "list";

type LoopsScreenProps = {
  loops: OpenLoop[];
  thoughts: Thought[];
  selectedLoopId: string;
  onCreateLoop: (input: NewLoopInput) => void;
  onLinkThoughtToLoop: (thoughtId: string, loopId: string) => void;
  onSelectLoop: (loopId: string) => void;
};

export type NewLoopInput = {
  title: string;
  description: string;
  theme: string;
};

export function LoopsScreen({
  loops,
  thoughts,
  selectedLoopId,
  onCreateLoop,
  onLinkThoughtToLoop,
  onSelectLoop,
}: LoopsScreenProps) {
  const [viewMode, setViewMode] = useState<LoopViewMode>("bubble");
  const selectedLoop = loops.find((loop) => loop.id === selectedLoopId) ?? loops[0];

  return (
    <div className="loops-screen">
      <header className="surface-header">
        <p className="eyebrow">Loops</p>
        <h1>Open Loops</h1>
        <p className="hero-copy">
          A simple place to see the questions, themes, and patterns you keep returning to.
        </p>
      </header>

      <NewLoopForm onCreateLoop={onCreateLoop} />

      <section className="loops-view-card" aria-label="Open Loops workspace">
        <div className="loops-toolbar">
          <div>
            <p className="section-label">Workspace</p>
            <h2>{viewMode === "bubble" ? "Bubble view" : "List view"}</h2>
          </div>
          <div className="segmented-control" aria-label="Loop view mode">
            <button
              className={viewMode === "bubble" ? "active" : ""}
              onClick={() => setViewMode("bubble")}
              type="button"
            >
              Bubbles
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              type="button"
            >
              List
            </button>
          </div>
        </div>

        {viewMode === "bubble" ? (
          <BubbleWorkspace
            loops={loops}
            onSelectLoop={onSelectLoop}
            selectedLoopId={selectedLoop?.id}
          />
        ) : (
          <LoopList loops={loops} onSelectLoop={onSelectLoop} selectedLoopId={selectedLoop?.id} />
        )}
      </section>

      {selectedLoop ? (
        <LoopDetail
          loop={selectedLoop}
          onLinkThoughtToLoop={onLinkThoughtToLoop}
          thoughts={thoughts}
        />
      ) : null}
    </div>
  );
}

type NewLoopFormProps = {
  onCreateLoop: (input: NewLoopInput) => void;
};

function NewLoopForm({ onCreateLoop }: NewLoopFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    onCreateLoop({
      title: title.trim(),
      description: description.trim(),
      theme: theme.trim(),
    });

    setTitle("");
    setDescription("");
    setTheme("");
  }

  return (
    <form className="new-loop-form" onSubmit={handleSubmit}>
      <div>
        <p className="section-label">Create</p>
        <h2>New Open Loop</h2>
      </div>
      <label>
        <span>Title</span>
        <input
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What keeps tugging at you?"
          type="text"
          value={title}
        />
      </label>
      <label>
        <span>Description</span>
        <textarea
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional note or question"
          rows={2}
          value={description}
        />
      </label>
      <label>
        <span>Theme</span>
        <input
          onChange={(event) => setTheme(event.target.value)}
          placeholder="Optional theme"
          type="text"
          value={theme}
        />
      </label>
      <button className="primary-button" type="submit">
        Create Loop
      </button>
    </form>
  );
}

type LoopListProps = {
  loops: OpenLoop[];
  selectedLoopId?: string;
  onSelectLoop: (loopId: string) => void;
};

function LoopList({ loops, selectedLoopId, onSelectLoop }: LoopListProps) {
  return (
    <div className="loop-list">
      {loops.map((loop) => (
        <button
          className={selectedLoopId === loop.id ? "loop-row selected" : "loop-row"}
          key={loop.id}
          onClick={() => onSelectLoop(loop.id)}
          type="button"
        >
          <span className={`loop-row-dot ${loop.bubble.tone}`} aria-hidden="true" />
          <span>
            <strong>{loop.title}</strong>
            <small>{loop.description}</small>
          </span>
          <em>{loop.thoughtCount}</em>
        </button>
      ))}
    </div>
  );
}

type LoopDetailProps = {
  loop: OpenLoop;
  thoughts: Thought[];
  onLinkThoughtToLoop: (thoughtId: string, loopId: string) => void;
};

function LoopDetail({ loop, thoughts, onLinkThoughtToLoop }: LoopDetailProps) {
  const relatedThoughts = thoughts.filter((thought) => thought.relatedLoopIds.includes(loop.id));
  const unlinkedThoughts = thoughts.filter((thought) => !thought.relatedLoopIds.includes(loop.id));

  return (
    <section className="loop-detail" aria-label={`${loop.title} details`}>
      <div className="card-meta">
        <p>Loop Detail</p>
        <span className="status-pill">{formatStatus(loop.status)}</span>
      </div>
      <h2>{loop.title}</h2>
      <p>{loop.description}</p>

      <dl className="loop-stats">
        <div>
          <dt>Thoughts</dt>
          <dd>{loop.thoughtCount}</dd>
        </div>
        <div>
          <dt>Themes</dt>
          <dd>{loop.themes.length ? loop.themes.join(", ") : "Unlabeled"}</dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{loop.tags.length ? loop.tags.join(", ") : "None yet"}</dd>
        </div>
      </dl>

      <div className="thought-linker">
        <h3>Related thoughts</h3>
        {relatedThoughts.length ? (
          <ul className="thought-list">
            {relatedThoughts.map((thought) => (
              <li key={thought.id}>
                <strong>{thought.title}</strong>
                <span>{thought.body}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-note">No thoughts linked yet.</p>
        )}

        <h3>Add a recent thought</h3>
        {unlinkedThoughts.length ? (
          <div className="thought-actions">
            {unlinkedThoughts.map((thought) => (
              <button
                className="thought-chip"
                key={thought.id}
                onClick={() => onLinkThoughtToLoop(thought.id, loop.id)}
                type="button"
              >
                {thought.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-note">All current thoughts are already connected to this loop.</p>
        )}
      </div>
    </section>
  );
}

function formatStatus(status: OpenLoop["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
