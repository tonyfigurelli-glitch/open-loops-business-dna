# Data Model

Status: Draft
Last Updated: 2026-07-18
Owner: TBD

## Purpose

Define the conceptual data model for Open Loops before implementation-specific schemas are approved.

## Core Entities

- User
- Thought
- Open Loop
- Chat Session
- Chat Message
- Loop Connection
- AI Insight
- Loop Status
- Timeline Event
- Calibration Definition
- Calibration Session
- Calibration Response
- Calibration Initial Model
- Calibration Evidence Reference
- Calibration Experiment
- Calibration Participant Feedback
- Initial Business DNA Record
- Calibration Evaluation
- Calibration Generation Attempt

## Entity Notes

### Thought

A dated quick-capture record for an open loop, memory, question, feeling, idea, or reflection.

Thoughts should remain distinct from Chat Messages. A Thought can later connect to Open Loops, Chat Sessions, recurring themes, or other thoughts.

### Chat Session

A contextual Lumi conversation.

A Chat Session should preserve ordered Chat Messages and enough continuity for future Lumi behavior to interpret follow-up questions through prior messages in that same session.

### Chat Message

An ordered user or Lumi message inside a Chat Session.

Chat Messages should not be treated as disconnected standalone Thoughts by default, although they may later connect to Thoughts, Open Loops, recurring themes, or prior chats.

### Open Loop

TBD

### Loop Connection

TBD

### AI Insight

TBD

### Loop Status

TBD

### Calibration Definition

The immutable, versioned calibration contract loaded from the canonical Business DNA JSON definition. It supplies question wording, order, options, output sections, feedback schema, evidence rules, semantic version, and frozen source hash.

### Calibration Session

A durable record of one participant's calibration. It preserves participant identity, calibration ID, semantic version, frozen source hash, status, start and completion timestamps, current question index, immutable responses, a separately stored generated profile, central hypothesis, supporting evidence, possible disconfirming evidence, confidence, unknowns, direct quotes, proposed experiment, numerical feedback, and open-ended feedback.

Generation provenance records whether the saved model came from validated AI-assisted generation or deterministic fallback, along with provider, model identifier, prompt-instruction version, calibration version and hash, generation time, validation result, retry count, evidence-package hash, and available usage metadata. A validated original structured AI output is preserved separately and is never silently overwritten.

Generation provenance also retains one content-free validation diagnostic per provider attempt: attempt number, outcome, stable failure codes, and fixed validator error messages. These diagnostics support operational diagnosis without storing participant answers or rejected narrative in logs.

The initial model remains historically distinguishable from later Business DNA evidence and revisions.

The durable implementation also records participant code when present, last-update time, competing hypotheses, confidence rationale, direct statements, reasonable inferences, tentative hypotheses, original validated structured output, deterministic fallback output when used, and local-storage migration provenance. Session ownership is stored and enforced independently of client-supplied participant identifiers.

### Initial Business DNA Record

An immutable historical record created when a calibration completes. It links to its source session and preserves effective date, calibration version and source hash, central hypothesis, supporting and disconfirming evidence, confidence, unknowns, contradictions, seven-day experiment, generation provenance, and the status `initial_provisional_model`. Later observations or revised conclusions must create separate records or revisions rather than overwrite this starting point.

### Calibration Generation Attempt

An immutable retry result linked to one completed owner-scoped calibration session. It records a unique attempt ID, source session ID, requested model family, outcome (`ai_assisted` or `failed_with_fallback`), generation result, provenance, available original structured output, and creation time. The attempt is generated only from the source session's exact stored twelve answers and remains separate from the original session output and Initial Business DNA Record.

### Calibration Evaluation

A reviewer-owned record stored separately from participant sessions and immutable Business DNA records. It may reference deterministic fallback output, AI-assisted output, or manually supplied historical pilot output and records 1–5 scores for specificity, evidence grounding, confidence discipline, participant voice, alternative hypotheses, respectful challenge, seven-day experiment quality, usefulness, repetition, and unsupported-inference risk. Evaluation data never becomes generation context and never updates the original output.

## Relationships

- Thoughts may connect to other Thoughts, Open Loops, Chat Sessions, and Timeline Events.
- Chat Sessions contain ordered Chat Messages.
- Chat Sessions may later connect to Open Loops, Thoughts, prior Chat Sessions, recurring themes, and insights.
- Loop Connections may reference related Thoughts and Chat Sessions as supporting context.
- Calibration Sessions reference one immutable Calibration Definition version and contain ordered Calibration Responses.
- A completed Calibration Session preserves its Initial Model, Evidence References, Experiment, and Participant Feedback without overwriting later Business DNA learning.
- A completed Calibration Session creates exactly one owner-scoped Initial Business DNA Record.
- A completed fallback Calibration Session may have multiple separate Calibration Generation Attempts without modifying the source session or Initial Business DNA Record.
- Calibration Evaluations may reference a source session but remain separate from its immutable output and later Business DNA learning.

## Data Principles

- Preserve continuity.
- Support accumulated understanding.
- Keep Version 1 simple.
- Avoid modeling long-term Emotional DNA before the MVP foundation is validated.
- Load canonical calibration content from its versioned definition rather than duplicating wording in application components.

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved data model decisions.

## Related Documents

- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Architecture](ARCHITECTURE.md)
- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [UX](UX.md)

## Open Questions

- Which fields are required for a minimum viable Thought?
- Which fields are required for a minimum viable Open Loop?
- Which fields are required for a minimum viable Chat Session and Chat Message?
- How should loop connections be represented in Version 1?
- How should archived loops be modeled?
- How should later Business DNA observations supersede conclusions while preserving the initial calibration model?

## Version 1 Boundaries

- Do not model full Emotional DNA in Version 1.
- Do not model Relationship Translation in Version 1.
- Do not create a complex graph model before the basic Open Loop workflow is validated.
