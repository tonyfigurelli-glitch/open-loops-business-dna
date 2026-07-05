import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { OpenLoop, Thought } from "../domain/models";

type ThoughtLibraryProps = {
  loops: OpenLoop[];
  onBackHome: () => void;
  onConnectThoughtToLoop: (thoughtId: string, loopId: string) => void;
  onUpdateThought: (thoughtId: string, body: string) => void;
  thoughts: Thought[];
};

export function ThoughtLibrary({
  loops,
  onBackHome,
  onConnectThoughtToLoop,
  onUpdateThought,
  thoughts,
}: ThoughtLibraryProps) {
  const [query, setQuery] = useState("");
  const [selectedThoughtId, setSelectedThoughtId] = useState(thoughts[0]?.id ?? "");
  const orderedThoughts = useMemo(
    () => [...thoughts].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    [thoughts],
  );
  const filteredThoughts = orderedThoughts.filter((thought) => matchesThoughtSearch(thought, query));
  const selectedThought =
    filteredThoughts.find((thought) => thought.id === selectedThoughtId) ?? filteredThoughts[0];

  return (
    <div className="thought-library-screen">
      <header className="surface-header thought-library-header">
        <div>
          <p className="eyebrow">Thought Library</p>
          <h1>Thoughts</h1>
          <p className="hero-copy">Find what you captured, then connect it when it starts to matter.</p>
        </div>
        <button className="ghost-button" onClick={onBackHome} type="button">
          Home
        </button>
      </header>

      <section className="thought-search-card" aria-label="Search thoughts">
        <label>
          <span>Search thoughts</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, text, tags, or themes"
            type="search"
            value={query}
          />
        </label>
      </section>

      <section className="thought-library-layout">
        <ThoughtList
          loops={loops}
          onSelectThought={setSelectedThoughtId}
          selectedThoughtId={selectedThought?.id}
          thoughts={filteredThoughts}
        />
        {selectedThought ? (
          <ThoughtDetail
            loops={loops}
            onConnectThoughtToLoop={onConnectThoughtToLoop}
            onUpdateThought={onUpdateThought}
            thought={selectedThought}
          />
        ) : (
          <article className="thought-detail-card">
            <p className="empty-note">No thoughts match this search.</p>
          </article>
        )}
      </section>
    </div>
  );
}

type ThoughtListProps = {
  loops: OpenLoop[];
  onSelectThought: (thoughtId: string) => void;
  selectedThoughtId?: string;
  thoughts: Thought[];
};

function ThoughtList({ loops, onSelectThought, selectedThoughtId, thoughts }: ThoughtListProps) {
  if (!thoughts.length) {
    return (
      <section className="thought-list-card">
        <p className="empty-note">No thoughts found.</p>
      </section>
    );
  }

  return (
    <section className="thought-list-card" aria-label="Captured thoughts">
      {thoughts.map((thought) => (
        <button
          className={thought.id === selectedThoughtId ? "thought-row selected" : "thought-row"}
          key={thought.id}
          onClick={() => onSelectThought(thought.id)}
          type="button"
        >
          <span>
            <strong>{thought.title}</strong>
            <small>{formatThoughtDate(thought.createdAt)}</small>
          </span>
          <span>{previewThought(thought.body)}</span>
          <em>{formatConnectedLoopNames(thought, loops) || "Unlinked"}</em>
        </button>
      ))}
    </section>
  );
}

type ThoughtDetailProps = {
  loops: OpenLoop[];
  onConnectThoughtToLoop: (thoughtId: string, loopId: string) => void;
  onUpdateThought: (thoughtId: string, body: string) => void;
  thought: Thought;
};

function ThoughtDetail({
  loops,
  onConnectThoughtToLoop,
  onUpdateThought,
  thought,
}: ThoughtDetailProps) {
  const [draftBody, setDraftBody] = useState(thought.body);
  const connectedLoops = loops.filter((loop) => thought.relatedLoopIds.includes(loop.id));
  const availableLoops = loops.filter((loop) => !thought.relatedLoopIds.includes(loop.id));

  useEffect(() => {
    setDraftBody(thought.body);
  }, [thought.body]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftBody.trim()) {
      return;
    }

    onUpdateThought(thought.id, draftBody.trim());
  }

  return (
    <article className="thought-detail-card" aria-label="Thought detail">
      <div className="card-meta">
        <p>Thought Detail</p>
        <span>{formatThoughtDate(thought.createdAt)}</span>
      </div>
      <h2>{thought.title}</h2>

      <form className="thought-edit-form" onSubmit={handleSubmit}>
        <label>
          <span>Thought text</span>
          <textarea
            onChange={(event) => setDraftBody(event.target.value)}
            rows={6}
            value={draftBody}
          />
        </label>
        <button className="primary-button" type="submit">
          Save Edit
        </button>
      </form>

      <section className="thought-connections" aria-label="Connected Open Loops">
        <h3>Connected Open Loops</h3>
        {connectedLoops.length ? (
          <div className="connected-loop-list">
            {connectedLoops.map((loop) => (
              <span className="connected-loop-pill" key={loop.id}>
                {loop.title}
              </span>
            ))}
          </div>
        ) : (
          <p className="empty-note">Not connected to an Open Loop yet.</p>
        )}

        <h3>Connect to Open Loop</h3>
        {availableLoops.length ? (
          <div className="thought-actions">
            {availableLoops.map((loop) => (
              <button
                className="thought-chip"
                key={loop.id}
                onClick={() => onConnectThoughtToLoop(thought.id, loop.id)}
                type="button"
              >
                {loop.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-note">This thought is connected to every current loop.</p>
        )}
      </section>
    </article>
  );
}

function matchesThoughtSearch(thought: Thought, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    thought.title,
    thought.body,
    ...thought.tags,
    ...thought.themes,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function formatConnectedLoopNames(thought: Thought, loops: OpenLoop[]) {
  return thought.relatedLoopIds
    .map((loopId) => loops.find((loop) => loop.id === loopId)?.title)
    .filter(Boolean)
    .join(", ");
}

function formatThoughtDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function previewThought(value: string) {
  if (value.length <= 96) {
    return value;
  }

  return `${value.slice(0, 93)}...`;
}
