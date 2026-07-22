# Open Loops — Business DNA

Status: Build Week Candidate
Last Updated: 2026-07-22
Owner: Tony

## Purpose

Give judges, contributors, and deployment operators one concise entry point for understanding, running, evaluating, and safely deploying the Business DNA vertical slice inside Open Loops.

## What Business DNA Does

Business DNA helps a small-business owner turn twelve structured reflections into an evidence-linked Initial Business Owner Model. The result contains ten participant-facing sections, a central hypothesis, supporting and potentially disconfirming evidence, calibrated confidence, unknowns, direct quotes, and a seven-day experiment. The participant then answers three short feedback questions: two ratings and one open-ended response.

Business DNA is an Open Loops subproject, not a separate product or technical universe. It inherits the main application's governance, durable memory, data-model principles, and Lumi-oriented interaction philosophy.

## The Real Problem And Target User

The target user is a small-business owner whose most important constraints are difficult to see from inside day-to-day work. Generic advice often mistakes a visible avoided task for the root problem, assumes every business needs the same systemization prescription, or presents uncertain interpretations as facts.

Version 1.4 creates a provisional, inspectable starting model. It preserves Version 1.3's twelve onboarding questions, evidence rules, ten-section profile, and seven-day experiment while shortening feedback to three questions. It separates direct statements, reasonable inferences, tentative hypotheses, and unknowns; requires independent evidence for major conclusions; preserves competing explanations; and proposes a small experiment that can generate better evidence.

## How GPT-5.6 Is Used

The server builds an evidence package from only the current calibration's twelve stored answers. A configured GPT-5.6 model receives the frozen Version 1.4 output contract, resolved from its frozen Version 1.3 base, and returns strict structured output. The application validates canonical section structure, evidence references, confidence discipline, safety, context isolation, and participant-facing narrative quality. It retries one rejected or failed provider attempt, then safely uses deterministic fallback.

The provider key, model request, prompt instructions, answers, and raw provider response remain server-side. `MODEL_IDENTIFIER` selects the approved model; no GPT-5.6 variant is hardcoded. Successful and failed retries are stored as immutable append-only generation attempts with redacted diagnostics.

## How Codex Accelerated Development

Codex was used as an implementation partner to inspect the existing Open Loops architecture, memorialize the frozen calibration, convert it to a tested JSON source of truth, build the first full vertical slice, audit reasoning quality, add secure server generation, diagnose live timeout and validation mismatches, preserve retry history across refresh and restart, refine participant presentation, and prepare the single-service production path. Each milestone was paired with regression tests and dated decision records so rapid iteration did not erase governance or evidence discipline.

## Architecture

- React 19 and Vite provide the existing Open Loops interface.
- One Node 22 HTTP service serves the built Vite `dist`, SPA fallback routes, and `/api` from the same origin.
- SQLite provides durable single-instance storage at `OPEN_LOOPS_DATABASE_PATH`; production must mount that path on a persistent volume.
- The canonical calibration is resolved from `Business DNA/calibrations/small-business-owner/v1.4.json` and its frozen `v1.3.json` base rather than duplicated in UI components.
- Provider access is isolated behind a server adapter. Deterministic generation remains the safe fallback.
- Completed sessions, original answers, original generated models, feedback, and Initial Business DNA Records are immutable. Retry attempts are append-only child records.
- Production identity is supplied by an authenticated reverse proxy. The application verifies a server-only proxy secret and a trusted user-ID header on every protected API request.

See [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md), and [server/README.md](server/README.md) for implementation details.

## Local Setup

Prerequisites: Node.js 22 and npm or pnpm.

```bash
corepack enable
pnpm install --frozen-lockfile
```

Run the existing local workflow in two terminals:

```bash
npm run server:dev
```

```bash
npm run dev
```

Open the Vite URL shown in the second terminal. Local development authentication remains available only through `server:dev`; production rejects it.

## Production Setup

The production command builds the frontend and starts the same-origin Node service:

```bash
npm run start:production
```

Set the variables listed in [.env.example](.env.example) through the hosting platform's environment and secret manager. At minimum production requires:

- `HOST` and `PORT`
- an HTTPS `OPEN_LOOPS_PUBLIC_ORIGIN`
- an absolute `OPEN_LOOPS_DATABASE_PATH` on a mounted persistent volume
- a high-entropy `OPEN_LOOPS_SESSION_SECRET`
- `OPEN_LOOPS_AUTH_MODE=external`
- a high-entropy `OPEN_LOOPS_TRUSTED_PROXY_SECRET`
- `OPEN_LOOPS_TRUSTED_USER_HEADER`, normally `x-open-loops-user-id`

