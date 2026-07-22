# Small Business Owner Initial Calibration

Status: Approved Working Direction
Last Updated: 2026-07-21
Owner: Tony

## Purpose

Reserve the canonical repository location for the approved Small Business Owner Initial Calibration and document the source-control rules that apply to it.

## Approved Version

Canonical identifier: `small_business_owner_initial_calibration@1.3.0`

Required frozen artifacts:

- `SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md` — authoritative human-readable specification
- `v1.3.json` — authoritative machine-readable definition derived from that specification
- `SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md` — current authoritative Version 1.4 specification
- `v1.4.json` — current machine-readable override, resolved against frozen Version 1.3

## Current State

The full Version 1.3 specification is memorialized in `SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md`. The corresponding structured definition is stored in `v1.3.json` and protected by `v1.3.test.mjs`.

The JSON was derived from the canonical Markdown, including its exact question blocks and all 22 numbered sections. The JSON records the frozen Markdown's SHA-256 hash so silent source changes fail validation.

The calibration must not be reconstructed from summaries, model memory, chat history, participant material, generated profiles, or older prompts.

The application reads the canonical JSON through `src/domain/calibrations/smallBusinessOwnerCalibration.ts`. Canonical question wording and output-schema text must not be duplicated in UI components or prompts.

## Legacy Prompt Audit

On 2026-07-17, the Open Loops repository was searched for calibration prompts and Small Business Owner calibration content. No older calibration prompt was present outside the newly created Business DNA documentation.

If an older calibration prompt is later added or discovered:

- preserve it for history rather than deleting it
- label it clearly as `Superseded`
- identify `small_business_owner_initial_calibration@1.3.0` as the active canonical version
- prevent application code from loading the superseded prompt

## Validation Requirements

Validation confirms at minimum:

- the identifier is exactly `small_business_owner_initial_calibration@1.3.0`
- the version is recorded as `1.3.0`
- exactly 12 ordered questions are present
- required generation, evidence, confidence, unknown, competing-explanation, seven-day experiment, participant-feedback, and preservation rules are represented
- every completed session can record the exact calibration version used
- the JSON definition corresponds to the frozen Markdown specification
- no active competing calibration definition exists
- application source imports `v1.3.json` through the shared adapter
- application components do not duplicate canonical onboarding wording

## Decision References

- See the root [Decisions Log](../../../DECISIONS.md) for approval of Version 1.3 implementation.

## Related Documents

- [Business DNA Instructions](../../AGENTS.md)
- [Business DNA Overview](../../README.md)
- [Open Loops Constitution](../../../AGENTS.md)
- [Decisions Log](../../../DECISIONS.md)
- [Version 1.4 Proposals](CALIBRATION_V1_4_PROPOSALS.md)

## Open Questions

- How should the application consume the canonical JSON while preserving the existing Open Loops memory architecture?
- Which later runtime tests should verify completed-session version attribution and historical preservation?

## Version 1 Boundaries

- This directory is part of the approved Business DNA Version 1 work.
- Version 1.3 is frozen; substantive changes require a new documented version.
- This calibration must use the inherited Open Loops governance, memory architecture, data-model principles, and Lumi interaction rather than creating a parallel technical system.
