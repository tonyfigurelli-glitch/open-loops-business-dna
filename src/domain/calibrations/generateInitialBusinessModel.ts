import type {
  CalibrationEvidenceReference,
  CalibrationExperiment,
  CalibrationGenerationResult,
  CalibrationResponse,
} from "../models";
import { smallBusinessOwnerCalibration } from "./smallBusinessOwnerCalibration";
import { BUSINESS_PRACTICE_LIBRARY_VERSION } from "../businessPracticeLibrary";

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
  const inlineAnswer = (questionId: string) => answer(questionId).replace(/[.!?]+$/, "").trim();
  const businessDescription = answer("q01");
  const businessSentence = /[.!?]$/.test(businessDescription)
    ? businessDescription
    : `${businessDescription}.`;
  const teamDescription = /^just me$/i.test(inlineAnswer("q02"))
    ? "You currently operate on your own."
    : `Your team has ${inlineAnswer("q02").toLowerCase()}.`;
  const bodies = [
    `${businessSentence} ${teamDescription} You describe your role as “${inlineAnswer("q03")}”. Over the next 90 days, the outcome you most want is “${inlineAnswer("q04")}”.`,
    `You seem to draw energy from “${inlineAnswer("q09")}”. When priorities compete, your instinct is to protect ${inlineAnswer("q05").toLowerCase()}. Together, those answers suggest a leader who gains momentum by staying close to meaningful work and visible opportunity. The possible cost is that necessary work with less immediate energy may struggle to hold your attention.`,
    `A useful leverage point may be one small, protected action tied directly to “${inlineAnswer("q04")}”. The purpose is not to assume that “${inlineAnswer("q10")}” is the root problem. It is to learn whether that friction—or demand, pricing, staffing, capacity, sustainability, or something else—actually limits progress.`,
    `Your energy around “${inlineAnswer("q09")}” may be a real strength because it can sustain attention and commitment. The shadow of that strength is selective attention: less engaging but necessary work can be postponed even when it supports the outcome you want. Your principle that “${inlineAnswer("q12")}” offers a useful standard for deciding which work deserves protection.`,
    `Your answers point to a healthy tension between ${inlineAnswer("q05").toLowerCase()} and the legitimate needs on the other side of that choice. A similar tension surrounds ${inlineAnswer("q06").toLowerCase()}. Neither side is automatically right; the risk is allowing the tradeoff to remain unspoken, so priorities change without a clear reason.`,
    `You appear clear about the outcome you want. The respectful challenge is to test whether this week’s behavior creates evidence for that priority or simply preserves familiar activity. What is the smallest completed action that would teach you something new about the real constraint?`,
    `${proposedExperiment.action}\n\n${proposedExperiment.hypothesis} ${proposedExperiment.minimumDeliverable}`,
    `You may work best when the task connects to “${inlineAnswer("q09")}”, has a visible relationship to the 90-day priority, and reflects the conditions present when the business was operating well. Your belief that “${inlineAnswer("q12")}” can serve as a practical filter when urgent work competes with important work.`,
    unknowns.map((unknown) => `• ${unknown}`).join("\n"),
    "This is a starting point, not a final judgment. Future actions, outcomes, disagreements, and contradictions are all useful evidence. The seven-day experiment can strengthen, weaken, or redirect this first hypothesis so the model becomes more accurate and useful over time.",
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
    appliedPractices: [{
      practiceId: "measurable-priority",
      evidenceReferences: ["q04", "q08"].filter((questionId) =>
        evidenceReferences.some((reference) => reference.questionId === questionId)),
      inferredConnection: "The stated outcome and the current operating pattern may not yet share one observable definition of progress.",
      businessConsequence: "The business can remain active while learning too little about what actually moves the priority.",
      fitExplanation: "One small result measure can turn the next action into evidence rather than another general intention.",
      caution: "The measure must not hide profitability, sustainability, customer impact, or team strain.",
      whatWouldDisproveIt: "A clear measure already guides weekly choices and the outcome remains blocked for another identifiable reason.",
      experimentConnection: "The seven-day action records whether one observable step advances the priority and what actually blocks it.",
    }],
    managementLibraryVersion: BUSINESS_PRACTICE_LIBRARY_VERSION,
  };
}

function formatResponse(response: string | string[] | undefined) {
  if (!response) return "Not answered";
  const formatted = Array.isArray(response)
    ? response.filter((value) => value.trim()).join(", ")
    : response;
  return formatted.trim() ? formatted : "Not answered";
}
