# Open-Source License Decision Required

Status: Blocked Pending Owner Decision
Last Updated: 2026-07-18
Owner: Tony

## Purpose

Record the repository's licensing state and the owner decision required before describing Open Loops as open source.

## Current State

No `LICENSE`, `LICENSE.md`, `COPYING`, package license field, or other repository-wide license grant was present in the July 18, 2026 licensing audit. Copyright therefore remains reserved by default. A publicly visible repository without a license may be reviewed, but others do not receive standard open-source permission to use, modify, or redistribute it.

## Owner Decision Required

Tony must choose the intended rights grant. Common options include:

- **MIT:** short and permissive; requires preservation of copyright and license notices.
- **Apache License 2.0:** permissive with an express patent license and additional notice requirements.
- **Another approved license:** choose with legal advice if product, investor, contributor, or commercialization plans require different terms.
- **No open-source license:** keep the repository private or intentionally source-visible with all rights reserved, and do not call it open source.

Codex has not selected or added a license because this affects ownership, reuse, contributor expectations, patents, and commercialization. Once Tony explicitly approves a license and copyright holder name, add its unmodified canonical text, declare it in `package.json`, and update the README and submission checklist.

## Open Questions

- Which license does Tony approve?
- What copyright holder name and year should appear?
- Does Tony want contributor terms or a CLA before accepting outside contributions?

## Version 1 Boundaries

This document records a blocker only. It grants no license and changes no ownership rights.
