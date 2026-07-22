# Technical Architecture

Status: Draft
Last Updated: 2026-07-22
Owner: TBD

## Purpose

Document the technical architecture of Open Loops, including system boundaries, data structures, infrastructure, integrations, and engineering decisions.

## Document Use

Use this file for technical decisions and architecture placeholders. Do not choose technologies, vendors, or implementation patterns here until they are explicitly approved.

## Architecture Summary

The MVP architecture should support thought capture, Open Loop creation, a Lumi conversation surface, a bubble-based loop workspace, basic AI categorization, and persistent storage.

The Home Screen implementation should align with [HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png) as the canonical Version 1 UX reference.

Business DNA remains an organizational sub-project, not a parallel technical system. Its approved Small Business Owner Initial Calibration uses the existing Open Loops React application, domain model, authenticated API, durable storage adapter, and Lumi-facing interaction patterns.

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
- Business DNA Calibration

### Single-Service Production Runtime

The production runtime builds the Vite frontend and serves `dist`, extensionless SPA fallback routes, and the existing `/api` through one Node 22 HTTP service and one public origin. The server binds the validated `HOST` and `PORT`. `GET /api/health` returns only `{"status":"ok"}`. Hashed `/assets` responses may be cached immutably; the HTML shell uses `no-cache`.

The Docker build excludes Git metadata, dependencies, local build output, environment files, SQLite databases and journals, backups, participant exports, and local package caches from its context. Its runtime contains the built frontend plus only the server and calibration-domain sources required by the existing server-side TypeScript loader. Production SQLite uses an absolute `OPEN_LOOPS_DATABASE_PATH` on a mounted volume and remains limited to a single service instance.

Production authentication fails closed behind a trusted identity-aware reverse proxy. The proxy authenticates the participant, strips inbound identity headers, and injects a stable user ID and server-only proxy secret over a private upstream connection. The Node service validates both on every protected request. Direct anonymous requests and spoofed user headers are rejected, development login is disabled, and no insecure public bypass exists. Choosing and configuring the public proxy remains an operator decision.

## Core Components

- Authentication
- Thought capture
- Open Loop management
- Lumi conversation mode
- Bubble workspace
- List view
- Basic AI categorization
- Persistent storage
- JSON-backed calibration flow and durable calibration sessions

## Data Model

The core model should support thoughts, Open Loops, conversations, voice notes or uploaded inputs, observations, AI insights, loop connections, and lifecycle state.

### Thought Capture And Lumi Conversation Separation

The architecture should preserve a clear boundary between quick thought capture and Lumi conversation.

Enter a Thought creates dated Thought records. A Thought can later become or connect to Open Loops, themes, chat sessions, or other thoughts, but it does not require a conversational Lumi response.

Chat with Lumi opens or continues a Chat Session and stores ordered Chat Messages. The active Chat Session must preserve conversational continuity so future Lumi responses can use prior messages in that same session.

Future Lumi milestones should support follow-up questions based on session context, avoid disconnected one-off treatment of every message, and avoid simply repeating prior responses.

Chat Sessions should later be able to connect to one or more Open Loops without being reduced to standalone Thought records.

## Storage

The calibration vertical slice uses a co-located Node HTTP API and SQLite through the built-in `node:sqlite` driver. Every query is scoped by authenticated user ID. SQLite is the minimum durable single-instance Version 1 store; a multi-instance or serverless deployment requires hosted PostgreSQL behind the same storage contract.

`localStorage` remains a recoverable client cache. After authentication, canonical local Version 1.3 sessions are validated, uploaded transactionally, deduplicated by a stable import fingerprint, marked with migration provenance, and retained locally. Backend state becomes authoritative after confirmed persistence.

Calibration Sessions live in that same state and are saved after every answer, generated model, feedback response, and completion event. Each session records the exact calibration identifier, semantic version, and frozen source hash used.

Pure domain lifecycle functions enforce ordered answers, explicit status transitions, ordered feedback, completion, and deterministic selection of an incomplete or completed session when the user returns. Storage normalization keeps earlier prototype records readable without changing canonical calibration content.

The Home surface derives its Business DNA continuity card from the same reconciled `CalibrationSession[]` state. A pure dashboard selector prioritizes unfinished work, calculates onboarding or Version 1.4 feedback progress, and otherwise reopens the newest saved profile. It does not create a second session index, summary record, or source of truth.

### Calibration Source Of Truth

