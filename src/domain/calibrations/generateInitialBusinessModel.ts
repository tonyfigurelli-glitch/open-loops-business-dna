import type {
  CalibrationEvidenceReference,
  CalibrationExperiment,
  CalibrationGenerationResult,
  CalibrationResponse,
} from "../models";
import { smallBusinessOwnerCalibration } from "./smallBusinessOwnerCalibration";
import { BUSINESS_PRACTICE_LIBRARY_VERSION } from "../businessPracticeLibrary";

type AnswerMap = Map<string, string>;

export function generateInitialBusinessModel(
  responses: CalibrationResponse[],
): CalibrationGenerationResult {
  const answers = new Map(
    responses.map((response) => [response.questionId, formatResponse(response.response)]),
  );
  const answer = (questionId: string) => answers.get(questionId) ?? "";
  const evidenceReferences: CalibrationEvidenceReference[] = responses.flatMap((response) => {
    const summary = formatResponse(response.response);
    return summary
      ? [{ questionId: response.questionId, classification: "direct_statement", summary }]
      : [];
  });
  const supportingEvidence = evidenceReferences.filter((reference) =>
    ["q03", "q04", "q05", "q06", "q07", "q08", "q09", "q11"].includes(reference.questionId),
  );
  const confidenceLevel = independentAnswerCount(answers) >= 6 ? "medium" : "low";
  const signals = deriveSignals(answers);
  const unknowns = deriveUnknowns(signals);
  const containsHealthcareContent = [...answers.values()].some((value) =>
    /\b(?:medical|medicine|medication|dosage|dose|clinical|patient|diagnos\w*|prescri\w*|treatment|therapy|healthcare)\b/i.test(value),
  );
  const proposedExperiment = buildExperiment(signals, containsHealthcareContent);
  const bodies = buildNarrative(signals, unknowns, proposedExperiment);
  const sections = smallBusinessOwnerCalibration.profile_output.sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    body: bodies[index] ?? "There is not enough evidence yet to make this part useful.",
  }));

  const hypothesisCore = signals.compoundPriority
    ? "The immediate constraint may be a sequencing problem: the commercial result and the team-capability result are both important, but neither has been made the explicit lead outcome."
    : signals.ideaSurplus
      ? "The immediate constraint may be selection and follow-through rather than a shortage of opportunity."
      : "The immediate constraint may be the absence of one observable weekly result that connects owner attention, team ownership, and the 90-day priority.";
  const centralHypothesis = `${hypothesisCore} The avoided activity is not a selected root constraint.`;

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
    possibleDisconfirmingEvidence: [
      "The team may already have clear ownership and operate independently of the owner.",
      "Market demand, pricing, cost structure, staffing, capacity, or sustainability may outweigh the attention and sequencing pattern described here.",
      "The named avoided activity may not constrain the current priority; it may be inconvenient without being causal.",
      "Contradictory or ambiguous participant answers may weaken the working hypothesis.",
      "A week of observed behavior may show that execution is already focused and the actual blockage lies elsewhere.",
    ],
    confidenceLevel,
    unknowns,
    importantDirectQuotes: [],
    proposedExperiment,
    appliedPractices: [{
      practiceId: signals.ideaSurplus ? "focus-on-contribution" : "measurable-priority",
      evidenceReferences: ["q03", "q04", "q08"].filter((questionId) => Boolean(answer(questionId))),
      inferredConnection: centralHypothesis,
      businessConsequence: signals.compoundPriority
        ? "Sales activity, profitability work, and team development can all remain busy without one of them becoming the leading result."
        : "The business can stay active while producing too little evidence about what actually moves the priority.",
      fitExplanation: "A single weekly result would convert the next action into evidence and clarify what deserves owner and team attention.",
      caution: "The measure must preserve profitability, customer impact, sustainability, and team capacity rather than reward activity alone.",
      whatWouldDisproveIt: "Weekly choices may already be guided by a clear result, with progress blocked by a different verified constraint.",
      experimentConnection: "The seven-day test assigns one behavior, one owner, and one result to observe before expanding the approach.",
    }],
    managementLibraryVersion: BUSINESS_PRACTICE_LIBRARY_VERSION,
  };
}

