# Business DNA Intelligence System Version 1

Status: Approved Working Specification
Last Updated: 2026-07-22
Owner: Tony

## Purpose

Define how Business DNA turns calibration answers into evidence-grounded business insight rather than paraphrase, generic praise, or unsupported personality interpretation.

This specification governs the intelligence layer behind the Small Business Owner Initial Calibration. The frozen Version 1.4 questions and participant-feedback contract remain unchanged.

## Required Reasoning Sequence

Business DNA must:

1. Listen only to the current participant's isolated calibration evidence.
2. Detect a pattern, tension, strength, possible hidden cost, or blind spot spanning multiple answers.
3. Validate each major conclusion against at least two independent answers.
4. Compare the supported pattern with the curated Business Practice Knowledge Base.
5. Select only a practice whose use conditions fit the evidence.
6. Adapt the practice to the business's size, resources, circumstances, and leadership style.
7. State the likely business consequence without presenting a hypothesis as fact.
8. Retain a caution, competing explanation, and a result that would disprove the inference.
9. Recommend a small, reversible seven-day experiment with an observable result.
10. Learn from the result by strengthening, weakening, revising, or rejecting the initial hypothesis.

## Foundational Management Library Version 1.0

The canonical source set is:

- *The Effective Executive* — Peter Drucker
- *Good to Great* — Jim Collins
- *The Hard Thing About Hard Things* — Ben Horowitz
- *High Output Management* — Andy Grove
- *Start with Why* — Simon Sinek
- *Radical Candor* — Kim Scott
- *The Five Dysfunctions of a Team* — Patrick Lencioni
- *Multipliers* — Liz Wiseman
- *Measure What Matters* — John Doerr
- *The Innovator’s Dilemma* — Clayton Christensen
- *Playing to Win* — A.G. Lafley and Roger Martin

Machine-readable library version: `business_dna_foundational_management_library@1.0.0`

The current practice records are maintained in [businessPracticeLibrary.ts](../src/domain/businessPracticeLibrary.ts). Each record includes its sources, use conditions, questions required before application, small-business adaptation, cautions, and experiment pattern.

The library is an authoritative starting foundation, not doctrine. Principles may conflict, and context determines fit. For example, tighter control may be appropriate in a crisis while becoming a bottleneck during stable growth.

## Initial Practice Set

Version 1 includes these normalized practices:

- focus executive attention on contribution
- increase managerial leverage
- face hard reality without losing direction
- align daily choices with purpose
- combine care with direct clarity
- turn a priority into a measurable result
- make an integrated set of strategic choices
- protect uncertain learning from the demands of the established business

Business DNA recommends the practice, not the book. Participant-facing language should explain the principle in plain terms and adapt it to the current business.

## Insight Contract

Every applied practice must store:

- a canonical practice ID
- at least two independent current-session evidence references
- the new connection inferred across those answers
- the likely business consequence
- why the practice fits this situation
- a caution against misapplication
- what evidence would disprove the inference
- its relationship to the seven-day experiment

Every major conclusion remains provisional. Direct statements, reasonable inferences, tentative hypotheses, unknowns, and competing explanations must remain distinguishable in the durable record.

## Anti-Paraphrase Quality Gate

A candidate output must be rejected when it:

- merely restates or lightly rewords a participant answer
- converts a stated preference into a flattering personality label
- makes a conclusion from only one answer
- invents a management practice or cites a source outside the curated library
- names a practice without explaining why it fits
- omits the business consequence or possible misapplication
- cannot state what would disprove the inference
- treats avoided work, founder involvement, delegation, or lack of documentation as the root constraint without independent support
- presents confidence, evidence counts, prompt mechanics, or internal evaluation language to the participant
- uses generic praise, certainty, diagnostic language, or fortune-teller phrasing

The validator may use lexical checks to catch obvious answer echoes, but the structured cross-answer, consequence, fit, caution, and disconfirmation requirements are the primary defense against shallow interpretation.

## Participant Isolation

Every pilot browser receives a durable random participant identity. Local recovery data is partitioned by that identity, and the development authentication session must match it before server records are loaded.

The application must never use one hard-coded development user for multiple pilot browsers. A stale cookie from another participant must be signed out before establishing the current browser's isolated development identity.

This isolation is appropriate for temporary controlled pilots. Production deployment still requires an approved authentication adapter and must fail closed when production identity is unavailable.

## Output And Provenance

AI-assisted generation instruction version: `small_business_owner_v1.4_ai_generation@2.1.0`

Participant-facing narrative must not reproduce an answer verbatim, place participant wording in quotation marks, or use a lightly reworded answer as analysis. Exact answers remain available in the collapsed inspectable record. Sections 1 through 8 must each be backed by at least two independent evidence references and must express a connection, consequence, tension, or test that is not present in either answer alone.

The deterministic fallback follows the same presentation rule. It uses cross-answer signals such as role breadth, team scale, decision threshold, opportunity/execution balance, sources of energy, and the relationship between commercial and team goals. It must prefer an honest statement of insufficient evidence over filling a section with an answer summary.

The generated result stores the management-library version and applied-practice records alongside the existing evidence, confidence, uncertainty, experiment, original structured output, validation attempts, and generation provenance.

The original completed calibration and later retry attempts remain immutable and historically distinguishable.

## Acceptance Criteria

External pilot testing may resume only when:

- a new browser begins without another participant's profile
- a stale development session cannot load another participant's records
- each accepted AI profile applies one to three canonical practices
- every applied practice uses at least two independent answers
- obvious answer echoes and unknown practice IDs are rejected
- no participant-facing section uses quotation marks to replay participant language
- deterministic fallback synthesizes cross-answer signals instead of inserting answer text into templates
- the participant sees a specific business consequence and useful experiment
- deterministic fallback remains safe and clearly provisional
- all calibration, server, recovery, and production-readiness tests pass
- Tony's retest judges the profile genuinely useful rather than merely agreeable

## Related Documents

- [Business DNA Overview](README.md)
- [Business DNA Instructions](AGENTS.md)
- [Small Business Owner Initial Calibration Version 1.4](calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md)
- [Pilot Readiness](calibrations/small-business-owner/PILOT_READINESS.md)
- [Root Decisions Log](../DECISIONS.md)

## Open Questions

- Which additional practices earn inclusion after pilot evidence?
- Should Tony's operating principles become a separate attributed layer in Version 1.1?
- How should the product compare two plausible but conflicting practices over time?

## Version 1 Boundaries

- Do not ingest copyrighted book text into the runtime prompt.
- Do not treat the library as a substitute for financial, legal, clinical, or regulated professional advice.
- Do not expand this work into a general business-management platform.
- Do not alter the twelve Version 1.4 calibration questions or three-question feedback contract through this specification.
