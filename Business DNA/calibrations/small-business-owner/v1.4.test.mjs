import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const directory = new URL("./", import.meta.url);
const version13 = JSON.parse(readFileSync(new URL("v1.3.json", directory), "utf8"));
const override = JSON.parse(readFileSync(new URL("v1.4.json", directory), "utf8"));
const markdown = readFileSync(new URL("SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md", directory), "utf8");
const definition = {
  ...version13,
  ...override,
  canonical_source: { ...version13.canonical_source, ...override.canonical_source },
  participant_feedback: { ...version13.participant_feedback, ...override.participant_feedback },
};

test("defines Version 1.4 without changing frozen Version 1.3", () => {
  assert.equal(override.extends, "v1.3.json");
  assert.equal(definition.identifier, "small_business_owner_initial_calibration@1.4.0");
  assert.equal(definition.version, "1.4.0");
  assert.equal(definition.canonical_source.frozen, true);
  assert.equal(createHash("sha256").update(markdown).digest("hex"), definition.canonical_source.sha256);
});

test("preserves twelve onboarding questions and ten profile sections", () => {
  assert.deepEqual(definition.onboarding_questions, version13.onboarding_questions);
  assert.equal(definition.onboarding_questions.length, 12);
  assert.deepEqual(definition.profile_output, version13.profile_output);
  assert.equal(definition.profile_output.sections.length, 10);
});

test("asks exactly three feedback questions", () => {
  const feedback = definition.participant_feedback;
  assert.equal(feedback.question_count, 3);
  assert.equal(feedback.ask_separately, true);
  assert.equal(feedback.rating_questions.length, 2);
  assert.equal(feedback.open_ended_questions.length, 1);
  assert.equal(feedback.rating_questions.length + feedback.open_ended_questions.length, 3);
});

test("records comparability and no-migration boundaries", () => {
  assert.equal(override.version_notes.migration_required, false);
  assert.match(override.version_notes.older_sessions_comparable, /not directly comparable/i);
});