The public origin must sit behind an identity-aware reverse proxy. After authentication, that proxy must remove any inbound identity headers and inject both the trusted user ID and `x-open-loops-proxy-secret`. The application must not be exposed on a route that bypasses this proxy. Anonymous or spoofed requests fail with HTTP 401; there is no public authentication bypass.

For AI-assisted generation, also configure `MODEL_PROVIDER_TYPE=openai_responses`, `MODEL_PROVIDER_URL`, `MODEL_PROVIDER_API_KEY`, and `MODEL_IDENTIFIER`. Omitting the entire provider configuration preserves deterministic fallback. Partial provider configuration fails startup.

Container deployment uses [Dockerfile](Dockerfile). Mount a persistent volume such as `/data` and set `OPEN_LOOPS_DATABASE_PATH=/data/open-loops.sqlite`. The image exposes port 8787 and defaults to `HOST=0.0.0.0`. The hosting platform must provide HTTPS termination and the authenticated proxy described above.

## Test Commands

```bash
npm run test:calibration
npm run build
```

The calibration suite covers frozen-file integrity, canonical counts, reasoning discipline, secure generation, provider timeouts, retry persistence, authentication, SQLite restart/backup behavior, static production serving, SPA fallback, health output, secret isolation, and fail-closed configuration.

## Sample And Demo Workflow

These fictional answers describe Northstar Studio, not Tony or any real participant. Start a new Small Business Owner calibration and enter them in question order:

1. `Northstar Studio designs accessible websites and brand systems for local service businesses.`
2. `2–5 people`
3. `Does a little of everything`
4. `Create a repeatable referral process that produces four qualified conversations per month.`
5. `Stability and protecting what already works`
6. `Customer experience`
7. `Act when I have enough information and adjust afterward`
8. `We generate more ideas than we can execute`
9. `Turning a client's fuzzy idea into a clear design direction.`
10. `Reviewing project profitability and following up consistently with referral partners.`
11. `We had a narrow project mix, weekly planning, clear ownership, and enough space to improve work before delivery.`
12. `Trust grows when we make the work understandable and keep the promises we make.`

Demo sequence: complete the twelve questions, review the ten-section model, inspect evidence and uncertainty under Review details, complete the three feedback questions, return to session history, and—when the original used fallback—show that an AI retry remains selected after refresh.

## Data Privacy And Immutability Guarantees

- Provider credentials never enter the browser bundle, logs, Git, or participant-facing errors.
- Generation uses only the current session's twelve answers—never prior chats, account memory, other sessions, or external research.
- SQLite files, environment files, backups, participant exports, build output, and dependency folders are excluded from Git and Docker build context.
- Every query is scoped to the authenticated participant.
- Original answers, completed sessions, generated initial models, timestamps, feedback, and Initial Business DNA Records cannot be overwritten.
- Retry attempts and their safe diagnostics are append-only and survive refresh and server restart.
- Operational logs contain fixed metadata and redacted failure codes, not participant answers or generated narrative.

## Build Week Judging Notes

- Category: **Work and productivity**.
- The approved submission testing path is the public runnable repository, this README's local two-terminal setup, the fictional sample workflow above, and the local demo recording published as the submission video.
- A hosted application is intentionally deferred until after Build Week submission.
- `/api/health` returns only `{"status":"ok"}` and requires no participant context.
- The frozen Version 1.3 and Version 1.4 definitions are protected by exact SHA-256 regression tests.
- The project demonstrates GPT-5.6 structured reasoning with deterministic resilience, not a generic chat wrapper.
- Codex contribution and the required submission assets are tracked in [BUILD_WEEK_SUBMISSION_CHECKLIST.md](BUILD_WEEK_SUBMISSION_CHECKLIST.md).

## License

Open Loops is available under the [MIT License](LICENSE). Copyright © 2026 Tony Figurelli.

## Open Questions

- Which exact Build Week Codex Session ID should be submitted through `/feedback`?
- What public repository and YouTube URLs should be recorded in the final checklist?

## Version 1 Boundaries

This milestone deploys the approved Small Business Owner Initial Calibration inside Open Loops. It does not add accounting, CRM, payroll, project-management replacement, autonomous business decisions, general-purpose prompting, or cross-session model context.
