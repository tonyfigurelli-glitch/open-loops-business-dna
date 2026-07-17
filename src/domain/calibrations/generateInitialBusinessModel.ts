import type {
  CalibrationEvidenceReference,
  CalibrationExperiment,
  CalibrationGenerationResult,
  CalibrationResponse,
} from "../models";
import { smallBusinessOwnerCalibration } from "./smallBusinessOwnerCalibration";

export function generateInitialBusinessModel(
  responses: CalibrationResponse[],
): CalibrationGenerationResult {
  const answer = (questionId: string) =>
    formatResponse(responses.find((response) => response.questionId === questionId)?.response);
  const evidenceReferences: CalibrationEvidenceReference[] = responses.flatMap((response) => {
    const summary = formatResponse(response.response);
    return summary === "Not answered"
      ? []
      : [{ questionId: response.questionId, classification: "direct_statement", summary }];
  });
  const supportingEvidence = evidenceReferences.filter((reference) =>
    ["q04", "q08", "q10"].includes(reference.questionId),
  );
  const confidenceLevel = supportingEvidence.length >= 2 ? "medium" : "low";
  const confidenceLabel = confidenceLevel === "medium" ? "Moderate" : "Low";
  const unknowns = [
    "Whether demand, pricing, cash flow, capacity, positioning, sustainability, or owner energy is the primary constraint.",
    "How the team experiences the owner’s current role and priorities.",
    "Which observed outcomes support or contradict this first working model.",
  ];
  const containsHealthcareContent = responses.some((response) =>
    /\b(?:medical|medicine|medication|dosage|dose|clinical|patient|diagnos\w*|prescri\w*|treatment|therapy|healthcare)\b/i.test(
      formatResponse(response.response),
    ),
  );
  const proposedExperiment: CalibrationExperiment = {
    action: containsHealthcareContent
      ? "Do not use this calibration to make clinical or healthcare decisions. Choose one non-clinical business-process observation related to the 90-day priority and record which operational constraint appears."
      : `Choose one small, reversible action that advances “${answer("q04")}” and record whether “${answer("q10")}” or another constraint affects the result.`,
    hypothesis: containsHealthcareContent
      ? "A non-clinical observation can generate business evidence without recommending medical action."
      : "A small completed action will reveal whether the named friction or an alternative constraint meaningfully affects the current priority.",
    minimumDeliverable: "Complete one observable action within seven days and record what happened.",
    owner: "Owner, with shared ownership where appropriate",
    likelyObstacle: "The action may be displaced by urgent day-to-day work.",
    supportThatMayHelp: "Schedule the smallest action and name one person who can observe the result.",
    resultToRecord: "What was attempted, what changed, what resisted the change, and whether the 90-day priority moved forward.",
    whatResultWouldTeach: "The result will strengthen, weaken, or redirect the working constraint hypothesis.",
  };
  const bodies = [
    `${answer("q01")} The business currently includes ${answer("q02").toLowerCase()}. The owner describes their role as ${answer("q03").toLowerCase()} and names “${answer("q04")}” as the primary 90-day outcome. Strong operating conditions were described this way: ${answer("q11")}`,
    `Here is the story I’m beginning to tell myself about you: you draw energy from ${answer("q09").toLowerCase()} and tend to orient first toward ${answer("q05").toLowerCase()}. That may be a useful source of momentum. A possible hidden cost is that opportunity and attention may compete when execution capacity is limited. This is a working story, not a conclusion.`,
    `One leverage point worth testing is whether a small, protected action on the 90-day priority can move forward while observing whether the friction around “${answer("q10")}” actually constrains it. This does not assume the avoided activity is the root constraint. The hypothesis would weaken if demand, pricing, profitability, staffing, capacity, sustainability, or another unmeasured factor proves more limiting.`,
    `Your strength: energy around ${answer("q09").toLowerCase()}. How it helps the business: it indicates work that may sustain attention and commitment. Its possible shadow: a strength can attract attention away from less energizing but necessary work. Where I see evidence: the stated source of energy and the principle “${answer("q12")}.” Confidence: ${confidenceLabel}.`,
    `On one side: ${answer("q05")}. On the other side: the competing need implied by that tradeoff. Why both matter: the business needs direction without losing resilience. A second tension appears between ${answer("q06").toLowerCase()} and its valid counterpart. If these tensions remain implicit, priorities may shift without a clear reason.`,
    `You appear clear about the outcome you want. The respectful challenge is to test whether present behavior is creating evidence for that priority or merely preserving familiar activity. What is the smallest completed action this week that would tell you something new about the real constraint?`,
    `Experiment: ${proposedExperiment.action} Hypothesis being tested: ${proposedExperiment.hypothesis} Minimum deliverable: ${proposedExperiment.minimumDeliverable} Who should own it: ${proposedExperiment.owner}. What result to record: ${proposedExperiment.resultToRecord}`,
    `Likely supportive conditions include work connected to ${answer("q09").toLowerCase()}, the operating conditions described in the strongest period, a visible link to the 90-day priority, and continued attention to the principle “${answer("q12")}.”`,
    unknowns.map((unknown) => `• ${unknown}`).join("\n"),
    "This model is provisional. Future actions, outcomes, disagreements, and contradictions are useful evidence. The seven-day experiment can strengthen, weaken, or redirect the current hypothesis. The purpose is to become more useful and accurate over time, not to make a final judgment after twelve answers.",
  ];
  const sections = smallBusinessOwnerCalibration.profile_output.sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    body: bodies[index] ?? "Not enough evidence yet.",
  }));

  const centralHypothesis = "A small action tied to the stated 90-day priority can test which constraint matters; the named friction is one possibility, not a selected root constraint.";
  const possibleDisconfirmingEvidence = [
    "The named avoided activity may not constrain the 90-day priority.",
    "Demand, pricing, profitability, staffing, capacity, positioning, sustainability, or owner energy may be more limiting.",
    "Contradictory or ambiguous participant answers may weaken the working hypothesis.",
    "The seven-day action may produce no observable movement in the priority.",
  ];
  const importantDirectQuotes = [answer("q04"), answer("q09"), answer("q12")].filter(
    (quote) => quote !== "Not answered",
  );

  return {
    generatedProfile: {
      generatedAt: new Date().toISOString(),
      participantFacingProfile: sections
        .map((section) => `${section.title}\n${section.body}`)
        .join("\n\n"),
      sections,
    },
    centralHypothesis,
    evidenceReferences,
    supportingEvidence,
    possibleDisconfirmingEvidence,
    confidenceLevel,
    unknowns,
    importantDirectQuotes,
    proposedExperiment,
  };
}

function formatResponse(response: string | string[] | undefined) {
  if (!response) return "Not answered";
  const formatted = Array.isArray(response)
    ? response.filter((value) => value.trim()).join(", ")
    : response;
  return formatted.trim() ? formatted : "Not answered";
}
