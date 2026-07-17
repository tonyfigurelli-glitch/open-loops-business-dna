# MVP Tasks

Status: Draft
Last Updated: 2026-07-17
Owner: TBD

## Purpose

Track the Version 1 MVP task structure for Open Loops.

## MVP Scope

- Authentication
- Home Screen
- Talk to Lumi
- Capture Thought
- Create Open Loop
- Bubble Interface
- List View
- Add Thought to Existing Loop
- Basic AI categorization
- Persistent storage
- Small Business Owner Initial Calibration Version 1.3

## Task Backlog

### Foundation

- TBD

### Home Screen

- TBD

### Lumi

- Build Chat with Lumi as a true conversational mode, not as thought capture.
- Support starting or continuing a Chat Session.
- Store ordered Chat Messages.
- Preserve session context for future follow-up questions.
- Future Lumi responses should use prior chat context and avoid simply repeating the previous answer.
- Allow Chat Sessions to later connect to Open Loops.
- Do not implement real Lumi intelligence unless explicitly scoped by a milestone.

### Open Loops

- TBD

### Bubble Interface

- TBD

### Persistence

- TBD

### AI Categorization

- TBD

### Business DNA Calibration

- [x] Load the sole authoritative Version 1.3 definition through the shared JSON adapter.
- [x] Start or resume a durable calibration session.
- [x] Ask exactly 12 questions one at a time.
- [x] Persist participant responses after every answer.
- [x] Generate and preserve the ten-section initial model.
- [x] Store evidence references, confidence, unknowns, and one seven-day experiment.
- [x] Collect seven rating responses and five open-ended feedback responses one at a time.
- [x] Preserve the completed session with calibration ID, semantic version, and frozen source hash.
- [x] Prevent UI components from duplicating canonical question wording.
- [x] Reopen an incomplete session at its saved question and reopen a completed session after returning.
- [x] Test start, ordered progress, serialized resume, completion, feedback, and reopening behavior.
- [ ] Replace the conservative local model generator only when a model integration is separately approved.
- [x] Add the provider-neutral AI generation boundary and current-session evidence package.
- [x] Validate structured AI output, retry once, and preserve deterministic fallback.
- [x] Preserve generation provenance and the original validated structured output.
- [x] Confirm that no provider secret is embedded in frontend source.
- [ ] Implement an approved secure server-side model provider adapter.

## Acceptance Criteria

- TBD

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved MVP task decisions.

## Related Documents

- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [UX](UX.md)
- [Architecture](ARCHITECTURE.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)

## Open Questions

- TBD

## Version 1 Boundaries

- No Emotional DNA.
- No Relationship Translation.
- No advanced analytics.
- No public social features.
- No changes to frozen Calibration Version 1.3; proposals belong in the Version 1.4 proposal document.
