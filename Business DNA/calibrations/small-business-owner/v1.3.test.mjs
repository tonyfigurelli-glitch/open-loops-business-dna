import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const calibrationDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(calibrationDirectory, "../../..");
const markdownPath = join(
  calibrationDirectory,
  "SMALL_BUSINESS_OWNER_CALIBRATION_V1_3.md",
);
const jsonPath = join(calibrationDirectory, "v1.3.json");
const markdown = readFileSync(markdownPath, "utf8").replace(/\n$/, "");
const definition = JSON.parse(readFileSync(jsonPath, "utf8"));

function splitHeadings(text, pattern, mapHeader) {
  const matches = [...text.matchAll(pattern)];

  return matches.map((match, index) => ({
    ...mapHeader(match),
    body: text
      .slice(
        match.index + match[0].length,
        index + 1 < matches.length ? matches[index + 1].index : text.length,
      )
      .trim()
      .replace(/(?:\n\n)?---\s*$/, "")
      .trim(),
  }));
}

function parseCanonicalSections() {
  return splitHeadings(markdown, /^# (\d+)\. (.+)$/gm, (match) => ({
    number: Number(match[1]),
    title: match[2].trim(),
  })).map(({ number, title, body }) => ({
    number,
    title,
    markdown: body,
  }));
}

function parseQuestions(questionMarkdown) {
  return splitHeadings(
    questionMarkdown,
    /^## Question (\d+) — (.+)$/gm,
    (match) => ({ order: Number(match[1]), title: match[2].trim() }),
  ).map(({ order, title, body }) => {
    const prompt = body.match(/^\*\*(.+?)\*\*/m)?.[1] ?? "";
    const purpose = body.match(/^Purpose: (.+)$/m)?.[1] ?? "";
    const presentedOptions = body.match(
      /^Present(?: these options)?:\n\n([\s\S]*?)(?=\n\n(?:Allow|If|Purpose:))/m,
    );
    const options = presentedOptions
      ? [...presentedOptions[1].matchAll(/^\* (.+)$/gm)].map(
          (match) => match[1],
        )
      : [];

    return {
      id: `q${String(order).padStart(2, "0")}`,
      order,
      title,
      prompt,
      response_type: options.length ? "single_select" : "short_text",
      options,
      purpose,
      canonical_markdown: body,
    };
  });
}

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) {
      return [];
    }

    const path = join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

test("uses the approved canonical identity and delivery rules", () => {
  assert.equal(
    definition.identifier,
    "small_business_owner_initial_calibration@1.3.0",
  );
  assert.equal(definition.version, "1.3.0");
  assert.equal(definition.lifecycle_status, "canonical_working_prototype");
  assert.equal(definition.delivery.exactly_one_question_at_a_time, true);
  assert.equal(definition.delivery.question_count, 12);
});

test("protects the frozen Markdown against silent changes", () => {
  const actualHash = createHash("sha256").update(markdown + "\n").digest("hex");

  assert.equal(definition.canonical_source.path, markdownPath.split("/").at(-1));
  assert.equal(definition.canonical_source.sha256, actualHash);
  assert.equal(definition.canonical_source.frozen, true);
  assert.equal(
    definition.canonical_source.substantive_changes_require_new_version,
    true,
  );
});

test("keeps all 22 canonical sections synchronized with the Markdown", () => {
  const sections = parseCanonicalSections();

  assert.equal(sections.length, 22);
  assert.deepEqual(definition.canonical_sections, sections);
});

test("contains exactly the 12 ordered canonical onboarding questions", () => {
  const questionSection = parseCanonicalSections().find(
    (section) => section.number === 5,
  );
  const questions = parseQuestions(questionSection.markdown);

  assert.equal(questions.length, 12);
  assert.deepEqual(
    questions.map((question) => question.order),
    Array.from({ length: 12 }, (_, index) => index + 1),
  );
  assert.deepEqual(definition.onboarding_questions, questions);
});

test("requires all ten participant-facing profile sections", () => {
  assert.equal(definition.profile_output.required_section_count, 10);
  assert.equal(definition.profile_output.sections.length, 10);
  assert.deepEqual(
    definition.profile_output.sections.map((section) => section.order),
    Array.from({ length: 10 }, (_, index) => index + 1),
  );
});

