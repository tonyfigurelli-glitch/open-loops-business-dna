# Open Loops Business DNA — Devpost Submission Draft

Status: Final Content Draft
Last Updated: 2026-07-18
Owner: Tony Figurelli

## Purpose

Provide concise, evidence-based submission copy for the OpenAI Build Week entry without inventing users, metrics, testing outcomes, deployment status, or business impact.

## Project Name

Open Loops Business DNA

## One-Line Tagline

Turn twelve focused business-owner answers into a provisional, evidence-grounded operating model and one reversible seven-day experiment.

## Category

Work and productivity

## Short Summary

Business DNA helps a small-business owner see operating patterns that are hard to recognize from inside daily work. It transforms twelve structured answers into a ten-section Initial Business Owner Model, preserving supporting evidence, uncertainty, competing explanations, confidence, and exact participant language. The result is not presented as a final diagnosis. It is a versioned starting hypothesis paired with one small experiment that can produce better evidence.

## Inspiration

Small-business owners often receive advice that is broad, overly confident, or based on the most visible frustration. An avoided task can be mistaken for the root constraint. Founder involvement can be treated as automatically unhealthy. Growth can be recommended without considering profitability, sustainability, capacity, or the owner’s actual priorities.

Open Loops is built around understanding over certainty. Business DNA applies that principle to work: create a useful model, show what supports it, preserve what remains unknown, and learn through action instead of pretending the first interpretation is final.

## What It Does

The working vertical slice lets an owner:

- start or resume a Version 1.3 calibration;
- answer exactly twelve questions, one at a time, with immediate persistence;
- generate a ten-section Initial Business Owner Model;
- inspect a central hypothesis, supporting evidence, possible disconfirming evidence, confidence, unknowns, direct quotes, and competing hypotheses;
- receive one reversible seven-day experiment;
- complete seven numerical and five open-ended feedback questions;
- preserve multiple historical sessions;
- recover through deterministic fallback when AI generation is unavailable or rejected;
- retry generation from the exact saved evidence package without re-answering questions; and
- refresh or restart without losing successful or failed generation attempts.

Original answers, completed sessions, the original generated model, feedback, and the initial Business DNA record remain immutable.

## How It Works

The canonical Version 1.3 calibration lives in a frozen Markdown specification and matching JSON definition. The React interface loads question wording, answer options, output-section identities, and feedback questions from that JSON rather than duplicating them in components.

After answer twelve, the server rebuilds a current-session-only evidence package. The generation pipeline requests strict structured output, validates section structure and evidence references, retries once with safe correction information, and uses deterministic fallback after repeated validation or provider failure. SQLite stores session progress, immutable completed records, feedback, and append-only retry attempts. On reload, the server returns attempts newest-first and the interface selects the newest successful AI-assisted result while retaining the original fallback and failed-attempt diagnostics.

## How GPT-5.6 Is Used

GPT-5.6 synthesizes the twelve-answer evidence package into ten canonical participant-facing sections. Its instruction contract requires a narrative sequence from identity and strength through hidden cost, business consequence, leverage point, respectful challenge, seven-day experiment, and reason to continue.

The model does not receive prior chats, account personalization, other sessions, model memory, external information, or arbitrary prompts. Its output must pass validators for canonical structure, evidence discipline, independent support, confidence calibration, uncertainty, direct-quote fidelity, healthcare safety, context isolation, and contamination by internal report language. Evidence references remain structured rather than being dumped into participant-facing prose. Provider timeout, failure, or rejected output preserves a deterministic result.

## How Codex Was Used

Codex was the implementation partner across the project lifecycle. It inspected the existing Open Loops repository, established the Business DNA subproject inside the inherited architecture, converted the approved calibration specification into a canonical JSON definition and tests, and built the question, model, feedback, history, retry, and persistence flows.

Codex also audited deterministic reasoning, added the server-only generation boundary, diagnosed provider timeout and narrative-validation failures from safe evidence, improved participant presentation, fixed retry persistence across refresh and SQLite restart, added fail-closed production packaging, synchronized architecture and decision records, and maintained regression coverage. The current calibration command runs 87 automated tests.

## Technical Implementation

- React 19 and TypeScript for the existing Open Loops interface.
- Vite 7 for local development and production builds.
- Node.js 22 HTTP server for the same-origin API, static frontend, SPA fallback, and safe health endpoint.
- Built-in `node:sqlite` for durable single-instance storage.
- OpenAI Responses API adapter with strict structured output and `store: false`.
- Configurable GPT-5.6 model identifier and provider timeout; credentials remain server-side.
- Deterministic generation fallback behind the same validated result contract.
- Append-only generation-attempt records with safe validation diagnostics.
- Native Node test runner for canonical integrity, lifecycle, reasoning, security, persistence, recovery, and production-serving tests.
- Multi-stage Dockerfile and fail-closed environment validation for future hosted deployment.

## Challenges

