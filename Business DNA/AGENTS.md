# Business DNA Instructions

Status: Approved Working Direction
Last Updated: 2026-07-22
Owner: Tony

## Purpose

Define the governance, documentation, and implementation rules for the Business DNA branch of Open Loops.

Business DNA is the business-oriented application of Open Loops. It combines accumulated understanding of a business, its owner or leadership, its operating patterns, unresolved decisions, opportunities, risks, commitments, and evolving priorities.

Business DNA should help Open Loops understand not only what is happening in a business, but also:

- why problems recur
- which decisions are being avoided
- where stated priorities differ from behavior
- which opportunities repeatedly go unacted upon
- how the owner or leadership team makes decisions
- what conditions support strong performance
- what may be limiting sustainable growth
- how understanding changes over time

Business DNA remains subordinate to the broader Open Loops system and must not become a separate or competing product architecture.

## Project Hierarchy

The canonical hierarchy is:

- Open Loops — parent system
  - Emotional DNA — personal-understanding intelligence
  - Business DNA — business-oriented application
  - Lumi — conversational personality and human-facing expression

Business DNA must remain within the main Open Loops repository unless the founder explicitly approves a different architecture.

## Inherited Governance

All work in this directory must follow the repository-level [Open Loops Constitution](../AGENTS.md).

If a local instruction conflicts with:

1. the Open Loops Constitution,
2. an approved decision,
3. a canonical specification, or
4. an explicit founder instruction,

the higher-authority instruction takes precedence.

Business DNA may define local implementation rules, but it may not silently alter foundational Open Loops principles.

## Current Approved Direction

Business DNA is no longer an undefined placeholder.

Its current approved direction includes:

- understanding the business and the people operating it
- establishing an initial business-owner model through calibration
- preserving that model as a provisional, evidence-based starting point
- capturing business-related Open Loops
- learning from future conversations, actions, decisions, and outcomes
- maintaining durable and inspectable Business DNA outside model memory
- identifying recurring patterns without presenting speculation as fact
- supporting testable actions and evidence-generating experiments
- distinguishing surface behavior from actual business constraints
- evaluating growth together with profitability, sustainability, capacity, and owner dependence

Business DNA must follow the Meridian principle: decisions and recommendations should be continually compared against the business's longer-term true north rather than reacting only to immediate pressure.

## Small Business Owner Initial Calibration

The Small Business Owner Initial Calibration is an approved Business DNA capability.

Its current canonical version is:

`small_business_owner_initial_calibration@1.4.0`

The authoritative human-readable specification must be stored at:

`calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md`

The authoritative machine-readable definition must be stored at:

`calibrations/small-business-owner/v1.4.json`, resolved against frozen `v1.3.json`

The application must not reconstruct the calibration from:

- model memory
- chat history
- participant transcripts
- generated profiles
- informal summaries
- older prompt versions

The versioned calibration files in the repository are the source of truth.

Every completed calibration session must record the exact calibration version used.

Version 1.3 must remain frozen after memorialization. Any substantive change must create a new version.

Version 1.4 is the current authoritative calibration definition. Version 1.3 remains a frozen historical definition. Do not search prior conversations, generated profiles, pilot transcripts, model memory, or later-discovered drafts for alternative wording.

Any earlier or later-discovered draft is historical reference only unless Tony explicitly approves a new calibration version. Future substantive improvements must create a new version and must not alter frozen Versions 1.3 or 1.4.

Before calibration user-interface work begins, verify that application code resolves `calibrations/small-business-owner/v1.4.json` and its frozen Version 1.3 base through the shared application adapter. UI components, application prompts, and response generators must not duplicate canonical question wording or output-schema text.

## Implementation Authorization

Implementation of the Small Business Owner Initial Calibration is approved as part of the current Open Loops application work.

This authorization includes:

- the 12-question onboarding flow
- one-question-at-a-time presentation
- controlled context isolation
- storage of participant answers
- generation of the initial business-owner model
- storage of evidence, confidence, unknowns, and competing explanations
- creation of one seven-day experiment
- collection of participant feedback inside the product
- version tracking
- preservation of the original calibration output
- future evolution of Business DNA through continuing interaction

This does not authorize unrelated expansion of the Open Loops Version 1 scope.

Any additional Business DNA feature must be tied to an approved product need or explicit founder decision.