The application imports `Business DNA/calibrations/small-business-owner/v1.3.json` through `src/domain/calibrations/smallBusinessOwnerCalibration.ts`.

UI components and generation code must read canonical questions and output-section titles from that adapter. They must not duplicate Version 1.3 wording. Automated tests compare the JSON to the frozen Markdown source and reject duplicated UI wording or unlabelled competing prompts.

### AI-Assisted Calibration Generation Boundary

The calibration domain constructs a current-session-only evidence package, combines it with canonical Version 1.3 generation instructions, requests provider-neutral structured output, validates that output, retries once with validation errors, and falls back deterministically after a second failure.

The React client contains no provider secret and makes no direct vendor call. `CalibrationModelProvider` is the vendor-neutral boundary. The server provides a configurable HTTP adapter for an approved structured-output model endpoint. When it is unavailable or unconfigured, the deterministic generator remains the functioning runtime path.

The `/api/calibrations/generate` route accepts only the canonical evidence package, rebuilds it from its twelve answers, rejects any mismatch or added context, loads canonical instructions server-side, invokes the configured provider, runs the existing validator, retries once, and returns validated output or deterministic fallback with provenance. It does not add prior chats, account memory, other Business DNA records, outside research, or unrelated metadata.

For a completed deterministic-fallback session, `/api/calibration-sessions/:id/retry-generation` accepts no participant evidence from the browser. It restores the authenticated owner's session, rebuilds the exact twelve-answer evidence package server-side, and stores each validated AI result or repeated fallback as a separate generation-attempt record. The source session, original model, and Initial Business DNA Record remain immutable. The client exposes only fixed connecting, success, fallback, and redacted-error states.

Generation attempts are append-only server-owned records, not mutable fields in the completed session row. The retry endpoint persists its successful or failed result directly; it does not depend on a later browser `PUT`. Session reads join every attempt in descending creation order, with insertion order as the deterministic tie-breaker, so browser refresh, authentication-service recreation, and database-process restart preserve the complete retry history. The result screen selects the newest successful AI-assisted attempt while retaining later or earlier failed attempts and their safe diagnostics.

`generationAttempts` is a session read model on the client. Local-storage normalization preserves it, and local/server reconciliation unions attempts by immutable attempt ID while treating the server's completed-session base as authoritative. Session write fingerprints exclude attempts. The synchronization effect sends only base sessions whose writable data changed, preventing retry responses—or changes to unrelated sessions—from issuing invalid overwrites against immutable completed sessions.

If the browser loses, rejects, or cannot parse the retry POST response, the client performs an authenticated read-back of that session and accepts only an attempt ID that did not exist when the retry began. This recovers a result already committed by the append-only server endpoint without replaying generation or mutating the completed source session. If no new attempt exists, the UI exits connecting into a request-failed state rather than incorrectly claiming that GPT-5.6 was unreachable. Unexpected API errors emit and return only stable route/status/error codes; exception text, prompts, answers, provider bodies, and credentials remain excluded.

July 18, 2026 live testing identified that a fixed forty-five-second provider timeout, repeated across the pipeline's two protected attempts, caused a consistent ninety-second fallback even though direct Responses API tests completed with the configured GPT-5.6 models. Provider adapters now receive the validated `MODEL_PROVIDER_TIMEOUT_MS` setting, defaulting to 180,000 milliseconds per attempt for the full ten-section strict structured result. The accepted range is 30,000–600,000 milliseconds. Model selection remains exclusively configurable through `MODEL_IDENTIFIER`.

Provider aborts and timeouts are normalized before they enter provenance: timeout output records the safe `provider_timeout` category and a fixed validation message, while other exceptions record `provider_failure`. Exception text, credentials, prompts, answers, and response bodies are not returned to the participant. The browser request has its own bounded guard longer than the maximum two-attempt server window, and its completion state machine always leaves connecting after AI success, deterministic fallback, provider timeout, client timeout, or network rejection.

The July 18, 2026 live quality tests also showed that technically valid output could leak calibration scaffolding or internal evaluation rationale into participant-facing sections. Generation instruction version `small_business_owner_v1.3_ai_generation@1.1.2` maintains the participant-facing narrative contract without changing the frozen calibration definition. It preserves all ten canonical IDs, titles, and order; keeps evidence references in structured fields; requires the identity-to-continuation narrative sequence; and prohibits internal titles, narrator labels, metadata, isolation confirmations, question/evidence identifiers, raw fields, prompt text, answer dumps, confidence-report language, and validation or evaluation rationale in section bodies. Uncertainty remains explicit in structured records and is expressed naturally in participant prose.

