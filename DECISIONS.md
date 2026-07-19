# Decisions

Status: Approved
Last Updated: 2026-07-18
Owner: TBD

## Purpose

Maintain the permanent chronological history of approved Open Loops product, design, technical, documentation, and business decisions.

## Document Use

Use this file only for decisions that have been finalized or explicitly approved. Exploratory ideas belong in the relevant project document as placeholders or open questions until they become decisions.

Every entry should include:

- Date
- Decision summary
- Rationale or context
- Affected file references
- Follow-up items, if any

## Entry Template

### YYYY-MM-DD: Decision Title

**Decision:** TBD

**Rationale:** TBD

**Affected Files:**

- TBD

**Follow-Up:** TBD

## Log

### 2026-07-18: Strengthen GPT-5.6 Participant-Facing Narrative Quality

**Decision:** Advance the Small Business Owner AI generation instruction layer from `small_business_owner_v1.3_ai_generation@1.0.0` to `@1.1.0` without changing either frozen Version 1.3 canonical file. Preserve all ten canonical section IDs, titles, and order. Require each section body to contain only polished participant-facing narrative, follow the approved identity-to-continuation sequence, and keep evidence references in structured evidence fields. Prohibit calibration and narrator labels, participant metadata, dates and completion estimates, context-isolation confirmations, evidence labels, question IDs, raw field labels, internal instructions, prompt text, and participant-answer dumps. Reject undeclared or unnatural direct-quote use, repeated prose, generic praise, unsupported certainty, and consultant-report language.

**Rationale:** July 18 live testing produced a successfully stored GPT-5.6 Terra result that passed the technical schema but exposed internal calibration boilerplate, metadata, and a raw answer summary in its first participant-facing section. Technical validity alone is insufficient for a trusted or demo-ready reflection. A traceable generation-instruction revision and enforceable narrative validator improve participant quality while preserving canonical calibration comparability and all existing safety boundaries.

**Affected Files:**