test("requires all seven ratings and five open-ended feedback questions", () => {
  assert.equal(definition.participant_feedback.rating_questions.length, 7);
  assert.equal(definition.participant_feedback.open_ended_questions.length, 5);
  assert.equal(definition.participant_feedback.ask_separately, true);
  assert.deepEqual(
    definition.participant_feedback.rating_scale.map((option) => option.value),
    [1, 2, 3, 4, 5],
  );
});

test("enforces context isolation and evidence discipline", () => {
  assert.equal(definition.context_isolation.enabled, true);
  assert.equal(
    definition.context_isolation.required_profile_fields
      .context_isolation_confirmed,
    "Yes",
  );
  assert.equal(
    definition.operational_rules.minimum_independent_evidence_for_major_conclusion,
    2,
  );
  assert.equal(
    definition.operational_rules.preserve_original_calibration_output,
    true,
  );
  assert.equal(
    definition.operational_rules.session_must_store_exact_version,
    true,
  );
});

test("rejects unlabelled competing calibration prompts", () => {
  const canonicalPaths = new Set([
    resolve(markdownPath),
    resolve(jsonPath),
    resolve(calibrationDirectory, "SMALL_BUSINESS_OWNER_CALIBRATION_V1_4.md"),
    resolve(calibrationDirectory, "v1.4.json"),
  ]);
  const candidates = walkFiles(repositoryRoot).filter((path) =>
    [".md", ".txt", ".json"].includes(extname(path)),
  );

  for (const candidate of candidates) {
    if (canonicalPaths.has(resolve(candidate))) {
      continue;
    }

    const content = readFileSync(candidate, "utf8");
    const isPrompt =
      /SMALL BUSINESS OWNER INITIAL CALIBRATION/i.test(content) &&
      /## Question 1\b/i.test(content);
    const isCompetingJson =
      extname(candidate) === ".json" &&
      content.includes("small_business_owner_initial_calibration@");

    if (isPrompt || isCompetingJson) {
      assert.match(
        content,
        /(?:Status|lifecycle_status)["']?\s*:\s*["']?Superseded/i,
        `${relative(repositoryRoot, candidate)} must be labelled Superseded`,
      );
    }
  }
});

test("application imports the canonical JSON without duplicating question wording", () => {
  const adapterPath = join(
    repositoryRoot,
    "src/domain/calibrations/smallBusinessOwnerCalibration.ts",
  );
  const adapter = readFileSync(adapterPath, "utf8");

  assert.match(
    adapter,
    /Business DNA\/calibrations\/small-business-owner\/v1\.3\.json/,
  );

  const sourceFiles = walkFiles(join(repositoryRoot, "src")).filter((path) =>
    [".js", ".jsx", ".ts", ".tsx"].includes(extname(path)),
  );

  for (const sourceFile of sourceFiles) {
    const content = readFileSync(sourceFile, "utf8");

    for (const question of definition.onboarding_questions) {
      assert.equal(
        content.includes(question.prompt),
        false,
        `${relative(repositoryRoot, sourceFile)} duplicates ${question.id} wording`,
      );
    }
  }
});

test("application session contract includes all required durable fields", () => {
  const models = readFileSync(join(repositoryRoot, "src/domain/models.ts"), "utf8");
  const storage = readFileSync(
    join(repositoryRoot, "src/storage/prototypeStorage.ts"),
    "utf8",
  );
  const requiredFields = [
    "participantId",
    "status",
    "startedAt",
    "completedAt",
    "currentQuestionIndex",
    "calibrationId",
    "semanticVersion",
    "frozenSourceHash",
    "participantResponses",
    "generatedProfile",
    "centralHypothesis",
    "supportingEvidence",
    "possibleDisconfirmingEvidence",
    "evidenceReferences",
    "confidenceLevel",
    "unknowns",
    "proposedExperiment",
    "importantDirectQuotes",
    "generationProvenance",
    "originalStructuredGenerationOutput",
    "numericalFeedback",
    "openEndedFeedback",
  ];

  for (const field of requiredFields) {
    assert.match(models, new RegExp(`\\b${field}\\??:`));
  }

  assert.match(storage, /calibrationSessions:\s*CalibrationSession\[\]/);
});

test("keeps both canonical artifacts present", () => {
  assert.equal(existsSync(markdownPath), true);
  assert.equal(existsSync(jsonPath), true);
});