Narrative validation runs alongside the existing evidence and safety validator. It rejects prohibited boilerplate, excessive or undeclared verbatim answer reuse, repeated sections or sentences, generic praise, unsupported certainty, consultant-report language, and overly long section bodies. A validation failure follows the existing correction retry and deterministic fallback path, with the instruction version retained in provenance.

The `@1.1.1` rendering override resolves a live mismatch in `@1.1.0`: frozen sections 4, 5, and 7 demonstrated labeled structures after the narrative contract had prohibited labels. Their semantic requirements now render as prose, and the full section-7 experiment remains in its dedicated structured field. Validator label rules match actual headings rather than arbitrary inline words.

The `@1.1.2` presentation layer conservatively deduplicates repeated unknowns and possible disconfirming explanations while retaining the first item verbatim, then renders those records as semantic lists. The generated and stored evidence structures remain separate from participant-facing section prose. Completed results show the ten canonical narrative sections first. Complete interpretation, answer, experiment, feedback, provenance, and diagnostic records remain accessible in collapsed native `details` disclosures under `Review details`; this is a read-presentation change, not deletion or mutation of source records.

Generation provenance retains a safe diagnostic for every provider pass: attempt number, accepted/validation/provider outcome, stable failure codes, and fixed validator messages. Server diagnostics log the same codes with provider/model/outcome metadata only. Participant answers and generated narrative are excluded. The UI maps `validation_failure` to a separate validation-rejected state rather than grouping it with connectivity failure or timeout.

## Authentication

The Version 1 API uses an injectable authentication boundary. Its local adapter issues encrypted, authenticated, opaque, HttpOnly, SameSite cookies that survive browser refresh and server restart. Development identity issuance is explicitly gated and cannot run in production. A production identity provider remains an approval and deployment decision; production must fail closed until that adapter or a trusted gateway identity is configured.

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

- All calibration and Business DNA reads and writes enforce ownership server-side.
- Request bodies are limited to 256 KiB and validated against the canonical identity and ordered response contract.
- Model credentials, instructions, and configuration remain server-side.
- Model output is schema- and evidence-validated; unsafe clinical advice is rejected.
- Completed sessions, original validated output, and initial Business DNA records are immutable.
- Error responses do not expose participant content, prompts, credentials, or provider responses.

## Observability

The API exposes a content-free health endpoint and structured operational events. Logging uses an explicit redaction boundary and records route templates, status, duration, startup, backup, and operational outcomes rather than participant answers, prompts, model output, cookies, authorization headers, or secrets. Pilot monitoring must cover health, restarts, 5xx responses, disk capacity, backup success, provider latency, validation retries, fallback rate, and authentication failures.

## Deployment

Required server configuration is documented in [server/README.md](server/README.md). Production requires persistent storage, TLS, a high-entropy session secret, an approved identity provider or gateway, and optional server-only model-provider credentials. The current server process is suitable for a single persistent instance, not ephemeral multi-instance hosting without a PostgreSQL adapter.

Production configuration validation requires an absolute database path, HTTPS public origin, external authentication mode, a 32-character-or-longer session secret, and complete model-provider configuration when enabled. The executable still fails closed until Tony approves and the project installs a production identity adapter.

## Engineering Constraints

- Do not introduce technologies, dependencies, services, or implementation patterns before they serve an approved need.
- TBD

## Technical Risks

- The production deployment platform and identity provider remain unapproved.
- SQLite assumes one persistent service instance; horizontal or serverless deployment needs hosted PostgreSQL.
- The configured provider must support the documented structured-output request contract.
- Evidence-reference validation is strong, but semantic entailment of arbitrary business claims remains a bounded model-quality risk.

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved technical decisions, including Decision Log 001 from July 1, 2026.

## Related Documents

- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [UX](UX.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Open Loops Constitution](AGENTS.md)
- [Business DNA](Business%20DNA/README.md)

## Open Questions

- Which production deployment platform, identity provider, and structured-output model endpoint should be approved?
- When should the SQLite adapter be replaced by hosted PostgreSQL?

## Version 1 Boundaries

- The approved calibration flow may use the configured secure provider, but must always retain validated deterministic fallback.
- Business DNA must inherit Open Loops architecture rather than introduce a parallel application or memory store.