The hardest part was not generating prose; it was maintaining evidence discipline and user trust across failure modes. The generator had to avoid turning an avoided task into the root constraint, defaulting every owner to founder dependence, or converting healthcare-related business answers into medical advice.

Live development also exposed integration issues: a provider timeout that was too short for the full strict result, a mismatch between narrative instructions and validation rules, participant-facing output contaminated by internal report language, and a retry result that initially disappeared after refresh. Each issue was addressed without changing the frozen Version 1.3 calibration or overwriting historical records.

## Accomplishments

- A complete twelve-question-to-feedback vertical slice inside the existing Open Loops application.
- A canonical JSON-driven calibration with exact frozen-source hash tests.
- Ten participant-facing narrative sections plus inspectable structured evidence and uncertainty.
- Strict context isolation and evidence validation around GPT-5.6 generation.
- Deterministic fallback, safe retry, and durable refresh/restart recovery.
- Immutable original sessions and append-only generation attempts.
- A simple participant-first result that keeps complete review records accessible but secondary.
- 87 automated tests and a passing production build.
- Same-origin production packaging that fails closed when identity, persistence, or secret configuration is unsafe.

These are implementation results from the repository, not claims about customer adoption or measured business outcomes.

## What We Learned

Structured output is only the beginning of a trustworthy AI workflow. A schema can be valid while the narrative is repetitive, internally framed, or unsupported. Useful safeguards need to cover evidence identity, independent support, confidence, competing explanations, direct quotes, participant-facing language, immutable history, and recovery after provider failure.

We also learned that fallback should not be treated as an error page. A deterministic result keeps the workflow complete, while an append-only retry can improve the reflection later without erasing what originally happened.

## What’s Next

After submission, the next controlled milestone is hosted deployment with an approved identity-aware proxy and persistent volume. Product learning should focus on participant feedback and whether the seven-day experiment produces useful new evidence. Any proposed change to the frozen questions or output contract belongs in a separately approved Version 1.4, not a silent edit to Version 1.3.

Longer-term Business DNA may evolve through continuing Open Loops and Lumi conversations, but it should remain part of the same Open Loops memory and governance architecture rather than becoming a parallel product universe.

## Public Repository

https://github.com/tonyfigurelli-glitch/open-loops-business-dna

License: MIT, Copyright © 2026 Tony Figurelli.

## Demo Video

[PUBLIC YOUTUBE URL — ADD AFTER UPLOAD]

The final video must be public, under three minutes, and include audio explaining both Codex and GPT-5.6.

## Codex Session ID

`[ADD /feedback CODEX SESSION ID]`

## Technologies Used

React, TypeScript, Vite, Node.js, `node:sqlite`, OpenAI Responses API, GPT-5.6, Codex, JSON Schema/strict structured output, CSS, Node test runner, Docker, Markdown.

## Setup And Testing

Prerequisites: Node.js 22 and npm or pnpm.

```bash
git clone https://github.com/tonyfigurelli-glitch/open-loops-business-dna.git
cd open-loops-business-dna
corepack enable
pnpm install --frozen-lockfile
```

Run the local API and Vite interface in separate terminals:

```bash
npm run server:dev
```

```bash
npm run dev
```

Use the fictional Northstar Studio answers in the repository README for the manual judging workflow. No provider key is required to complete the deterministic path.

Run verification:

```bash
npm run test:calibration
npm run build
```

## Judging-Criteria Mapping

### Technological Implementation

The product combines a canonical JSON-driven workflow, current-session-only GPT-5.6 structured generation, layered evidence and narrative validators, deterministic fallback, server-only secrets, durable SQLite storage, immutable completed records, append-only retries, refresh/restart recovery, and 87 automated tests. The implementation handles model success, timeout, provider failure, validation rejection, and offline generation without splitting Business DNA into a separate application.

### Design

The interface asks one question at a time, saves immediately, resumes incomplete work, and presents ten concise narrative sections before internal review material. Evidence, original answers, experiment details, feedback, and provenance remain available through collapsed Review details. Uncertainty is shown as readable lists and expressed naturally rather than as internal evaluation language.

### Potential Impact

Business DNA is designed for small-business owners who need a clearer way to examine decisions and operating patterns. Its potential is to turn reflection into a testable next step while making assumptions and uncertainty visible. No adoption, productivity gain, or business-outcome metric is claimed at this stage.

### Quality Of The Idea

The core idea is that AI-assisted business understanding should be provisional, evidence-grounded, and revisable. Instead of offering a generic diagnosis, Business DNA preserves competing explanations and proposes one reversible seven-day experiment. That creates a practical bridge between insight and new evidence while respecting the limits of a twelve-answer calibration.

## Open Questions

- What public YouTube URL should replace the placeholder?
- Which Codex Session ID will be submitted through `/feedback`?

## Version 1 Boundaries

The submission covers the Small Business Owner Initial Calibration Version 1.3. It does not claim public hosting, customer adoption, measured productivity gains, validated business outcomes, autonomous execution, or a complete business-management platform.
