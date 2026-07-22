# Small Business Owner Initial Calibration Version 1.4 Proposals

Status: Superseded by Approved Version 1.4
Last Updated: 2026-07-21
Owner: Tony

## Purpose

Record proposed improvements to the Small Business Owner Initial Calibration without altering the frozen Version 1.3 specification or its machine-readable definition.

## Change-Control Rule

Version 1.3 remains the sole authoritative calibration definition until Tony explicitly approves a new version.

Observations, pilot findings, implementation lessons, and suggested wording changes belong here as proposals. They must not be applied silently to Version 1.3, its JSON definition, application prompts, or user interface.

## Proposal Template

### Proposal Title

- Status: Proposed
- Source or evidence: TBD
- Current Version 1.3 behavior: TBD
- Proposed change: TBD
- Reason: TBD
- Comparability impact: TBD
- Migration impact: TBD
- Founder decision: Pending

## Approved Changes

- Status: Approved July 21, 2026
- Source or evidence: Founder pilot experience found the twelve-question feedback sequence too long and established a limit of no more than three questions. The final-profile generation also failed in the live flow and required clearer recovery.
- Current Version 1.3 behavior: Seven rating questions followed by five open-ended questions.
- Approved change: Two ratings and one open-ended feedback question; explicit reliable-completion and immutable-retry requirements.
- Comparability impact: Onboarding and profile outputs remain comparable. Feedback responses are not directly comparable.
- Migration impact: None. Version 1.3 sessions remain unchanged.
- Founder decision: Approved.

## Decision References

- See the root [Decisions Log](../../../DECISIONS.md) for Version 1.3 authority and change-control decisions.

## Related Documents

- [Version 1.3 specification](SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md)
- [Version 1.3 JSON](v1.3.json)
- [Version 1.4 specification](SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md)
- [Version 1.4 JSON](v1.4.json)
- [Calibration workspace](README.md)
- [Business DNA Instructions](../../AGENTS.md)

## Open Questions

- Which evidence threshold should be required before Tony considers a Version 1.4 proposal?
- How should future pilot findings be grouped without overweighting a single participant?

## Version 1 Boundaries

- This file preserves the proposal history that led to Version 1.4.
- Future changes require a new version and must not alter frozen Versions 1.3 or 1.4.