## Evidence and Reasoning Requirements

Business DNA must be grounded in evidence rather than speculation.

Major conclusions should generally require at least two independent pieces of evidence.

The system must distinguish:

- direct statements
- reasonable inferences
- tentative hypotheses
- unknowns

The system must not automatically treat:

- a disliked task
- an avoided task
- founder involvement
- lack of documentation
- lack of delegation

as the root business constraint.

Competing explanations must be considered when evidence is incomplete.

Confidence must be explicit and revisable.

## Foundational Management Practice Requirements

The approved Business DNA Foundational Management Library Version 1.0 and its governing intelligence contract are defined in [Business DNA Intelligence System Version 1](BUSINESS_DNA_INTELLIGENCE_SYSTEM_V1.md).

Business DNA must move beyond paraphrasing participant answers. An accepted major insight must connect at least two independent answers, identify a likely business consequence, match only an applicable canonical management practice, retain a caution and disconfirming condition, and produce a measurable experiment.

The eleven approved books are authoritative foundations, not automatic prescriptions. The application must use normalized practice records rather than copyrighted book text or indiscriminate generic business advice.

## Memory and Data Requirements

Business DNA must never depend on an AI model's conversational memory as the sole location of business knowledge.

Business DNA must be:

- externalized
- durable
- inspectable
- versioned
- attributable to evidence
- exportable
- recoverable
- independent of any single model or app session

The initial calibration, later observations, contradictions, and revised conclusions must remain historically distinguishable.

Later understanding must not silently overwrite the original model.

Every calibration session must store:

- calibration ID
- semantic version
- frozen source hash
- participant responses
- generated initial model
- evidence references
- confidence level
- unknowns
- proposed experiment
- participant feedback

## Documentation Workflow

Business DNA documents must follow repository metadata and governance requirements.

When a Business DNA decision is finalized:

- update the appropriate canonical file
- add a dated entry to the root [Decisions Log](../DECISIONS.md)
- update `Last Updated` in every changed document
- update status when the decision changes the document's authority
- identify any superseded file or instruction
- preserve historical versions when appropriate

## Canonical Document Priority

Within Business DNA, use this priority order:

1. Explicit founder instruction
2. Root Open Loops Constitution
3. Root Decisions Log
4. Approved Business DNA canonical specifications
5. Business DNA local instructions
6. Working drafts
7. Exploratory notes
8. Generated model output

A generated response or participant profile is never itself a canonical product specification.

## Related Documents

- [Business DNA Overview](README.md)
- [Open Loops Constitution](../AGENTS.md)
- [ChatGPT Coordination Brief](../OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md)
- [Decisions Log](../DECISIONS.md)
- [Small Business Owner Initial Calibration Version 1.3](calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md) — frozen canonical human-readable specification
- [Small Business Owner Initial Calibration Version 1.3 JSON](calibrations/small-business-owner/v1.3.json) — derived canonical machine-readable definition
- [Small Business Owner Initial Calibration Version 1.4](calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md) — current canonical specification
- [Small Business Owner Initial Calibration Version 1.4 JSON](calibrations/small-business-owner/v1.4.json) — current machine-readable override
- [Business DNA Intelligence System Version 1](BUSINESS_DNA_INTELLIGENCE_SYSTEM_V1.md) — approved intelligence, management-practice, anti-paraphrase, and participant-isolation contract

## Open Questions

- Which parts of Business DNA belong in the first working application interface?
- How should Business DNA conclusions be represented and revised over time?
- When should Lumi surface patterns proactively?
- How should contradictory evidence affect confidence?
- Which Business DNA capabilities belong after Version 1?
- When should Business DNA support multiple owners or leadership-team members?

## Version 1 Boundaries

Business DNA may participate in Open Loops Version 1 through the approved Small Business Owner Initial Calibration and the minimum infrastructure necessary to preserve and evolve its results.

Version 1 should not expand into a complete business-management platform.

Unless separately approved, Version 1 does not include:

- accounting
- CRM replacement
- payroll
- inventory management
- project-management replacement
- full team-performance management
- automated operational control
- unsupported business diagnosis
- autonomous execution of consequential business decisions

The Version 1 focus is:

- initial understanding
- thought and conversation capture
- Open Loop creation
- durable memory
- evolving Business DNA
- Lumi interaction
- evidence-based reflection
- useful next actions
