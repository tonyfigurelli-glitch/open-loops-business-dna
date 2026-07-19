# OpenAI Build Week Submission Checklist

Status: Working Submission Checklist
Last Updated: 2026-07-18
Owner: Tony

## Purpose

Track the remaining repository, demo, judging, and submission work for the Open Loops Business DNA entry before the deadline: **July 21, 2026 at 5:00 PM PT**.

## Submission Checklist

- [x] Target category is **Work and productivity**.
- [ ] Decide repository visibility for judging.
- [ ] Approve and add an open-source license, or explicitly accept that a public repository without one is not open source. See [LICENSE_DECISION_REQUIRED.md](LICENSE_DECISION_REQUIRED.md).
- [x] Provide a judge-oriented root [README.md](README.md) with problem, product, GPT-5.6, Codex, architecture, setup, privacy, and demo guidance.
- [ ] Publish a public YouTube demo under three minutes.
- [ ] Confirm the video audio clearly explains how Codex accelerated development and how GPT-5.6 generates the evidence-constrained model.
- [ ] Submit the final Codex Session ID through `/feedback` and record it below.
- [ ] Capture screenshots of the twelve-question flow, ten-section result, Review details, AI success state, session history, and refresh recovery.
- [ ] Run the final acceptance test in [Business DNA/calibrations/small-business-owner/PILOT_ACCEPTANCE_TEST.md](Business%20DNA/calibrations/small-business-owner/PILOT_ACCEPTANCE_TEST.md).
- [ ] Verify the public HTTPS URL, same-origin API, `/api/health`, identity proxy, persistent volume, and deterministic fallback.
- [ ] Verify no `.env`, provider key, participant export, backup, or SQLite file is tracked or included in the container context.
- [ ] Run `npm run test:calibration` and record the passing count.
- [ ] Run `npm run build` and record the result.
- [ ] Confirm both frozen Version 1.3 hashes.
- [ ] Submit before **July 21, 2026 at 5:00 PM PT**.

## Submission Record

- Repository URL: TBD
- Public demo URL: TBD
- YouTube URL: TBD
- Codex Session ID submitted through `/feedback`: TBD
- Screenshot location: TBD
- Final test count: TBD
- Final commit: TBD
- Submission timestamp: TBD

## Final Acceptance Focus

1. A judge can understand the user problem in under one minute.
2. A judge can run the local app from the README without private data or credentials.
3. The fictional Northstar Studio answers complete all twelve canonical questions.
4. The result contains ten canonical narrative sections and complete review details.
5. AI-assisted output shows provenance; fallback remains functional without a provider.
6. Refresh and service restart preserve generation attempts and original immutable records.
7. Production rejects missing identity, secret, HTTPS-origin, and persistent-path configuration.
8. The repository and image context contain no secrets, participant data, or SQLite files.

## Open Questions

- Which repository visibility, license, hosting provider, identity proxy, and final demo URL will Tony approve?
- Which Codex Session ID should be recorded after `/feedback` succeeds?

## Version 1 Boundaries

This checklist covers Build Week judging and controlled deployment of the existing Business DNA calibration vertical slice only. It does not authorize unrelated product expansion.