type Signals = ReturnType<typeof deriveSignals>;

function deriveSignals(answers: AnswerMap) {
  const combined = [...answers.values()].join(" ").toLowerCase();
  const priority = (answers.get("q04") ?? "").toLowerCase();
  const energy = (answers.get("q09") ?? "").toLowerCase();
  const bestConditions = (answers.get("q11") ?? "").toLowerCase();
  const principle = (answers.get("q12") ?? "").toLowerCase();
  const role = answers.get("q03") ?? "";
  const size = answers.get("q02") ?? "";
  const customerWords = /\b(?:customer|customers|guest|guests|client|clients|patient|patients|buyer|buyers)\b/i;
  const teamWords = /\b(?:team|staff|employee|employees|people|leader|leaders|manager|managers|motivat|train|trained|training)\w*\b/i;
  const commercialWords = /\b(?:sale|sales|revenue|profit|profitability|margin|growth|bookings?|occupancy|orders?|catering|pipeline)\b/i;
  const systemsWords = /\b(?:system|systems|process|processes|workflow|operations?|efficien|standard|procedure|account|bookkeep)\w*\b/i;
  const commercialPriority = commercialWords.test(priority);
  const teamPriority = teamWords.test(priority);

  return {
    enoughEvidence: independentAnswerCount(answers) >= 6,
    ownerSpansRoles: /does a little of everything/i.test(role),
    hasTeam: !/^just me$/i.test(size) && Boolean(size),
    growthFirst: /growth and opportunity/i.test(answers.get("q05") ?? ""),
    customerFirst: /customer experience/i.test(answers.get("q06") ?? ""),
    actsThenAdjusts: /act when i have enough information/i.test(answers.get("q07") ?? ""),
    ideaSurplus: /more ideas than we can execute/i.test(answers.get("q08") ?? ""),
    executionSurplus: /execute consistently but may not generate enough/i.test(answers.get("q08") ?? ""),
    balancedExecution: /reasonably balanced/i.test(answers.get("q08") ?? ""),
    humanEnergy: customerWords.test(energy) || teamWords.test(energy),
    customerEnergy: customerWords.test(energy),
    teamEnergy: teamWords.test(energy),
    systemEnergy: systemsWords.test(energy),
    commerciallyOriented: commercialPriority || commercialWords.test(combined),
    commercialPriority,
    teamPriority,
    compoundPriority: commercialPriority && teamPriority,
    customerPrinciple: customerWords.test(principle),
    strongConditionsIncludeClarity: /\b(?:clear|clarity|focus|priorit|aligned|ownership|accountab)\w*\b/i.test(bestConditions),
    strongConditionsIncludeDemand: /\b(?:demand|busy|customer|guest|sales|revenue|bookings?|orders?)\b/i.test(bestConditions),
    strongConditionsIncludeTeam: teamWords.test(bestConditions),
    businessIsHospitality: /\b(?:restaurant|hotel|hospitality|bar|cafe|bakery|guest|guests)\b/i.test(combined),
  };
}

