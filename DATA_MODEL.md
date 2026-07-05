# Data Model

Status: Draft
Last Updated: 2026-07-05
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

## Relationships

- Thoughts may connect to other Thoughts, Open Loops, Chat Sessions, and Timeline Events.
- Chat Sessions contain ordered Chat Messages.
- Chat Sessions may later connect to Open Loops, Thoughts, prior Chat Sessions, recurring themes, and insights.
- Loop Connections may reference related Thoughts and Chat Sessions as supporting context.

## Data Principles

- Preserve continuity.
- Support accumulated understanding.
- Keep Version 1 simple.
- Avoid modeling long-term Emotional DNA before the MVP foundation is validated.

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

## Version 1 Boundaries

- Do not model full Emotional DNA in Version 1.
- Do not model Relationship Translation in Version 1.
- Do not create a complex graph model before the basic Open Loop workflow is validated.