- [src/domain/calibrations/aiModelGenerationPipeline.ts](src/domain/calibrations/aiModelGenerationPipeline.ts)
- [src/domain/calibrations/aiModelGenerationPipeline.test.mjs](src/domain/calibrations/aiModelGenerationPipeline.test.mjs)
- [src/App.tsx](src/App.tsx)
- [server/backend.test.mjs](server/backend.test.mjs)
- [Business DNA/README.md](Business%20DNA/README.md)
- [Business DNA/calibrations/small-business-owner/PILOT_READINESS.md](Business%20DNA/calibrations/small-business-owner/PILOT_READINESS.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Evaluate participant-facing specificity, repetition, tone, and quote usefulness during the controlled pilot. Record any proposed change to canonical questions, section identities, or Version 1.3 rules separately for Version 1.4 consideration. The frozen Version 1.3 Markdown and JSON remain unchanged.

### 2026-07-18: Correct GPT-5.6 Retry Timeout After Build Week Live Test

**Decision:** Replace the model providers' fixed forty-five-second per-attempt timeout with the validated `MODEL_PROVIDER_TIMEOUT_MS` configuration. Use 180,000 milliseconds per attempt by default for the full ten-section strict structured Business DNA result, allow integer values from 30,000 through 600,000 milliseconds, and continue selecting the provider model only through `MODEL_IDENTIFIER`. Preserve the existing two-attempt validation pipeline and deterministic fallback. Normalize timeout and provider failures into safe provenance categories, display timeout separately from other fallback causes, and ensure every retry request leaves the connecting interface state after success, fallback, timeout, or network failure.

**Rationale:** July 18 live testing showed that direct Responses API calls worked with both tested GPT-5.6 model identifiers, but Business DNA retries fell back at exactly ninety seconds because two forty-five-second provider limits expired before the large strict output completed. A longer configurable boundary fixes the integration constraint without weakening validation, hardcoding a model, or exposing sensitive provider or participant material.

**Affected Files:**

- [server/config.mjs](server/config.mjs)
- [server/modelProvider.mjs](server/modelProvider.mjs)
- [server/start.mjs](server/start.mjs)
- [server/README.md](server/README.md)
- [server/productionReadiness.test.mjs](server/productionReadiness.test.mjs)
- [src/domain/calibrations/aiModelGenerationPipeline.ts](src/domain/calibrations/aiModelGenerationPipeline.ts)
- [src/domain/calibrations/aiModelGenerationPipeline.test.mjs](src/domain/calibrations/aiModelGenerationPipeline.test.mjs)
- [src/domain/models.ts](src/domain/models.ts)
- [src/storage/calibrationApi.ts](src/storage/calibrationApi.ts)
- [src/screens/BusinessCalibration.tsx](src/screens/BusinessCalibration.tsx)
- [server/clientRecovery.test.mjs](server/clientRecovery.test.mjs)
- [Business DNA/calibrations/small-business-owner/PILOT_READINESS.md](Business%20DNA/calibrations/small-business-owner/PILOT_READINESS.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Measure real end-to-end latency and timeout/fallback rates during controlled testing before changing the 180-second default. Provider/model activation and paid usage remain separately governed. The frozen Version 1.3 specification and JSON are unchanged.

### 2026-07-18: Add Build Week Calibration Continuity And GPT-5.6 Retry

**Decision:** Add completed-session history and repeat-calibration continuity to the existing Open Loops Business DNA flow. A participant may start a new uniquely identified Version 1.3 session while every prior session remains preserved and selectable. When the original completed result used deterministic fallback, the participant may request a GPT-5.6 retry. The retry accepts only the saved session ID from the browser, rebuilds the exact twelve-answer evidence package on the authenticated server, and stores its AI-assisted or failed-with-fallback result as a separate generation attempt. It does not overwrite the source session, participant answers, original generated model, feedback, or Initial Business DNA Record. Participant-facing generation states and errors use fixed redacted language.

**Rationale:** Build Week needs a complete repeat-use and recovery loop without weakening Version 1.3 source control, historical integrity, ownership enforcement, or provider secrecy. Separate attempts make AI recovery useful while preserving the deterministic result as an auditable original and keeping Business DNA inside the existing Open Loops architecture.

**Affected Files:**

- [src/App.tsx](src/App.tsx)
- [src/screens/BusinessCalibration.tsx](src/screens/BusinessCalibration.tsx)
- [src/storage/calibrationApi.ts](src/storage/calibrationApi.ts)
- [src/domain/calibrations/calibrationSession.ts](src/domain/calibrations/calibrationSession.ts)
- [src/domain/models.ts](src/domain/models.ts)
- [server/api.mjs](server/api.mjs)
- [server/database.mjs](server/database.mjs)
- [server/generationService.mjs](server/generationService.mjs)
- [server/backend.test.mjs](server/backend.test.mjs)
- [server/clientRecovery.test.mjs](server/clientRecovery.test.mjs)
- [Business DNA/README.md](Business%20DNA/README.md)
- [Business DNA/calibrations/small-business-owner/PILOT_READINESS.md](Business%20DNA/calibrations/small-business-owner/PILOT_READINESS.md)
- [DATA_MODEL.md](DATA_MODEL.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Keep provider activation, credentials, data terms, and paid usage subject to Tony's separate approval. Record any proposed calibration wording or rule changes only as Version 1.4 proposals; the frozen Version 1.3 Markdown and JSON remain unchanged.

### 2026-07-17: Establish Controlled Version 1.3 Pilot Readiness Controls

**Decision:** Prepare—but do not publicly deploy—the Small Business Owner Initial Calibration Version 1.3 for a controlled pilot. Preserve the vendor-neutral authentication and model boundaries; fail production startup until an approved external identity adapter is installed; retain deterministic fallback; add backup, restore verification, participant export, confirmed deletion, redacted operational logging, health checks, and separate reviewer evaluations; and use manual tester, technical, and pilot-operation checklists. No identity vendor, deployment platform, commercial model, retention period, or paid usage is approved by this decision.

**Rationale:** A small real-user pilot needs recoverability, participant data rights, operational discipline, explicit provenance, and repeatable acceptance evidence before enrollment. Keeping vendor decisions open prevents readiness work from silently committing the product to unapproved infrastructure or data-processing terms.

**Affected Files:**

- [Business DNA/calibrations/small-business-owner/PILOT_READINESS.md](Business%20DNA/calibrations/small-business-owner/PILOT_READINESS.md)
- [Business DNA/calibrations/small-business-owner/PILOT_ACCEPTANCE_TEST.md](Business%20DNA/calibrations/small-business-owner/PILOT_ACCEPTANCE_TEST.md)
- [Business DNA/calibrations/small-business-owner/PILOT_OPERATIONS.md](Business%20DNA/calibrations/small-business-owner/PILOT_OPERATIONS.md)
- [server/auth.mjs](server/auth.mjs)
- [server/config.mjs](server/config.mjs)
- [server/database.mjs](server/database.mjs)
- [server/evaluationHarness.mjs](server/evaluationHarness.mjs)
- [server/pilotOperations.mjs](server/pilotOperations.mjs)
- [server/productionReadiness.test.mjs](server/productionReadiness.test.mjs)
- [DATA_MODEL.md](DATA_MODEL.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Tony must approve the identity provider/sign-in method, deployment platform/domain, live provider/model and data terms, retention/deletion policy, pilot size, incident owner, and backup destination before enrollment. Recommended defaults are documented as recommendations, not approvals.

### 2026-07-17: Add Secure Calibration Generation And Durable Owner-Scoped Storage

**Decision:** Implement the Small Business Owner Initial Calibration backend as a co-located Node HTTP API within Open Loops. Use SQLite as the minimum durable single-instance Version 1 store, an injectable authentication boundary with encrypted authenticated HttpOnly development sessions, and a vendor-neutral configured HTTP model-provider adapter. The generation endpoint accepts only an exact canonical current-session evidence package, uses the existing validation-and-retry pipeline, and preserves deterministic fallback. Completed sessions and their initial provisional Business DNA records are immutable. Canonical local sessions migrate only after authentication, are deduplicated, retain migration provenance, and remain recoverable in local storage.

**Rationale:** The vertical slice needs durable ownership, secure server-only credentials, context isolation, recoverability, and a permanent historical starting model without creating a parallel Business DNA application or adding enterprise infrastructure before the deployment platform and production identity provider are approved.

**Affected Files:**

- [server/README.md](server/README.md)
- [server/api.mjs](server/api.mjs)
- [server/auth.mjs](server/auth.mjs)
- [server/database.mjs](server/database.mjs)
- [server/generationService.mjs](server/generationService.mjs)
- [server/modelProvider.mjs](server/modelProvider.mjs)
- [server/backend.test.mjs](server/backend.test.mjs)
- [src/storage/calibrationApi.ts](src/storage/calibrationApi.ts)
- [src/App.tsx](src/App.tsx)
- [src/domain/models.ts](src/domain/models.ts)
- [DATA_MODEL.md](DATA_MODEL.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [Business DNA/README.md](Business%20DNA/README.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Approve a production deployment platform and identity provider before production release. Keep SQLite for a persistent single instance; use hosted PostgreSQL behind the same adapter if deployment becomes multi-instance or serverless. Configure only an approved server-side structured-output provider.

### 2026-07-17: Add The Evidence-Constrained AI Generation Boundary

**Decision:** Add a provider-neutral, AI-assisted generation pipeline for the Small Business Owner Initial Calibration while preserving the deterministic generator as the tested fallback. The pipeline builds a current-session-only evidence package, supplies canonical Version 1.3 generation instructions and a structured schema, validates evidence IDs, quotes, classifications, section identity, confidence, safety, and experiment completeness, retries once with correction errors, and falls back after a second failure. Generation provenance and any validated original structured output are stored with the calibration session.

**Rationale:** Participant-specific model generation requires more reasoning flexibility than fixed templates, but it must not weaken context isolation, evidence discipline, safety, version protection, or recoverability. A provider boundary allows a future secure server implementation without coupling the calibration domain to a vendor or exposing credentials in the React client.

**Affected Files:**

- [src/domain/calibrations/aiModelGenerationPipeline.ts](src/domain/calibrations/aiModelGenerationPipeline.ts)
- [src/domain/calibrations/aiModelGenerationPipeline.test.mjs](src/domain/calibrations/aiModelGenerationPipeline.test.mjs)
- [src/domain/calibrations/generateInitialBusinessModel.ts](src/domain/calibrations/generateInitialBusinessModel.ts)
- [src/domain/models.ts](src/domain/models.ts)
- [src/storage/prototypeStorage.ts](src/storage/prototypeStorage.ts)
- [src/App.tsx](src/App.tsx)
- [src/screens/BusinessCalibration.tsx](src/screens/BusinessCalibration.tsx)
- [DATA_MODEL.md](DATA_MODEL.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [MVP_TASKS.md](MVP_TASKS.md)
- [package.json](package.json)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Implement a secure server-side provider adapter before enabling live AI-assisted generation. Semantic entailment of arbitrary business claims remains a prototype limitation even though every major conclusion must carry valid current-session evidence references.

### 2026-07-17: Audit And Harden The Version 1.3 Prototype Model Generator

**Decision:** Keep the Initial Business Owner Model generator deterministic and current-session-only for the prototype, while tightening its evidence and safety discipline. Empty answers no longer count as evidence, fewer than two meaningful supporting answers produces low confidence, sustainability and owner energy remain visible alternative constraints, avoided work is not selected as the root constraint, and healthcare-related answers cannot become clinical or medical action recommendations. The canonical Version 1.3 specification and JSON remain unchanged.

**Rationale:** The vertical slice needs reproducible prototype behavior without pretending that templates perform semantic business diagnosis. Narrow safeguards make limitations explicit, preserve evidence, and prevent sparse or healthcare-related inputs from producing misleading confidence or consequential advice.

**Affected Files:**

- [src/domain/calibrations/generateInitialBusinessModel.ts](src/domain/calibrations/generateInitialBusinessModel.ts)
- [src/domain/calibrations/generateInitialBusinessModel.test.mjs](src/domain/calibrations/generateInitialBusinessModel.test.mjs)
- [package.json](package.json)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Treat semantic contradiction detection, inference classification, evidence independence beyond distinct question IDs, participant-specific alternative ranking, and any AI-assisted generation as prototype limitations requiring separate review before production use.

### 2026-07-17: Implement The Complete Local Version 1.3 Calibration Loop

**Decision:** Implement the approved Small Business Owner Initial Calibration Version 1.3 inside the existing Open Loops prototype. The Home screen can start or resume a calibration; the application asks the 12 canonical JSON-backed questions one at a time, saves each answer, generates and preserves a conservative ten-section initial model, stores evidence references, confidence, unknowns, and a seven-day experiment, collects all canonical participant feedback one item at a time, and preserves the completed session with its exact calibration identity and frozen source hash.

**Rationale:** The approved calibration needs a complete, testable product loop without creating a separate Business DNA application or silently introducing a new model dependency. Incremental persistence protects continuity, while JSON-driven content and validation prevent Version 1.3 wording drift.

**Affected Files:**

- [src/App.tsx](src/App.tsx)
- [src/data/seed.ts](src/data/seed.ts)
- [src/domain/models.ts](src/domain/models.ts)
- [src/domain/calibrations/smallBusinessOwnerCalibration.ts](src/domain/calibrations/smallBusinessOwnerCalibration.ts)
- [src/domain/calibrations/generateInitialBusinessModel.ts](src/domain/calibrations/generateInitialBusinessModel.ts)
- [src/domain/calibrations/calibrationSession.ts](src/domain/calibrations/calibrationSession.ts)
- [src/domain/calibrations/calibrationSession.test.mjs](src/domain/calibrations/calibrationSession.test.mjs)
- [src/screens/BusinessCalibration.tsx](src/screens/BusinessCalibration.tsx)
- [src/storage/prototypeStorage.ts](src/storage/prototypeStorage.ts)
- [src/styles.css](src/styles.css)
- [DATA_MODEL.md](DATA_MODEL.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [MVP_TASKS.md](MVP_TASKS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Exercise the flow with pilot participants. Record any proposed calibration changes in the Version 1.4 proposals document. Replace the conservative local model generator only through a separately approved model-integration decision.

### 2026-07-17: Freeze Version 1.3 Authority And Define Its Application Contract

**Decision:** Treat `small_business_owner_initial_calibration@1.3.0` as the sole authoritative Small Business Owner Initial Calibration. Application code must load its onboarding questions and output definition from the canonical `v1.3.json` through a shared Open Loops domain adapter rather than duplicating wording in UI components or prompts. Every calibration session must preserve the calibration ID, semantic version, frozen source hash, participant responses, generated initial model, evidence references, confidence level, unknowns, proposed experiment, and participant feedback. Earlier or later-discovered drafts are historical only unless Tony explicitly approves a new version.

**Rationale:** A single immutable source prevents wording drift and competing prompts. A durable shared session contract keeps Business DNA inside the existing Open Loops memory and storage architecture while preserving evidence, uncertainty, participant feedback, historical outputs, and exact version attribution.

**Affected Files:**

- [Business DNA/AGENTS.md](Business%20DNA/AGENTS.md)
- [Business DNA/README.md](Business%20DNA/README.md)
- [Business DNA/calibrations/small-business-owner/README.md](Business%20DNA/calibrations/small-business-owner/README.md)
- [Business DNA/calibrations/small-business-owner/CALIBRATION_V1_4_PROPOSALS.md](Business%20DNA/calibrations/small-business-owner/CALIBRATION_V1_4_PROPOSALS.md)
- [Business DNA/calibrations/small-business-owner/v1.3.test.mjs](Business%20DNA/calibrations/small-business-owner/v1.3.test.mjs)
- [src/domain/calibrations/smallBusinessOwnerCalibration.ts](src/domain/calibrations/smallBusinessOwnerCalibration.ts)
- [src/domain/models.ts](src/domain/models.ts)
- [src/storage/prototypeStorage.ts](src/storage/prototypeStorage.ts)
- [src/App.tsx](src/App.tsx)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Build the calibration UI from the shared JSON-backed adapter. Record proposed wording, ordering, schema, evidence, interpretation, feedback, or experiment changes in the Version 1.4 proposals document for separate founder review; do not alter Version 1.3 during implementation.

### 2026-07-17: Approve Business DNA Working Direction And Initial Calibration

**Decision:** Approve Business DNA as the business-oriented application of Open Loops, subordinate to the parent system and governed by [Business DNA/AGENTS.md](Business%20DNA/AGENTS.md). Approve the Small Business Owner Initial Calibration as its first capability and authorize the minimum Version 1 infrastructure needed to run the 12-question flow, preserve answers and the original evidence-based model, record confidence and competing explanations, create one seven-day experiment, collect participant feedback, and evolve Business DNA through continuing interaction. The canonical calibration identifier is `small_business_owner_initial_calibration@1.3.0`.

**Rationale:** Business understanding should accumulate durably and inspectably rather than depend on model memory or one-time diagnosis. Business DNA extends the Open Loops approach to recurring business patterns, unresolved decisions, opportunities, constraints, owner behavior, and sustainable growth while preserving evidence, uncertainty, historical versions, and alignment with the business's longer-term true north.

**Affected Files:**

- [Business DNA/README.md](Business%20DNA/README.md)
- [Business DNA/AGENTS.md](Business%20DNA/AGENTS.md)
- [Business DNA/calibrations/small-business-owner/README.md](Business%20DNA/calibrations/small-business-owner/README.md)
- [Business DNA/calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md](Business%20DNA/calibrations/small-business-owner/SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md)
- [Business DNA/calibrations/small-business-owner/v1.3.json](Business%20DNA/calibrations/small-business-owner/v1.3.json)
- [Business DNA/calibrations/small-business-owner/v1.3.test.mjs](Business%20DNA/calibrations/small-business-owner/v1.3.test.mjs)
- [package.json](package.json)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Supersedes:** The undefined-placeholder scope recorded when the Business DNA sub-project was established earlier on 2026-07-17. The original creation decision remains part of the historical record.

**Follow-Up:** The founder-approved Version 1.3 specification, derived JSON definition, and automated validation tests were memorialized on 2026-07-17. Application implementation should consume these canonical artifacts through the existing Open Loops architecture and preserve exact session-version attribution, context isolation, original outputs, later evidence, and historical revisions.

### 2026-07-17: Establish Business DNA As An Open Loops Sub-Project

**Decision:** Create `Business DNA` as a named sub-project within the Open Loops repository, with a canonical overview and local working instructions. The name and placement are established; its product definition, audience, scope, architecture, and implementation remain unresolved.

**Rationale:** A dedicated workspace gives Business DNA a durable home for exploration and future decisions while protecting the approved Open Loops product and Version 1 scope from accidental expansion.

**Affected Files:**

- [Business DNA/README.md](Business%20DNA/README.md)
- [Business DNA/AGENTS.md](Business%20DNA/AGENTS.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Define the problem, primary user, relationship to Open Loops, project type, and smallest testable first version before adding product or implementation structure.

### 2026-07-09: Approve ChatGPT Coordination Brief

**Decision:** Approved [OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md](OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md) as the operating guide for ChatGPT/founder/Codex coordination. The brief defines the separation between exploration, proposed direction, approved decisions, and Codex-ready handoffs. It also preserves the role split between ChatGPT as a product reasoning and handoff partner and Codex as the repo, documentation, and implementation agent.

**Rationale:** Open Loops has accumulated significant product, UX, and implementation context. The coordination brief protects continuity by preventing exploratory ideas from becoming accidental product commitments, reinforcing the product principle that Open Loops organizes thinking rather than information, and giving future conversations a clear handoff protocol.

**Affected Files:**

- [OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md](OPEN_LOOPS_CHATGPT_COORDINATION_BRIEF.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Decide whether future ChatGPT conversations should use the brief as a standing system prompt. Decide whether to create a shorter one-page founder handoff version.

### 2026-07-05: Treat Chat with Lumi as True Conversational Mode

**Decision:** Chat with Lumi must be treated as a true conversational mode, distinct from Enter a Thought. Enter a Thought is quick dated capture for thoughts, memories, questions, feelings, ideas, reflections, or possible Open Loops. Chat with Lumi opens or continues a Chat Session, stores ordered Chat Messages, preserves active-session context, and must eventually support contextual follow-up questions and non-repetitive Lumi responses.

**Rationale:** Open Loops needs both lightweight journaling-style capture and deeper conversational reflection. If Chat with Lumi is implemented as disconnected thought capture, the product cannot earn conversational continuity, interpret follow-ups, or later connect chat sessions cleanly to Open Loops, recurring themes, prior thoughts, and prior chats.

**Affected Files:**

- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [DATA_MODEL.md](DATA_MODEL.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [MVP_TASKS.md](MVP_TASKS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future Lumi milestones should keep this distinction visible in their implementation plans. Do not implement full Lumi intelligence until explicitly scoped, but preserve data and component boundaries for Chat Sessions, ordered Chat Messages, session context, follow-up interpretation, and later Open Loop connections.

### 2026-07-03: Version UX Vision Artifacts

**Decision:** The current Home Screen visual direction will be preserved as **Open Loops UX Vision 0.1**. Meaningful future design leaps should create new visual versions such as `UX Vision 0.2`, `UX Vision 0.3`, and eventually `UX Vision 1.0`.

**Rationale:** The constellation interface is a milestone in the product's evolution: the moment Open Loops began to become its own category rather than simply being interpreted as an AI app. Versioning UX artifacts preserves the visual history of that evolution and prevents future refinements from erasing important design lineage.

**Affected Files:**

- [UX.md](UX.md)
- [UI_REFERENCE/UX_VISION_HISTORY.md](UI_REFERENCE/UX_VISION_HISTORY.md)
- [UI_REFERENCE/UX_Vision_0.1.png](UI_REFERENCE/UX_Vision_0.1.png)
- [UI_REFERENCE/UX_Vision_0.1_annotated.svg](UI_REFERENCE/UX_Vision_0.1_annotated.svg)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Do not overwrite historical UX Vision artifacts. When the product makes a meaningful design leap, add a new versioned visual reference and update the UX Vision History.

### 2026-07-03: Preserve UX Philosophy Over Pixel-Perfect Mockup Reproduction

**Decision:** The Home Screen mockup should not be reproduced pixel-for-pixel. It is a design direction, not a finished visual design. Implementations should preserve the philosophy behind the layout: organic, calm, spacious, alive, visually clear, and technically practical.

**Rationale:** Treating the mockup as a literal artifact would risk overfitting to one static image instead of building a usable product. The mockup should align teams around interaction model, hierarchy, tone, and product philosophy while still allowing practical implementation decisions.

**Affected Files:**

- [UX.md](UX.md)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future UI implementation work should cite the mockup for intent and hierarchy, not exact pixels, unless a later approved design spec explicitly requires pixel-level fidelity.

### 2026-07-03: Add Annotated HomeScreen v1 UX Reference

**Decision:** Open Loops will maintain an annotated version of the canonical Home Screen mockup at `UI_REFERENCE/HomeScreen_v1_annotated.svg`, with numbered callouts explaining the purpose behind Lumi, Talk to Lumi, the bubble workspace, the insight card, and navigation.

**Rationale:** The unannotated mockup shows what the MVP should feel like. The annotated reference explains why the key elements exist, reducing ambiguity for engineers, designers, and AI coding agents when translating the visual direction into implementation.

**Affected Files:**

- [UX.md](UX.md)
- [UI_REFERENCE/HomeScreen_v1_annotated.svg](UI_REFERENCE/HomeScreen_v1_annotated.svg)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future UI reference updates should include both visual changes and updated annotations when the rationale changes.

### 2026-07-02: Approve HomeScreen v1 As Canonical MVP UX Reference

**Decision:** `UI_REFERENCE/HomeScreen_v1.png` is the official Version 1 UX reference for the Open Loops MVP. It is a design north star, not pixel-perfect artwork. Future implementations should preserve the underlying interaction model, visual hierarchy, and philosophy unless intentionally revised.

**Rationale:** Engineers, designers, and AI coding agents may interpret prose differently, but a shared visual reference communicates dozens of UX decisions more consistently. The mockup anchors the MVP around Lumi, Talk to Lumi, Open Loops as bubbles, connection insights, recent thoughts, Open Loop spotlight, and the Home / Loops / Lumi / Universe / Me navigation model.

**Affected Files:**

- [PRODUCT_VISION.md](PRODUCT_VISION.md)
- [UX.md](UX.md)
- [UI_REFERENCE/HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [DATA_MODEL.md](DATA_MODEL.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [MVP_TASKS.md](MVP_TASKS.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future UX refinements should update the reference image or notes deliberately and add a new decision entry when the canonical direction changes.

### 2026-07-02: Add MVP Vision And Product Direction To Core Structure

**Decision:** Open Loops will enter the market as the most intuitive and visually beautiful way to capture, organize, and evolve thoughts, while preserving the long-term vision of becoming a Universal Emotional Translator.

**Rationale:** The MVP should not lead with the deepest long-term AI capabilities. It should first prove that Open Loops helps people think by capturing thoughts, connecting ideas, and gradually discovering patterns. The AI relationship should develop naturally from that foundation.

**Approved Direction:**

- Open Loops is not another AI chatbot, journaling app, note-taking app, AI companion, AI journal, or therapy app.
- Open Loops organizes thinking, not information.
- Product positioning: the most beautiful way to capture and connect your thoughts.
- Version 1 should focus on authentication, Home Screen, Talk to Lumi, Capture Thought, Create Open Loop, Bubble Interface, List View, Add Thought to Existing Loop, Basic AI categorization, and persistent storage.
- Version 1 should not include Emotional DNA, Relationship Translation, or advanced analytics.
- Lumi is a glowing thought bubble wearing headphones, symbolizing listening, consciousness, curiosity, thoughts, and imagination.
- Open Loops replace traditional journal entries with evolving subjects that accumulate conversations, voice notes, thoughts, observations, and AI insights.
- The bubble interface is a defining innovation and should resemble constellations or molecules rather than folders.
- The Home screen should remain simple: Lumi greeting, Talk to Lumi, one personalized insight, one Open Loop spotlight, and minimal navigation.
- Navigation direction: Home, Loops, Lumi, Universe, Me.
- Universe is a reflective, zoomed-out perspective for life themes, patterns, growth, and eventually Emotional DNA.
- Lumi should use curiosity-first language and avoid sounding overly authoritative.
- Progressive feature discovery should mature alongside the user.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Keep Emotional DNA and Relationship Translation visible as long-term direction, but out of Version 1 until the core thought-capture and Open Loop foundation is validated.

### 2026-07-01: Define Open Loops Product Draft v1.0

**Decision:** `OPEN_LOOPS_PRODUCT.md` was updated to Draft v1.0, owned by Founder / Product, defining Open Loops as a personal understanding platform with a core experience built around journaling, reflection, discovery, and understanding.

**Rationale:** The product document now clarifies the customer experience and core product philosophy for Version 1: accumulated understanding creates extraordinary value, the product should grow through conversation, Premium should preserve continuity, and the experience should remain focused on curiosity, reflection, growth, trust, and simplicity.

**Affected Files:**

- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Related user journey, Emotional DNA, roadmap, technical, and investor documents should remain aligned with this product definition as they are updated.

### 2026-07-01: Add Open Questions And Version 1 Boundaries To Every Document

**Decision:** Every Open Loops markdown document will end with `Open Questions` and `Version 1 Boundaries`.

**Rationale:** These sections preserve unresolved ideas without allowing them to distract from Version 1. They make intentional uncertainty visible while protecting the project from scope creep.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future documentation updates should keep these two sections as the final sections of every project markdown file.

### 2026-07-01: Define Open Loops Vision Draft v1.0

**Decision:** `OPEN_LOOPS_VISION.md` was updated to Draft v1.0, owned by the Founder, defining the long-term vision, mission, problem framing, belief system, solution direction, core principles, user journey, and long-term ambition for Open Loops.

**Rationale:** The project needs a coherent vision document that anchors future product, design, technical, and business decisions around human understanding, curiosity before certainty, accumulated understanding, trust, simplicity, and technology in service of human relationships.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Related product, Emotional DNA, journey, roadmap, investor, and technical documents should continue to align with this vision as they are updated.

### 2026-07-01: Decision Log 001 - Foundational Company And Product Direction

**Decision:** Open Loops approved its foundational company and product direction, including the company name, official tagline, mission, brand philosophy, product vision, customer journey, product hook, Emotional DNA direction, premium strategy, discovery phase, business philosophy, competitive advantage, branding direction, documentation strategy, development workflow, and Version 1 guiding principle.

**Rationale:** This session marked the transition of Open Loops from a conceptual idea into the foundation of a product company. The focus shifted away from brainstorming individual features toward establishing the permanent architecture, philosophy, branding, monetization strategy, and development workflow that will guide Version 1.

**Approved Decisions:**

- Company name: Open Loops.
- Official tagline: Understanding Begins Here.
- Mission: Open Loops exists to help people better understand themselves and each other.
- Mission boundary: The mission is not to make people agree. The mission is to help people understand.
- Brand philosophy: Open Loops is not positioned as an AI company. AI is the enabling technology. Understanding is the product.
- Product vision: The application is designed to become increasingly valuable as it learns the individual over time.
- Product concept: Open Loops is currently envisioned as the world's first Universal Emotional Translator through the development of Emotional DNA and long-term relationship memory.
- Customer journey: Journal, Reflection, Pattern Recognition, Emotional DNA Development, Self Understanding, Perspective Translation, Relationship Understanding.
- Product hook: Come for the journal. Stay for the understanding. Change through the translation.
- Entry strategy: Journaling is the primary customer acquisition strategy because it is already familiar behavior for millions of people.
- Emotional DNA: Emotional DNA remains the foundational technology behind Open Loops.
- Emotional model behavior: Confidence should increase only through accumulated interactions; the application should prefer curiosity over certainty; questions should become progressively more confident as understanding improves.
- Premium strategy: Premium is not based on smarter AI. Premium is based on continuity.
- Premium value: Subscription value comes from long-term memory, Emotional DNA growth, relationship history, pattern recognition over time, life timeline, and accumulated understanding.
- Discovery phase: The application should first earn trust before asking users to subscribe.
- Business philosophy: Understanding is not purchased. It is built.
- Competitive moat: The moat consists of Emotional DNA, long-term relationship memory, accumulated personal understanding, trust, proprietary methods, and historical context developed over years.
- Branding direction: The logo direction is two open loops, two perspectives, connection through translation, curiosity before certainty, and clean timeless design.
- Branding boundary: Avoid visual references that make the company appear to be exclusively a journaling application; the journal is a product feature rather than the company's visual identity.
- Documentation strategy: Open Loops will be developed using permanent Markdown documentation.
- Development workflow: ChatGPT supports product vision, strategy, UX philosophy, branding, business model, founder discussions, and architecture decisions. Codex maintains documentation, updates Markdown files, implements architecture, builds software, and maintains the codebase.
- Version 1 guiding principle: The objective of Version 1 is not to build every envisioned capability. The objective is to create an application that causes a user to say, "This app understands me better than anything I've ever used."

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Continue to update the appropriate project document and this decisions log whenever a product, design, technical, documentation, or business decision is finalized.

### 2026-07-01: Initialize Documentation Framework

**Decision:** Open Loops will use a structured markdown documentation system with defined purposes, status metadata, placeholders, cross references, and a permanent decisions log.

**Rationale:** The project needs a disciplined knowledge system where each insight has a home, every approved decision is recorded, and future conversations can move the project forward without repeatedly redesigning settled ideas.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future finalized decisions should update both the appropriate project document and this decisions log.

### 2026-07-01: Define AGENTS.md As The Open Loops Constitution

**Decision:** `AGENTS.md` will define the project mission, documentation workflow, coding philosophy, development workflow, and instructions for maintaining documentation when decisions are finalized.

**Rationale:** Future Codex conversations need a shared operating constitution so documentation and implementation work remain aligned with the project's mission and decision history.

**Affected Files:**

- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future Open Loops work should review `AGENTS.md` before making documentation or implementation changes.

### 2026-07-01: Establish Document Status Metadata

**Decision:** Every Open Loops markdown file will begin with `Status`, `Last Updated`, and `Owner`.

**Rationale:** Status metadata clarifies whether a document is draft or approved, who owns it, and when it last changed.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** When a document is approved, update its `Status` to `Approved` only when explicitly requested.

## Related Documents

- [Open Loops Vision](OPEN_LOOPS_VISION.md)
- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [User Journey](USER_JOURNEY.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Investor Pitch](INVESTOR_PITCH.md)
- [Open Loops Constitution](AGENTS.md)

## Open Questions

- TBD

## Version 1 Boundaries

- TBD
