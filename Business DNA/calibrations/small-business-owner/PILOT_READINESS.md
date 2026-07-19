# Small Business Owner Calibration Pilot Readiness

Status: Working Readiness Review
Last Updated: 2026-07-18
Owner: Tony

## Purpose

Define the remaining decisions, production controls, and acceptable limitations for a small controlled Version 1.3 pilot. This document does not approve a public launch, identity vendor, hosting platform, or paid model use.

## Readiness Classification

| Classification | Issue | Required disposition |
| --- | --- | --- |
| Blocker | No approved production identity provider or sign-in method | Tony selects an option; implement and verify its adapter before launch. |
| Blocker | No approved hosting platform, domain, or TLS termination | Select persistent hosting and an HTTPS origin. |
| Blocker | No participant consent, retention period, or deletion-response policy | Approve pilot language and operating policy. |
| Blocker for AI-assisted pilot | No approved live model provider, model, credentials, or data-processing terms | Approve provider/model or run deterministic-only. |
| Important before pilot | SQLite must live on a persistent volume with tested backups | Set an absolute database path and execute backup/restore acceptance tests. |
| Important before pilot | Monitoring and incident ownership are not assigned | Assign an operator and alert path; monitor health, 5xx responses, disk space, backup success, and provider fallback rate. |
| Important before pilot | Production sign-in UI depends on the selected identity adapter | Implement sign-in, sign-out, restoration, and expired-session UX after approval. |
| Important before pilot | Data export and deletion are operator commands rather than self-service | Document verification and dual-check handling for pilot requests. |
| Acceptable pilot limitation | One Node process and SQLite database | Keep one persistent instance; no horizontal scaling. |
| Acceptable pilot limitation | Manual invitations, consent tracking, output safety review, and issue triage | Limit participant count and assign a named operator/reviewer. |
| Acceptable pilot limitation | Provider outage uses deterministic fallback | Display and verify provenance for every output. |
| Future improvement | Hosted PostgreSQL, point-in-time recovery, automated alerting, self-service deletion, and richer evaluation reporting | Revisit after pilot evidence supports expansion. |

## Build Week Calibration Continuity

The July 18, 2026 Build Week enhancement keeps every Version 1.3 calibration session accessible and allows a participant to begin a new uniquely identified session without replacing prior answers, output, feedback, or the initial Business DNA record.

When a completed session used deterministic fallback, the participant may request a GPT-5.6 retry. The browser sends only the saved session ID. The authenticated server reloads that owner's completed session, reconstructs the evidence package from the exact stored twelve answers, runs the existing validator and fallback pipeline, and stores the result as a separate generation attempt linked to the source session. A retry never overwrites the original generated model or initial Business DNA record and never requires answers to be re-entered.

The interface distinguishes connecting, successful AI-assisted generation, and failed-with-fallback states. Participant-facing errors use fixed redacted copy and do not display credentials, provider responses, prompts, or answers. This enhancement does not activate a provider, approve paid usage, or change either frozen Version 1.3 artifact.

## Development Versus Production

Production differs from development in these required ways:

- HTTPS and an approved public origin replace Vite/local HTTP.
- Development identity issuance is disabled; an approved external adapter supplies stable user IDs.
- `Secure`, HttpOnly, SameSite cookies are mandatory.
- The database uses an absolute persistent path outside the application image and ephemeral filesystem.
- A high-entropy secret is supplied by a secret manager, never a script default.
- Backups are encrypted, access-controlled, tested, and stored outside the application host.
- Operational logs contain event metadata only; participant answers, prompts, cookies, credentials, and model output are excluded.
- Health, 5xx rate, disk capacity, restart, backup, and provider-fallback monitoring are active.
- Production startup fails when the origin, database, session secret, or approved authentication mode is missing.

## Authentication Decision

The production adapter must return one stable authenticated user ID and implement sign-in, sign-out, restoration, expiration, secure-cookie behavior, and server-side ownership enforcement.

| Option | Effort | Pilot cost | Security and UX | Dependence | Migration difficulty |
| --- | --- | --- | --- | --- | --- |
| Clerk hosted passwordless | Low | Current free tier supports a small pilot | Managed hosted UX, sessions, recovery, and user administration | Medium-high | Moderate; map stable Clerk user IDs through the adapter and retain export capability. |
| Supabase Auth magic link/OTP | Low-medium | Free tier supports a small pilot; Pro currently starts at $25/month | Managed auth with flexible providers; strongest fit if storage also moves to Supabase Postgres | Medium | Moderate; auth can be adopted separately, but a database move increases scope. |
| Self-managed email magic links | High | Infrastructure and transactional-email costs | Maximum control but highest security, abuse, delivery, recovery, and operational burden | Low vendor dependence | Low data migration, high implementation risk. |

