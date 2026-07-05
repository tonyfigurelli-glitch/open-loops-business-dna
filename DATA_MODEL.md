# Data Model

Status: Draft
Last Updated: 2026-07-02
Owner: TBD

## Purpose

Define the conceptual data model for Open Loops before implementation-specific schemas are approved.

## Core Entities

- User
- Lumi Conversation
- Thought
- Open Loop
- Loop Connection
- AI Insight
- Loop Status
- Timeline Event

## Entity Notes

### Thought

TBD

### Open Loop

TBD

### Loop Connection

TBD

### AI Insight

TBD

### Loop Status

TBD

## Relationships

- TBD

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
- How should loop connections be represented in Version 1?
- How should archived loops be modeled?

## Version 1 Boundaries

- Do not model full Emotional DNA in Version 1.
- Do not model Relationship Translation in Version 1.
- Do not create a complex graph model before the basic Open Loop workflow is validated.