function buildNarrative(
  signals: Signals,
  unknowns: string[],
  experiment: CalibrationExperiment,
) {
  if (!signals.enoughEvidence) {
    return [
      "There is enough context to begin, but not enough independent evidence to describe the business without simply repeating what you entered.",
      "No reliable cross-answer pattern can be established yet.",
      "The first useful step is to define one observable result and watch what helps or prevents it.",
      "A real strength-and-shadow pattern requires more behavioral evidence than is currently available.",
      "The competing demands on the business are not yet clear enough to name responsibly.",
      "The respectful challenge is to gather evidence before accepting a polished explanation.",
      `${experiment.action} ${experiment.hypothesis}`,
      "A short review rhythm and one observable result will make the next interpretation more useful.",
      unknowns.map((unknown) => `• ${unknown}`).join("\n"),
      "Continuing will matter only if later behavior and results add evidence that can confirm or overturn this first model.",
    ];
  }

  const businessView = signals.ownerSpansRoles && signals.hasTeam
    ? "This appears to be a business with a team, but with an owner role that still crosses delivery, people, opportunity, and daily operations. That breadth can make the owner highly informed while also making priorities dependent on where the owner directs attention each day."
    : signals.hasTeam
      ? "This appears to be a team-based business in which the owner still influences both direction and execution. The important question is whether that influence is being converted into clear ownership beyond the owner."
      : "This appears to be an owner-led business in which attention is the scarcest operating resource. Progress will depend less on adding activity than on protecting the few actions that produce learning and results.";

  const pattern = signals.ideaSurplus && signals.growthFirst
    ? `The pattern is not a shortage of ambition or opportunity. It is a selection problem: new possibilities can arrive faster than the business can turn them into consistent results.${signals.actsThenAdjusts ? " A willingness to act supports momentum, but it can also let the next promising idea compete with work that has not yet been standardized." : ""}`
    : signals.humanEnergy && signals.customerFirst
      ? "You appear to use visible human response as an important signal of whether the business is working. That can keep the company close to customers and the team, but quieter indicators such as margin, consistency, and process health may receive attention later."
      : "The emerging pattern is a gap between stated direction and the weekly mechanism that would turn it into evidence. The business may know what matters in broad terms without yet having one result that organizes day-to-day choices.";

  const leverage = signals.compoundPriority
    ? "The 90-day objective contains at least two different jobs: improve the economic result and strengthen the team’s ability to produce it. The leverage point is to decide which one leads, then connect the other to it through a single weekly measure and a named owner."
    : signals.ideaSurplus
      ? "The strongest leverage point is a deliberate stop rule: one opportunity receives a protected test, while competing ideas wait. This would reveal whether focus—not opportunity—is the current constraint."
      : "The strongest leverage point is to translate the 90-day direction into one observable weekly result, assign ownership, and use it to decide what receives attention and what waits.";

  const strengthShadow = signals.humanEnergy
    ? `Your likely strength is creating energy through direct contact with the people the business serves and the people doing the work. The shadow is that momentum may become owner-mediated: customers and team members respond when you are present, but the same standard may be less consistent when you are not.${signals.ownerSpansRoles ? " A broad owner role increases that risk because inspiration, correction, and follow-through can all return to the same person." : ""}`
    : signals.systemEnergy
      ? "Your likely strength is seeing how work can become more reliable through structure. The shadow is that improving the mechanism can consume attention before the business has verified which result the mechanism must improve."
      : "Your likely strength is maintaining momentum across several kinds of work. The shadow is diffusion: versatility can keep the business moving while making it difficult to see which responsibility should no longer depend on the owner.";

  const tension = signals.growthFirst && signals.customerFirst
    ? "The central tension is between pursuing opportunity and building the internal discipline needed to deliver it profitably and consistently. Protecting the customer can strengthen loyalty, but if every accommodation creates operational variation, growth can increase strain instead of leverage."
    : signals.growthFirst
      ? "The central tension is between speed toward opportunity and the stability required to absorb growth. The issue is not choosing one forever; it is making the cost of each growth decision visible before the business takes on more than it can repeat well."
      : "The central tension is between protecting what already works and creating enough room to test what might work better. Too much protection can postpone learning; too much change can weaken the core business.";

  const challenge = signals.compoundPriority
    ? "Do not allow commercial improvement and team development to remain two equally broad promises. Choose the leading result for the next seven days and require the second goal to support it in a visible way."
    : signals.ideaSurplus
      ? "For one week, treat every new idea as a request to displace something already chosen. If nothing is displaced, the idea is recorded rather than started."
      : "Replace one broad intention with a result that another person could observe without asking the owner whether progress occurred.";

  const operatingBest = [
    signals.humanEnergy ? "short feedback loops with customers and team members" : "a visible link between effort and result",
    signals.strongConditionsIncludeClarity ? "clear priorities and ownership" : "one protected priority",
    signals.strongConditionsIncludeDemand ? "real market response" : "observable operating evidence",
  ];

  return [
    businessView,
    pattern,
    leverage,
    strengthShadow,
    tension,
    challenge,
    `${experiment.action} ${experiment.hypothesis}`,
    `You are likely to operate best with ${operatingBest[0]}, ${operatingBest[1]}, and ${operatingBest[2]}. A brief weekly review should ask what moved, what resisted, and what should stop—not simply what everyone completed.`,
    unknowns.map((unknown) => `• ${unknown}`).join("\n"),
    "The value of continuing is not a more detailed personality description. It is the ability to compare this first hypothesis with actual decisions, team behavior, customer response, and financial results—then keep what proves useful and discard what does not.",
  ];
}

