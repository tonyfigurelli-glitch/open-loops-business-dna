# Business DNA

Status: Approved Working Direction
Last Updated: 2026-07-18
Owner: Tony

## Purpose

Serve as the canonical entry point for Business DNA, the business-oriented application of Open Loops.

Business DNA combines accumulated understanding of a business, its owner or leadership, its operating patterns, unresolved decisions, opportunities, risks, commitments, and evolving priorities.

## Place Within Open Loops

Business DNA remains subordinate to the broader Open Loops system and must not become a separate or competing product architecture.

- Open Loops is the parent system.
- Emotional DNA is personal-understanding intelligence.
- Business DNA is the business-oriented application.
- Lumi is the conversational personality and human-facing expression.

## Approved Direction

Business DNA should:

- understand the business and the people operating it
- establish an initial business-owner model through calibration
- preserve that model as a provisional, evidence-based starting point
- capture business-related Open Loops
- learn from future conversations, actions, decisions, and outcomes
- maintain durable and inspectable knowledge outside model memory
- identify recurring patterns without presenting speculation as fact
- support testable actions and evidence-generating experiments
- evaluate growth together with profitability, sustainability, capacity, and owner dependence

Business DNA follows the Meridian principle: decisions and recommendations should be compared continually against the business's longer-term true north, not only its immediate pressure.

## Initial Approved Capability

The Small Business Owner Initial Calibration is approved for implementation as part of the current Open Loops application work.

Canonical version: `small_business_owner_initial_calibration@1.3.0`

Required source-of-truth locations:

- [Human-readable Version 1.3 specification](calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md)
- [Machine-readable Version 1.3 definition](calibrations/small-business-owner/v1.3.json)

Both frozen Version 1.3 artifacts are memorialized at their canonical locations. Automated validation protects the Markdown source hash, compares the structured questions back to the specification, verifies required counts and rules, and rejects unlabelled competing calibration prompts.

Application code consumes the JSON through a shared domain adapter. User-interface components and prompts must not duplicate Version 1.3 wording. Session records use the inherited Open Loops authenticated API and durable storage architecture and carry the calibration identity, frozen source hash, participant material, generated model, evidence, uncertainty, experiment, feedback, and generation provenance. Local storage remains a recoverable network-loss cache rather than the sole source of truth. Completion creates an immutable `initial_provisional_model` Business DNA record without overwriting the original calibration.

Completed results provide a session-history selector and a Start New Calibration action. Each new run receives a unique Version 1.3 session identity while all older sessions remain available. If a completed result used deterministic fallback, a GPT-5.6 retry may create a separate immutable generation attempt from the exact stored twelve-answer evidence package. The retry does not alter the source session, its original output, or its initial Business DNA record.

Retry attempts are persisted append-only by the authenticated server endpoint and are returned newest-first on every session read. Browser refresh and server restart therefore retain successful AI-assisted results, failed attempts, safe diagnostics, and provenance. The client preserves this server-owned attempt history during local recovery and does not send retry results through the completed-session update route.

AI-assisted participant narrative uses the traceable instruction version `small_business_owner_v1.3_ai_generation@1.1.2`. It preserves the ten canonical Version 1.3 section IDs, titles, and order while requiring section bodies to read as polished reflection rather than expose calibration machinery, evidence labels, metadata, prompt text, raw answer summaries, confidence ratings, or internal evaluation rationale. Frozen labeled structures are treated as semantic requirements rendered into natural prose; uncertainty is expressed naturally while remaining explicit in structured records. Narrative validation remains part of the same retry, evidence, safety, provenance, immutability, and deterministic-fallback boundary.

Completed results present the ten narrative sections first. Repeated unknowns and possible disconfirming explanations are conservatively deduplicated and shown as readable lists. Stored Interpretation, Original Answers, the complete Seven-Day Experiment, Participant Feedback, and generation/source diagnostics remain complete and accessible in collapsed `Review details` disclosures so audit material does not dominate the participant reflection.

## Evidence And Memory Principles

- Major conclusions should generally require at least two independent pieces of evidence.
- Direct statements, reasonable inferences, tentative hypotheses, and unknowns must remain distinguishable.
- Confidence must be explicit and revisable.
- Competing explanations must be retained when evidence is incomplete.
- Business DNA knowledge must be durable, inspectable, versioned, attributable, exportable, and recoverable.
- Later understanding must not silently overwrite the original calibration model.

## Documentation Map

- [README.md](README.md): canonical Business DNA overview
- [AGENTS.md](AGENTS.md): approved governance, product boundaries, and implementation authorization
- [Calibration workspace](calibrations/small-business-owner/README.md): canonical location, source rules, legacy audit, and validation requirements
- [Version 1.3 specification](calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md): frozen authoritative human-readable specification
- [Version 1.3 JSON](calibrations/small-business-owner/v1.3.json): derived authoritative machine-readable definition
- [Version 1.3 validation tests](calibrations/small-business-owner/v1.3.test.mjs): source-correspondence, count, rule, and supersession checks
- [Version 1.4 proposals](calibrations/small-business-owner/CALIBRATION_V1_4_PROPOSALS.md): separate intake for unapproved improvements
- [Pilot readiness](calibrations/small-business-owner/PILOT_READINESS.md): blockers, authentication/provider options, configuration, retention, and failure modes
- [Pilot acceptance test](calibrations/small-business-owner/PILOT_ACCEPTANCE_TEST.md): tester and technical verification checklists
- [Pilot operations](calibrations/small-business-owner/PILOT_OPERATIONS.md): consent, review, backup, export, deletion, monitoring, and issue handling

Approved Business DNA decisions are recorded in the root [Decisions Log](../DECISIONS.md).

## Decision References

- See [DECISIONS.md](../DECISIONS.md) for the decisions establishing Business DNA and approving its working direction.

## Related Documents

- [Business DNA Instructions](AGENTS.md)
- [Open Loops Constitution](../AGENTS.md)
- [Open Loops Vision](../OPEN_LOOPS_VISION.md)
- [Open Loops Product](../OPEN_LOOPS_PRODUCT.md)
- [ChatGPT Coordination Brief](../OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md)
- [Decisions Log](../DECISIONS.md)

## Open Questions

- Which parts of Business DNA belong in the first working application interface?
- How should Business DNA conclusions be represented and revised over time?
- When should Lumi surface patterns proactively?
- How should contradictory evidence affect confidence?
- Which Business DNA capabilities belong after Version 1?
- When should Business DNA support multiple owners or leadership-team members?

## Version 1 Boundaries

- Business DNA may participate through the approved Small Business Owner Initial Calibration and the minimum infrastructure necessary to preserve and evolve its results.
- Version 1 must not expand into a complete business-management platform.
- The focus is initial understanding, capture, durable memory, evolving Business DNA, Lumi interaction, evidence-based reflection, and useful next actions.
- Accounting, CRM replacement, payroll, inventory, project-management replacement, full team-performance management, automated operational control, unsupported diagnosis, and autonomous consequential decisions remain out of scope unless separately approved.