**Default recommendation:** Clerk hosted passwordless authentication for the controlled pilot because it minimizes custom credential and account-recovery code. Keep Clerk-specific verification in one adapter. This recommendation requires Tony’s approval before implementation.

Current pricing and capability references: [Clerk pricing](https://clerk.com/pricing), [Supabase Auth](https://supabase.com/docs/guides/auth), and [Supabase pricing](https://supabase.com/pricing).

## Model Provider Decision

| Option | Structured output and reasoning | Approximate pilot cost | Latency | Privacy and dependence |
| --- | --- | --- | --- | --- |
| OpenAI `gpt-5.6-terra` | Current balanced intelligence/cost model with structured outputs; strong fit for evidence-constrained synthesis | At $2.50/M input and $15/M output, approximately $0.09–$0.13 for a 10–15K-token input and 4–6K-token output; one retry can roughly double this | Moderate | Server-only API; API data is not used for training by default, while default abuse-monitoring retention can be up to 30 days. Vendor dependence is isolated in the adapter. |
| Anthropic cost-efficient model | Strong reasoning; provider-specific structured-output request/response adapter requires verification | Model-dependent; generally higher than the recommended mini model for equivalent output volume | Moderate | Separate provider contract, retention review, and adapter work required. |
| Google Gemini structured-output model | Supports a subset of JSON Schema | Model-dependent | Fast to moderate | Separate schema compatibility, retention, and adapter work required. |
| Deterministic only | Fully reproducible and already tested | No model cost | Immediate | Lowest privacy and vendor risk, but less participant-specific reasoning. |

**Default recommendation:** OpenAI `gpt-5.6-terra` through the dedicated Responses API adapter, with `store: false`, strict structured output, the existing validator, one retry, usage capture, and deterministic fallback. Before participant use, compare it with the cheaper deterministic output in the evaluation harness and approve the provider’s data terms. This is a recommendation only; no commercial provider is activated.

References: [OpenAI model guidance](https://developers.openai.com/api/docs/models), [GPT-5.6 Terra pricing and capabilities](https://developers.openai.com/api/docs/models/gpt-5.6-terra), and [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint).

## Required Configuration

- `NODE_ENV=production`
- `OPEN_LOOPS_DATABASE_PATH`: absolute persistent path
- `OPEN_LOOPS_SESSION_SECRET`: secret-manager value of at least 32 characters
- `OPEN_LOOPS_PUBLIC_ORIGIN`: approved `https://` origin
- `OPEN_LOOPS_AUTH_MODE=external`
- `OPEN_LOOPS_ALLOW_DEVELOPMENT_AUTH`: absent or `false`
- `MODEL_PROVIDER_URL`, `MODEL_PROVIDER_API_KEY`, and `MODEL_IDENTIFIER`: configured together only after provider approval
- `MODEL_PROVIDER_TYPE`: `openai_responses` for the recommended adapter or `configured_http` for the vendor-neutral contract
- `MODEL_PROVIDER_NAME`: provenance label
- `PORT`: deployment-assigned or explicit

## Retention And Deletion Decision

Before enrollment, approve: calibration retention duration, backup retention duration, evaluation retention duration, deletion SLA, identity-verification procedure, whether deletion includes backups immediately or through scheduled expiry, and who can authorize exports/deletions. Until approved, do not promise a specific deletion timeline.

## Data-Loss Failure Modes

- Ephemeral deployment storage or redeployment replacing the SQLite file.
- Running multiple writers against copied or non-shared SQLite files.
- Disk exhaustion, host loss, corrupt volume, or untested backup.
- Closing the browser before backend confirmation; local cache limits this risk but does not replace server persistence.
- Clearing browser storage before an offline update synchronizes.
- Identity misconfiguration producing a different user ID on return.
- Operator deletion with the wrong participant ID; the CLI requires an exact confirmation variable.
- Backup files stored only on the same host or retained without encryption/access control.

## Related Documents

- [Pilot acceptance test](PILOT_ACCEPTANCE_TEST.md)
- [Pilot operations](PILOT_OPERATIONS.md)
- [Version 1.3 specification](SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md)
- [Technical architecture](../../../TECHNICAL_ARCHITECTURE.md)
- [Decisions log](../../../DECISIONS.md)

## Open Questions

- Which identity provider, hosting platform, domain, model provider, retention period, and pilot participant count will Tony approve?

## Version 1 Boundaries

- This readiness work does not deploy publicly, enable paid usage, modify Version 1.3, or add unrelated product features.