function buildExperiment(signals: Signals, healthcare: boolean): CalibrationExperiment {
  if (healthcare) {
    return {
      action: "Do not use this calibration for a clinical decision. Select one non-clinical business workflow, assign one observable result, and record what helps or blocks it for seven days.",
      hypothesis: "A bounded operational observation can generate useful business evidence without crossing into clinical advice.",
      minimumDeliverable: "Complete one non-clinical observation and record the result.",
      owner: "Owner, with shared ownership where appropriate",
      likelyObstacle: "Urgent work may displace the observation.",
      supportThatMayHelp: "Schedule the review and identify one person who can verify the result.",
      resultToRecord: "The observed business-process result and any operational resistance.",
      whatResultWouldTeach: "Whether the selected workflow is relevant to the current business priority.",
    };
  }

  const customerWord = signals.businessIsHospitality ? "guest" : "customer";
  const action = signals.compoundPriority
    ? `Choose one repeatable ${customerWord}-facing behavior that could improve a profitable sale. Teach it to one team member, make that person the owner for seven days, and track use, response, and economic effect each day.`
    : signals.ideaSurplus
      ? "Choose one current opportunity and define the smallest test that could produce a yes-or-no learning result within seven days. Record every new idea without starting it during the test."
      : "Choose one action tied to the 90-day direction, assign one observable result and one owner, and review the result after seven days.";
  const hypothesis = signals.compoundPriority
    ? "If one commercial behavior can be taught, owned, and measured beyond the owner, then sales improvement and team development can reinforce each other rather than compete."
    : signals.ideaSurplus
      ? "If selection is the constraint, protecting one test should produce more useful learning than beginning several opportunities."
      : "A completed, measured action will show whether focus and ownership are the constraint or whether another business condition is more limiting.";

  return {
    action,
    hypothesis,
    minimumDeliverable: "Complete the bounded test and record the agreed result for seven days.",
    owner: signals.hasTeam ? "One named team member, with the owner observing rather than reclaiming the work" : "Owner",
    likelyObstacle: signals.ideaSurplus ? "A new opportunity may displace the chosen test." : "Urgent daily work may displace the chosen action.",
    supportThatMayHelp: "Use a one-page tally and a five-minute daily check rather than adding a large management system.",
    resultToRecord: "What was attempted, how often it occurred, the customer or operating response, and any effect on revenue, margin, quality, or team capacity.",
    whatResultWouldTeach: "Whether the behavior is repeatable, whether ownership can extend beyond the owner, and which constraint should be tested next.",
  };
}

function deriveUnknowns(signals: Signals) {
  const items = [
    "Whether demand, pricing, cost structure, capacity, or execution is the primary economic constraint.",
    signals.hasTeam
      ? "Whether team members have clear authority and can sustain the desired standard without the owner present."
      : "Which work could eventually be transferred without weakening quality or trust.",
    "Whether the current 90-day direction has one observable measure that already guides weekly choices.",
  ];
  if (signals.compoundPriority) {
    items.push("Whether team development leads the commercial result, follows it, or needs a separate sequence.");
  }
  return items;
}

function independentAnswerCount(answers: AnswerMap) {
  return [...answers.values()].filter(Boolean).length;
}

function formatResponse(response: string | string[] | undefined) {
  if (!response) return "";
  const formatted = Array.isArray(response)
    ? response.filter((value) => value.trim()).join(", ")
    : response;
  return formatted.trim();
}
