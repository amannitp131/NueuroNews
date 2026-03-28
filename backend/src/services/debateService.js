import { generateText } from "./mistralService.js";
import { buildDebateModePrompt, buildDebateExchangePrompt } from "./promptTemplates.js";

export async function generateDebateMode({ article, profile }) {
  const prompt = buildDebateModePrompt({ article, profile });
  const raw = await generateText(prompt);

  const parsed = safeJsonParse(raw);
  return normalizeDebateMode(parsed, article, profile);
}

export async function generateDebateExchange({ article, userOpinion, previousExchanges = [] }) {
  const prompt = buildDebateExchangePrompt({ article, userOpinion, previousExchanges });
  const raw = await generateText(prompt);

  const parsed = safeJsonParse(raw);
  return normalizeDebateExchange(parsed);
}

function safeJsonParse(raw) {
  if (!raw || typeof raw !== "string") return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch (_secondError) {
      return null;
    }
  }
}

function normalizeDebateMode(payload, article, profile) {
  const topic = article?.title || "this market development";
  const primaryInterest = profile?.interests?.[0] || "this sector";

  const optimisticPoints =
    asStringArray(payload?.optimistic?.points, 3, 4) ||
    asStringArray(payload?.optimistic?.arguments, 3, 4) ||
    [
      "Execution momentum can convert current attention into sustained demand and better pricing power.",
      "If management delivers key milestones, earnings visibility may improve and reduce uncertainty discount.",
      "Adjacent ecosystems can benefit through supplier pull-through, distribution expansion, or complementary services."
    ];

  const pessimisticPoints =
    asStringArray(payload?.pessimistic?.points, 3, 4) ||
    asStringArray(payload?.pessimistic?.arguments, 3, 4) ||
    [
      "Current optimism may already be priced in, leaving limited upside if outcomes are only average.",
      "Any delay, cost overrun, or guidance reset could quickly compress sentiment and valuation multiples.",
      "External shocks such as policy changes or weaker demand can amplify downside beyond company-specific execution."
    ];

  const optimisticTitle = asString(payload?.optimistic?.title) || "Upside Through Execution";
  const optimisticBeneficiaries =
    asString(payload?.optimistic?.beneficiaries) ||
    `Beneficiaries could include well-positioned operators in ${primaryInterest}, efficient suppliers, and early adopters.`;

  const pessimisticTitle = asString(payload?.pessimistic?.title) || "Fragility Beneath Momentum";
  const pessimisticRisks =
    asString(payload?.pessimistic?.risks) ||
    "The main downside risks are execution misses, margin pressure, and policy or demand shocks; highly leveraged or late entrants may lose most.";

  const realityCheck =
    asString(payload?.realityCheck) ||
    `Both the upside and downside cases are plausible for ${topic}. The outcome depends on execution quality, demand durability, and policy or funding conditions over the next few quarters. Track guidance reliability, margin trend, and customer traction to confirm which path is winning.`;

  return {
    optimistic: {
      title: optimisticTitle,
      points: optimisticPoints,
      beneficiaries: optimisticBeneficiaries
    },
    pessimistic: {
      title: pessimisticTitle,
      points: pessimisticPoints,
      risks: pessimisticRisks
    },
    realityCheck
  };
}

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value, min = 1, max = 5) {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, max);

  if (normalized.length < min) return null;
  return normalized;
}

function normalizeDebateExchange(payload) {
  const title = asString(payload?.title) || "Counter-perspective";
  const counterPoints =
    asStringArray(payload?.counterPoints, 2, 4) ||
    asStringArray(payload?.points, 2, 4) || [
      "There is additional nuance to consider that shifts the analysis.",
      "The underlying assumptions may not hold under different conditions."
    ];

  const concessions =
    asStringArray(payload?.concessions, 1, 3) ||
    asStringArray(payload?.agreements, 1, 3) || [
      "Your observation about the initial trend has merit."
    ];

  return {
    title,
    counterPoints,
    concessions
  };
}
