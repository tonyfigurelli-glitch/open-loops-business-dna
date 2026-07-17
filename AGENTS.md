# Open Loops Constitution

Status: Draft
Last Updated: 2026-07-17
Owner: TBD

## Purpose

Define the project mission, documentation workflow, coding philosophy, development workflow, and instructions future Codex conversations should follow when Open Loops decisions are finalized.

This file is the operating constitution for the project. It should guide both documentation and implementation work.

## Project Mission

Open Loops exists to help people better understand themselves and each other.

The mission is not to make people agree. The mission is to help people understand.

## Core Philosophy

### Understanding Over Certainty

Open Loops should help people see more clearly without forcing premature conclusions.

### Curiosity Over Judgment

Open Loops should meet unfinished thoughts, contradictions, confusion, and emotional complexity with curiosity.

### Build For Humans, Not Technology

Technology should serve human understanding. Open Loops is not positioned as an AI company. AI is the enabling technology. Understanding is the product.

### Version 1 Simplicity

Version 1 should be simple enough to finish, use, explain, and learn from.

### No Feature Without Understanding

Do not add features that do not improve user understanding or advance the approved product direction.

### Organize Thinking, Not Information

Open Loops does not organize information.

Open Loops organizes thinking.

Every product, design, and technical decision should reinforce that distinction.

## Development Workflow

ChatGPT is used for:

- Product vision
- Strategy
- UX philosophy
- Branding
- Business model
- Founder discussions
- Architecture decisions
- Codex-ready decision handoffs

Use [OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md](OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md) as the operating guide for ChatGPT/founder/Codex coordination. It defines how to separate exploration, proposed direction, approved decisions, and Codex-ready implementation instructions.

Codex is used for:

- Maintaining project documentation
- Updating Markdown files
- Implementing architecture
- Building software
- Maintaining the codebase

Every significant decision should be reflected in both the appropriate documentation file and [DECISIONS.md](DECISIONS.md).

## Documentation Workflow

Every project document should include:

- `Status`
- `Last Updated`
- `Owner`
- `Purpose`
- Clear section headings
- Placeholders for unresolved content
- Links to related documents
- References to [DECISIONS.md](DECISIONS.md) where approved decisions are recorded
- Final `Open Questions` and `Version 1 Boundaries` sections

Use each document for its intended purpose:

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md): mission, vision, beliefs, and long-term direction
- [PRODUCT_VISION.md](PRODUCT_VISION.md): concise product-vision entry point
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md): product definition, users, scope, workflows, and success criteria
- [UX.md](UX.md): user experience principles and canonical UI references
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md): Emotional DNA, emotional model behavior, tone, trust, and experiential principles
- [USER_JOURNEY.md](USER_JOURNEY.md): user stages, motivations, friction, and moments that matter
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md): Version 1 sequencing, milestones, risks, and acceptance criteria
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md): technical architecture, constraints, risks, and implementation decisions
- [ARCHITECTURE.md](ARCHITECTURE.md): implementation-facing architecture entry point
- [DATA_MODEL.md](DATA_MODEL.md): conceptual data model
- [MVP_TASKS.md](MVP_TASKS.md): Version 1 MVP task structure
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md): business narrative, market framing, traction, and fundraising story
- [OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md](OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md): ChatGPT/founder/Codex coordination guide
- [Business DNA/README.md](Business%20DNA/README.md): canonical entry point for the Business DNA sub-project
- [DECISIONS.md](DECISIONS.md): permanent chronological history of approved decisions

## Sub-Projects

- [Business DNA](Business%20DNA/README.md) is the approved business-oriented application of Open Loops. It remains subordinate to the parent system and follows the local [Business DNA Instructions](Business%20DNA/AGENTS.md).
- Work inside a sub-project follows this constitution and any more specific local `AGENTS.md` instructions.
- Creating a sub-project does not change the approved Open Loops Version 1 scope unless that change is explicitly approved and recorded.

## Decision Logging Workflow

Exploration can happen freely in conversation. A decision becomes part of the permanent project record when the user explicitly asks for documentation updates, provides an approved decision log, or marks the decision as approved.

When a design, product, technical, documentation, or business decision is finalized:

- Update the appropriate markdown file or files.
- Add a dated entry to [DECISIONS.md](DECISIONS.md).
- Include the decision, rationale or context, affected files, and follow-up items.
- Update `Last Updated` in every file changed.
- Update `Status` when the user explicitly requests a status change.

Approved documents should not be casually redesigned. They can change, but changes should be intentional, traceable, and reflected in [DECISIONS.md](DECISIONS.md) when significant.

## Coding Philosophy

Implementation should follow the same philosophy as the documentation:

- Keep Version 1 simple.
- Prefer clear, maintainable code over cleverness.
- Do not introduce dependencies, abstractions, services, or features before they serve an approved need.
- Preserve user trust, privacy, and continuity.
- Let architecture follow product understanding, not the other way around.
- Keep technical decisions documented in [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) and [DECISIONS.md](DECISIONS.md).

## Codex Instructions

When working on Open Loops, Codex should:

- Review the relevant markdown files before making changes.
- Preserve approved decisions unless explicitly asked to revisit them.
- Avoid inventing product features beyond approved source material or placeholders.
- Preserve the MVP direction: capture thoughts, create Open Loops, talk to Lumi, and organize thinking before exposing deeper long-term capabilities.
- Treat [UX.md](UX.md), [UI_REFERENCE/HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png), and [UI_REFERENCE/HomeScreen_v1_annotated.svg](UI_REFERENCE/HomeScreen_v1_annotated.svg) as the canonical Version 1 UX reference unless intentionally revised.
- Preserve UX Vision versions in [UI_REFERENCE/UX_VISION_HISTORY.md](UI_REFERENCE/UX_VISION_HISTORY.md); meaningful design leaps should create new artifacts such as `UX_Vision_0.2.png` rather than overwriting the previous visual milestone.
- Do not reproduce the Home Screen mockup pixel-for-pixel; preserve the philosophy, interaction model, visual hierarchy, and feeling while keeping implementation technically practical.
- Keep documentation synchronized across related files.
- Record finalized decisions in [DECISIONS.md](DECISIONS.md).
- Ask for clarification when a requested change would conflict with an approved decision.

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved governance, workflow, and coding philosophy decisions, including Decision Log 001 from July 1, 2026.

## Related Documents

- [Open Loops Vision](OPEN_LOOPS_VISION.md)
- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [UX](UX.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [Architecture](ARCHITECTURE.md)
- [Data Model](DATA_MODEL.md)
- [MVP Tasks](MVP_TASKS.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [ChatGPT Coordination Brief](OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md)
- [Business DNA](Business%20DNA/README.md)
- [Decisions Log](DECISIONS.md)

## Open Questions

- TBD

## Version 1 Boundaries

- TBD
