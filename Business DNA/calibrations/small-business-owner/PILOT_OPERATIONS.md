# Version 1.3 Pilot Operations

Status: Controlled Pilot Procedure
Last Updated: 2026-07-17
Owner: TBD

## Purpose

Define the minimum operating procedure for a small, manually supervised calibration pilot.

## Participant Procedure

1. Create or invite the participant through the approved identity provider.
2. Confirm consent, intended use, model-provider disclosure, retention, export, and deletion expectations.
3. Have the participant complete Version 1.3 without coaching alternative wording.
4. Verify calibration ID, version, frozen hash, generator type, provider/model, retry count, validation result, and evidence-package hash.
5. Review the output for safety, evidence grounding, confidence discipline, alternatives, and unsupported inference before treating it as usable.
6. Collect all canonical Version 1.3 feedback.
7. Record operational failures separately from reasoning-quality findings.
8. Store reviewer evaluation separately through the evaluation harness; never update the immutable participant output.
9. Preserve the original session, generated output, provenance, and initial provisional Business DNA record.
10. Put proposed wording or reasoning changes only in [Version 1.4 proposals](CALIBRATION_V1_4_PROPOSALS.md).

## Backup And Restore

Before and after each cohort, stop writes or use a quiet maintenance window, then run:

```sh
OPEN_LOOPS_DATABASE_PATH=/absolute/persistent/open-loops.sqlite \
  node server/pilotOperations.mjs backup /absolute/secure-backups/open-loops-YYYYMMDD-HHMM.sqlite
```

Record a SHA-256 checksum, encrypt the backup or store it in encrypted managed storage, restrict access, and copy it off-host. Restore by copying the selected backup to a new absolute path, starting the API against that path in a non-production verification environment, and running the technical checklist. Never overwrite the only production database during a restore drill.

## Participant Export

After verifying the requestor and exact stable user ID:

```sh
OPEN_LOOPS_DATABASE_PATH=/absolute/persistent/open-loops.sqlite \
  node server/pilotOperations.mjs export-participant USER_ID /secure/output/participant-export.json
```

The export is created with owner-only file permissions where supported. Transfer it through an approved secure channel and delete the working export according to the approved retention policy.

## Participant Deletion

Take a pre-deletion backup and obtain explicit authorization. Then require an exact confirmation match:

```sh
OPEN_LOOPS_DATABASE_PATH=/absolute/persistent/open-loops.sqlite \
OPEN_LOOPS_CONFIRM_DELETE=USER_ID \
  node server/pilotOperations.mjs delete-participant USER_ID
```

Record only the request identifier, authorization, timestamp, operator, counts removed, and backup-expiry handling—not participant answers. Deletion removes owned sessions, initial Business DNA records, and evaluation copies from the active database. Backup expiry follows the policy Tony approves before launch.

## Monitoring And Incident Response

Monitor health checks, restarts, 401/403/404/409/5xx rates, disk capacity, backup completion, provider latency, validation retry rate, deterministic-fallback rate, and authentication failures. Operational logs must never include request bodies, participant text, prompts, outputs, cookies, authorization headers, or secrets.

Pause enrollment after data loss, cross-user access, backup failure, repeated unsafe output, canonical mismatch, or unexplained immutability failure. Preserve evidence, switch generation to deterministic fallback when appropriate, and do not alter Version 1.3 as an incident response.

## Evaluation Harness

`server/evaluationHarness.mjs` accepts deterministic, AI-assisted, or manually supplied historical output and ten integer scores from 1–5. It stores the reviewed source and scores in `calibration_evaluations`, separate from calibration sessions and Business DNA records. Historical output is never passed into generation or training.

## Related Documents

- [Pilot readiness](PILOT_READINESS.md)
- [Pilot acceptance test](PILOT_ACCEPTANCE_TEST.md)
- [Version 1.4 proposals](CALIBRATION_V1_4_PROPOSALS.md)

## Open Questions

- What are the approved retention periods, deletion SLA, incident contacts, participant cap, and backup locations?

## Version 1 Boundaries

- Pilot operations remain manual and limited to the approved Version 1.3 calibration.
