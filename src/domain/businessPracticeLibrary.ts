export const BUSINESS_PRACTICE_LIBRARY_VERSION = "business_dna_foundational_management_library@1.0.0";

export type BusinessPractice = {
  id: string;
  name: string;
  sourceIds: string[];
  principle: string;
  useWhen: string[];
  questionsBeforeApplying: string[];
  smallBusinessAdaptation: string;
  cautions: string[];
  experimentPattern: string;
};

export const businessPracticeSources = [
  { id: "drucker-effective-executive", title: "The Effective Executive", author: "Peter Drucker" },
  { id: "collins-good-to-great", title: "Good to Great", author: "Jim Collins" },
  { id: "horowitz-hard-thing", title: "The Hard Thing About Hard Things", author: "Ben Horowitz" },
  { id: "grove-high-output", title: "High Output Management", author: "Andy Grove" },
  { id: "sinek-start-with-why", title: "Start with Why", author: "Simon Sinek" },
  { id: "scott-radical-candor", title: "Radical Candor", author: "Kim Scott" },
  { id: "lencioni-five-dysfunctions", title: "The Five Dysfunctions of a Team", author: "Patrick Lencioni" },
  { id: "wiseman-multipliers", title: "Multipliers", author: "Liz Wiseman" },
  { id: "doerr-measure-what-matters", title: "Measure What Matters", author: "John Doerr" },
  { id: "christensen-innovators-dilemma", title: "The Innovator’s Dilemma", author: "Clayton Christensen" },
  { id: "lafley-martin-playing-to-win", title: "Playing to Win", author: "A.G. Lafley and Roger Martin" },
] as const;

