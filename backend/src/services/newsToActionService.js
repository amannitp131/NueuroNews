import { generateText } from "./mistralService.js";
import { buildNewsToActionPrompt } from "./promptTemplates.js";

export async function generateNewsToActionPlan({ article, profile }) {
  const prompt = buildNewsToActionPrompt({ article, profile });
  const raw = await generateText(prompt);

  const parsed = safeJsonParse(raw);
  return normalizeActionPlan(parsed, article, profile);
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

function normalizeActionPlan(plan, article, profile) {
  const profession = profile?.profession || "professional";
  const interests = Array.isArray(profile?.interests) ? profile.interests.filter(Boolean) : [];
  const goals = Array.isArray(profile?.goals) ? profile.goals.filter(Boolean) : [];
  const primaryInterest = interests[0] || "your focus area";
  const primaryGoal = goals[0] || "your near-term objective";

  const urgencyLevel = normalizeUrgency(plan?.urgency || plan?.urgencyLevel);
  const timeHorizon = normalizeTimeHorizon(plan?.timeHorizon);

  const recommendedActions = asStringArray(plan?.actions || plan?.recommendedActions, 2, 4);
  const followUpSignals = asStringArray(plan?.signals || plan?.followUpSignals, 3, 5);

  const trigger =
    asString(plan?.trigger || plan?.decisionTrigger) ||
    `As a ${profession}, this development may quickly influence decisions tied to ${primaryInterest}.`;

  const actions =
    recommendedActions.length >= 2
      ? recommendedActions
      : [
          `Identify one concrete scenario where this news changes your approach to ${primaryInterest}.`,
          `Create a 30-day checkpoint tied to ${primaryGoal} and record whether this trend is strengthening.`,
          "List one downside risk and one upside opportunity before making your next move."
        ].slice(0, 3);

  const signals =
    followUpSignals.length >= 3
      ? followUpSignals
      : [
          `Any new announcements related to: ${article?.title?.slice(0, 80) || "this story"}`,
          `Movement from peers or competitors in ${primaryInterest}`,
          "Changes in regulatory, funding, or demand indicators over the next few weeks"
        ];

  return {
    trigger,
    actions,
    urgency: urgencyLevel,
    timeHorizon,
    signals,
    // Compatibility aliases for existing consumers.
    decisionTrigger: trigger,
    recommendedActions: actions,
    urgencyLevel,
    followUpSignals: signals
  };
}

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value, min, max) {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (normalized.length < min) return [];
  return normalized.slice(0, max);
}

function normalizeUrgency(value) {
  const map = {
    low: "Low",
    medium: "Medium",
    high: "High"
  };

  const key = String(value || "").trim().toLowerCase();
  return map[key] || "Medium";
}

function normalizeTimeHorizon(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "immediate") return "Immediate";
  if (key === "short-term" || key === "short term") return "Short-term";
  if (key === "long-term" || key === "long term") return "Long-term";
  return "Short-term";
}