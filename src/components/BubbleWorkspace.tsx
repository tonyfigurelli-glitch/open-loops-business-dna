import type { OpenLoop } from "../domain/models";

const homeBubblePositions: Record<string, { x: string; y: string }> = {
  "loop-financial-freedom": { x: "45%", y: "36%" },
  "loop-family": { x: "23%", y: "22%" },
  "loop-health": { x: "24%", y: "72%" },
  "loop-lumi-podcast": { x: "75%", y: "24%" },
  "loop-book-idea": { x: "72%", y: "58%" },
  "loop-past-reflections": { x: "77%", y: "83%" },
};

type BubbleWorkspaceProps = {
  loops: OpenLoop[];
  selectedLoopId?: string;
  onSelectLoop?: (loopId: string) => void;
};

export function BubbleWorkspace({ loops, selectedLoopId, onSelectLoop }: BubbleWorkspaceProps) {
  return (
    <div className="bubble-workspace" aria-label="Open Loops bubble workspace preview">
      <svg className="connection-lines" aria-hidden="true" viewBox="0 0 360 270">
        <path d="M73 88 C125 132, 148 133, 201 119" />
        <path d="M214 122 C258 105, 279 84, 309 68" />
        <path d="M210 146 C162 175, 118 199, 74 213" />
        <path d="M231 166 C267 187, 287 205, 320 224" />
      </svg>
      {loops.map((loop) => {
        const bubblePosition = homeBubblePositions[loop.id] ?? loop.bubble;
        const bubbleClassName = [
          "loop-bubble",
          loop.bubble.tone,
          loop.bubble.size,
          selectedLoopId === loop.id ? "selected" : "",
          onSelectLoop ? "interactive" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (!onSelectLoop) {
          return (
            <div
              className={bubbleClassName}
              key={loop.id}
              style={{ left: bubblePosition.x, top: bubblePosition.y }}
            >
              <strong>{loop.title}</strong>
              <span>{loop.thoughtCount}</span>
            </div>
          );
        }

        return (
          <button
            className={bubbleClassName}
            key={loop.id}
            onClick={() => onSelectLoop(loop.id)}
            style={{ left: bubblePosition.x, top: bubblePosition.y }}
            type="button"
          >
            <strong>{loop.title}</strong>
            <span>{loop.thoughtCount}</span>
          </button>
        );
      })}
    </div>
  );
}