export const businessPractices: BusinessPractice[] = [
  {
    id: "focus-on-contribution",
    name: "Focus executive attention on contribution",
    sourceIds: ["drucker-effective-executive"],
    principle: "Protect the few uses of executive attention that make a meaningful contribution to results.",
    useWhen: ["Too many priorities compete for owner attention.", "Urgency repeatedly displaces important work."],
    questionsBeforeApplying: ["Which result matters most now?", "What work can only the owner do?"],
    smallBusinessAdaptation: "Choose one weekly result and one protected block instead of installing a large planning system.",
    cautions: ["Focus must not become neglect of cash, safety, legal, or urgent customer obligations."],
    experimentPattern: "Protect one short block for the highest-contribution action and record what displaced it or changed because it happened.",
  },
  {
    id: "managerial-leverage",
    name: "Increase managerial leverage",
    sourceIds: ["grove-high-output", "wiseman-multipliers"],
    principle: "Improve the output of the team by clarifying ownership, enabling judgment, and avoiding unnecessary owner bottlenecks.",
    useWhen: ["Decisions accumulate with one person.", "Team capability is present but underused."],
    questionsBeforeApplying: ["Is the constraint authority, clarity, skill, or trust?", "Would delegation create unacceptable risk here?"],
    smallBusinessAdaptation: "Transfer one bounded recurring decision with a clear outcome and check-in point.",
    cautions: ["Do not prescribe delegation merely because the founder is involved.", "Crisis and regulated work may require tighter control."],
    experimentPattern: "Assign one bounded decision to another person, define the expected outcome, and observe whether the owner takes it back.",
  },
  {
    id: "face-the-hard-reality",
    name: "Face the hard reality without losing direction",
    sourceIds: ["collins-good-to-great", "horowitz-hard-thing"],
    principle: "Name difficult facts directly while preserving the discipline to act on what the business can still influence.",
    useWhen: ["A painful decision is being postponed.", "Optimistic language is obscuring operating evidence."],
    questionsBeforeApplying: ["Which fact is verified?", "What decision changes if the fact is accepted?"],
    smallBusinessAdaptation: "Write down one uncomfortable verified fact, one unknown, and one reversible response.",
    cautions: ["Candor is not certainty; separate verified facts from interpretation."],
    experimentPattern: "Test one consequence of the difficult fact through a reversible action and record whether the expected resistance appears.",
  },
  {
    id: "purpose-behavior-alignment",
    name: "Align daily choices with purpose",
    sourceIds: ["sinek-start-with-why"],
    principle: "Use the business purpose as a decision filter, then examine whether actual choices support or undermine it.",
    useWhen: ["The stated purpose and operating behavior appear misaligned.", "Competing priorities lack a stable decision rule."],
    questionsBeforeApplying: ["Is the purpose specific enough to guide a tradeoff?", "Which recent choice best tests the claimed purpose?"],
    smallBusinessAdaptation: "Apply the stated purpose to one live tradeoff rather than launching a mission-statement exercise.",
    cautions: ["Purpose cannot replace economics, capability, or evidence."],
    experimentPattern: "Use the purpose to decide one live tradeoff and record both the result and the cost of the choice.",
  },
  {
    id: "care-with-clarity",
    name: "Combine care with direct clarity",
    sourceIds: ["scott-radical-candor", "lencioni-five-dysfunctions"],
    principle: "Protect relationships by making expectations, disagreement, and accountability discussable rather than vague.",
    useWhen: ["Relationship protection may be weakening accountability.", "Unspoken conflict is affecting execution."],
    questionsBeforeApplying: ["Is the standard clear?", "Is there enough trust for direct feedback?", "Has the other person had a fair chance to respond?"],
    smallBusinessAdaptation: "Hold one brief conversation that separates respect for the person from clarity about the expected result.",
    cautions: ["Directness without trust or specificity can become aggression."],
    experimentPattern: "Clarify one expectation, ask the other person to restate it, and review the observable result within seven days.",
  },
  {
    id: "measurable-priority",
    name: "Turn priority into a measurable result",
    sourceIds: ["doerr-measure-what-matters", "drucker-effective-executive"],
    principle: "Translate an important direction into a small number of observable outcomes without confusing activity with progress.",
    useWhen: ["A goal is broad or inspirational but not observable.", "Many activities compete without a shared definition of progress."],
    questionsBeforeApplying: ["What outcome would be visibly different?", "Could the metric be gamed or distort the real objective?"],
    smallBusinessAdaptation: "Use one outcome and one or two indicators for the next seven to ninety days.",
    cautions: ["A metric is evidence, not the purpose itself."],
    experimentPattern: "Define one observable result for the priority, take one action, and record movement plus any unintended effect.",
  },
  {
    id: "make-strategic-choices",
    name: "Make an integrated set of strategic choices",
    sourceIds: ["lafley-martin-playing-to-win"],
    principle: "Strategy requires explicit choices about where to play, how to win, and what the business will not pursue now.",
    useWhen: ["The business is pursuing too many markets or offers.", "Growth is named without a clear competitive choice."],
    questionsBeforeApplying: ["Which customer and need are being chosen?", "What will the business stop or defer?", "What capability makes the choice credible?"],
    smallBusinessAdaptation: "Test one customer-offer choice before building a complete strategy process.",
    cautions: ["A choice is not a strategy unless capabilities and economics can support it."],
    experimentPattern: "Choose one customer-offer combination, run a small market test, and compare response with the leading alternative.",
  },
  {
    id: "protect-learning-from-core-demands",
    name: "Protect learning from the demands of the core business",
    sourceIds: ["christensen-innovators-dilemma"],
    principle: "Evaluate emerging opportunities with learning measures suited to uncertainty rather than only the standards of the established business.",
    useWhen: ["Current success crowds out small experiments.", "A new opportunity is judged only by near-term core-business economics."],
    questionsBeforeApplying: ["What must be learned before scaling?", "Can the experiment remain small and reversible?"],
    smallBusinessAdaptation: "Ring-fence a very small learning test with a fixed time and cost limit.",
    cautions: ["Not every new idea deserves protection; define a learning question and stop condition."],
    experimentPattern: "Run the smallest bounded test that answers one uncertainty and decide in advance what evidence would stop it.",
  },
];

export const businessPracticeById = new Map(
  businessPractices.map((practice) => [practice.id, practice]),
);

export function serializeBusinessPracticeLibraryForPrompt() {
  return JSON.stringify({
    version: BUSINESS_PRACTICE_LIBRARY_VERSION,
    sources: businessPracticeSources,
    practices: businessPractices,
  });
}
