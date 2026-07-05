# Technical Architecture

Status: Draft
Last Updated: 2026-07-05
Owner: TBD

## Purpose

Document the technical architecture of Open Loops, including system boundaries, data structures, infrastructure, integrations, and engineering decisions.

## Document Use

Use this file for technical decisions and architecture placeholders. Do not choose technologies, vendors, or implementation patterns here until they are explicitly approved.

## Architecture Summary

The MVP architecture should support thought capture, Open Loop creation, a Lumi conversation surface, a bubble-based loop workspace, basic AI categorization, and persistent storage.

The Home Screen implementation should align with [HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png) as the canonical Version 1 UX reference.

## Foundational Technical Concepts

- Emotional DNA
- Long-term relationship memory
- Accumulated personal understanding
- Historical context developed over years
- Open Loops as evolving subjects
- Bubble interface
- Universe view as zoomed-out pattern perspective

## System Boundaries

TBD

## Application Surfaces

- Home
- Loops
- Lumi
- Universe
- Me

## Core Components

- Authentication
- Thought capture
- Open Loop management
- Lumi conversation mode
- Bubble workspace
- List view
- Basic AI categorization
- Persistent storage

## Data Model

The core model should support thoughts, Open Loops, conversations, voice notes or uploaded inputs, observations, AI insights, loop connections, and lifecycle state.

### Thought Capture And Lumi Conversation Separation

The architecture should preserve a clear boundary between quick thought capture and Lumi conversation.

Enter a Thought creates dated Thought records. A Thought can later become or connect to Open Loops, themes, chat sessions, or other thoughts, but it does not require a conversational Lumi response.

Chat with Lumi opens or continues a Chat Session and stores ordered Chat Messages. The active Chat Session must preserve conversational continuity so future Lumi responses can use prior messages in that same session.

Future Lumi milestones should support follow-up questions based on session context, avoid disconnected one-off treatment of every message, and avoid simply repeating prior responses.

Chat Sessions should later be able to connect to one or more Open Loops without being reduced to standalone Thought records.

## Storage

TBD

## Information Access

The product should support both visual bubble navigation and list-based access.

## Automation And AI

AI is the enabling technology.

Understanding is the product.

Lumi should support pattern recognition, repeated thought detection, emerging theme detection, relationships between Open Loops, contradictions, growth signals, and possible emotional insights.

Future Lumi conversation work must treat Lumi as a contextual conversational agent within an active Chat Session. Do not implement real intelligence until explicitly scoped, but keep the data and component boundaries ready for ordered chat history, follow-up context, non-repetitive responses, and later Open Loop connections.

## Integrations

- TBD

## Security And Privacy

TBD

## Observability

TBD

## Deployment

TBD

## Engineering Constraints

- Do not introduce technologies, dependencies, services, or implementation patterns before they serve an approved need.
- TBD

## Technical Risks

- TBD

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved technical decisions, including Decision Log 001 from July 1, 2026.

## Related Documents

- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [UX](UX.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Open Loops Constitution](AGENTS.md)

## Open Questions

- TBD

## Version 1 Boundaries

- TBD
