# Version 1.4 Pilot Acceptance Test

Status: Repeatable Pilot Checklist
Last Updated: 2026-07-22
Owner: Tony

## Purpose

Provide repeatable participant-facing and technical checks before every controlled pilot cohort.

## Tester Checklist

- [ ] Open the approved HTTPS pilot URL and sign in with the invited identity.
- [ ] Confirm the screen displays calibration Version `1.4.0` and frozen source hash `623075975824c9cfc5b604453ed75879056d37fdfc57e6a1282db6d6bf043e55`.
- [ ] Start a new calibration and answer questions 1–3.
- [ ] Refresh; confirm the next unanswered question returns with prior answers preserved.
- [ ] Sign out; confirm protected calibration data is no longer retrievable.
- [ ] Sign in again; confirm the same calibration resumes.
- [ ] When supported, sign in from a second private browser session; confirm the same backend state appears.
- [ ] Disconnect the network, submit one answer, and confirm the local recovery state survives a refresh without falsely claiming server sync.
- [ ] Reconnect, continue, refresh, and confirm backend synchronization preserved progress.
- [ ] Finish exactly 12 onboarding questions and confirm exactly 10 model sections appear.
- [ ] Confirm generation provenance says either AI-assisted or deterministic fallback.
- [ ] In the fallback test run, disable provider configuration and confirm completion still succeeds.
- [ ] In the separately authorized AI test run, confirm the configured model and usage provenance are stored.
- [ ] Confirm feedback clearly reports Questions 1, 2, and 3 of 3.
- [ ] Complete exactly two numerical and one open-ended feedback questions.
- [ ] Use `Finish later` during feedback; confirm Home offers `Continue feedback` and resumes at the next unanswered item.
- [ ] Leave and return; confirm the completed session reopens unchanged.
- [ ] Report any unsafe, clinical, unsupported, overly certain, repetitive, or ungrounded conclusion immediately.

## Technical Verification Checklist

- [ ] Record deployment commit, origin, database path, auth adapter/version, and provider/model configuration.
- [ ] Run the complete automated test suite and production build.
- [ ] Verify `GET /api/health` returns `{"status":"ok"}` without authentication or participant data.
- [ ] Verify development login returns 404 in the production configuration.
- [ ] Verify an unauthenticated session request returns 401.
- [ ] Verify User B receives 404 for User A’s session and Business DNA record.
- [ ] Confirm every answer reaches durable storage before advancing.
- [ ] Restart the server and confirm the incomplete session resumes.
- [ ] Run a pre-cohort backup, restore it to a separate path, and compare participant/session counts.
- [ ] Import one canonical localStorage session twice; confirm the second import is reported as a duplicate.
- [ ] Complete one test session; confirm exactly one immutable `initial_provisional_model` record is created.
- [ ] Attempt to change the completed model; confirm a 409 response and unchanged stored output.
- [ ] Run participant export and verify it includes sessions, Business DNA records, evaluations, feedback, and provenance.
- [ ] Run deletion only on a disposable test identity using the exact confirmation variable; verify all owned pilot data is removed.
- [ ] Confirm operational logs contain route templates/status/duration only—not answers, quotes, prompts, cookies, tokens, provider keys, or model output.
- [ ] Scan the production frontend bundle for provider credentials and server prompt construction.
- [ ] Recompute both canonical hashes and compare them with the approved values.

## Evidence To Retain

Keep the dated checklist, build/test output, backup filename and checksum, restore result, deployment identifier, auth/provider provenance, and all discovered issues. Do not retain participant answers in the checklist.

## Related Documents

- [Pilot readiness](PILOT_READINESS.md)
- [Pilot operations](PILOT_OPERATIONS.md)
- [Version 1.4 JSON](v1.4.json)
- [Frozen Version 1.3 base](v1.3.json)

## Open Questions

- Who signs the technical checklist and who independently reviews the first AI-assisted outputs?

## Version 1 Boundaries

- This checklist verifies only the approved Version 1.4 calibration pilot. Version 1.3 remains frozen historical behavior.
