# Architecture

Status: Draft
Last Updated: 2026-07-02
Owner: TBD

## Purpose

Provide the implementation-facing architecture entry point for Open Loops.

## Architecture Summary

The MVP architecture should support authentication, Home Screen, Talk to Lumi, Capture Thought, Create Open Loop, Bubble Interface, List View, Add Thought to Existing Loop, Basic AI categorization, and persistent storage.

## Canonical Technical Source

Detailed technical architecture lives in [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md).

## Application Surfaces

- Home
- Loops
- Lumi
- Universe
- Me

## Core System Responsibilities

- User authentication
- Thought capture
- Open Loop creation and management
- Lumi conversation
- Bubble visualization
- List view
- Basic categorization
- Persistent storage

## UX Reference

The Home Screen implementation should align with [HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png).

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved architecture decisions.

## Related Documents

- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Data Model](DATA_MODEL.md)
- [UX](UX.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)

## Open Questions

- TBD

## Version 1 Boundaries

- Do not introduce advanced analytics in Version 1.
- Do not build Relationship Translation in Version 1.
- Do not overbuild the Universe view before the Home and Loops experience is validated.
