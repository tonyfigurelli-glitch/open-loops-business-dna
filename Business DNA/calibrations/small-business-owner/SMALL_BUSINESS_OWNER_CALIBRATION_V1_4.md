# Open Loops Small Business Owner Initial Calibration

Status: Approved Working Prototype
Last Updated: 2026-07-21
Owner: Tony

## Purpose

Define Version 1.4 of the Small Business Owner Initial Calibration. Version 1.4 preserves the twelve onboarding questions, evidence rules, ten-section profile, and seven-day experiment from frozen Version 1.3 while shortening participant feedback and improving completion reliability.

## Version Identity

- Identifier: `small_business_owner_initial_calibration@1.4.0`
- Semantic version: `1.4.0`
- Base definition: frozen Version 1.3
- Status: canonical working prototype

## Preserved From Version 1.3

Version 1.4 inherits without wording or ordering changes:

- exactly twelve onboarding questions, asked one at a time
- controlled cold-start context isolation
- current-session-only evidence
- at least two independent pieces of evidence for major conclusions
- the ten participant-facing profile sections
- explicit uncertainty, competing explanations, and confidence
- one respectful challenge
- one evidence-generating seven-day experiment
- immutable, inspectable session history

## Participant Feedback

After presenting the profile, say:

**“I’d like to test whether this first conversation created genuine understanding and practical value.”**

Ask exactly three questions, one at a time.

### Feedback 1 — Understanding

**How accurately did this reflect you and your business?**

Use this scale:

- 1 = Not accurate
- 2 = Slightly accurate
- 3 = Partly accurate
- 4 = Mostly accurate
- 5 = Very accurate

### Feedback 2 — Usefulness

**How useful was the main pattern, challenge, and seven-day experiment?**

Use this scale:

- 1 = Not useful
- 2 = Slightly useful
- 3 = Somewhat useful
- 4 = Very useful
- 5 = Extremely useful

### Feedback 3 — Improve the Model

**What felt most accurate—and what should this model understand differently or better?**

Accept one concise open-ended response. The participant may mention an important missing factor, an inaccurate observation, or a new perspective.

## Reliable Completion

- The participant's twelve answers must be saved before AI-assisted generation begins.
- If the provider fails, times out, or returns invalid output, the deterministic result must remain available and the participant must receive a clear recovery message.
- Retrying AI generation must create a separate immutable attempt and must never replace the original output.
- A generation failure must not require the participant to repeat onboarding or feedback.

## Comparability and Migration

- Version 1.3 sessions remain historical, inspectable, and labeled as Version 1.3.
- Onboarding answers and the ten profile sections remain comparable because their wording and order are unchanged.
- Feedback totals are not directly comparable: Version 1.3 collected seven ratings and five open-ended responses; Version 1.4 collects two ratings and one open-ended response.
- Existing Version 1.3 sessions are not migrated or rewritten.

## Decision References

- Founder approval to begin Version 1.4: July 21, 2026.
- See the root `DECISIONS.md` for the permanent decision record.

## Open Questions

- Should later pilot evidence further shorten or revise the twelve onboarding questions?
- Which feedback signal best predicts a participant's willingness to return?

## Version 1 Boundaries

Version 1.4 changes participant feedback and completion reliability only. It does not add accounting, CRM, operational control, or unsupported diagnosis.
