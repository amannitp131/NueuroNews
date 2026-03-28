import { env } from "../config/env.js";
import { generateText, embedText } from "./geminiService.js";
import { queryVector, upsertVector } from "./vectorService.js";
import { chunkText } from "../utils/chunkText.js";
import { buildPersonalizedBriefingPrompt, buildRagAnswerPrompt } from "./promptTemplates.js";

export async function indexArticleForRag(article) {
  const chunks = chunkText(article.content, 220, 30);

  await Promise.all(
    chunks.map(async (chunk, idx) => {
      const vector = await embedText(chunk);
      await upsertVector({
        id: `${article._id}-chunk-${idx}`,
        values: vector,
        metadata: {
          articleId: String(article._id),
          title: article.title,
          chunk,
          publishedAt: article.publishedAt?.toISOString?.() || new Date().toISOString()
        }
      });
    })
  );
}

export async function personalizedSummary({ article, profile }) {
  const articleQuery = `${article.title}\n${article.content.slice(0, 1200)}`;
  const articleEmbedding = await embedText(articleQuery);
  const matches = await queryVector(articleEmbedding, env.topK);

  const retrievedContext = matches
    .map((m, i) => `Source ${i + 1}: ${m.metadata?.title || "Unknown"}\n${m.metadata?.chunk || ""}`)
    .join("\n\n");

  const prompt = buildPersonalizedBriefingPrompt({ article, profile, retrievedContext });
  const raw = await generateText(prompt);

  const structured = safeJsonParse(raw) || fallbackBriefing(raw, profile);
  const normalized = normalizeBriefing(structured, profile);

  return {
    ...normalized,
    retrievalSources: matches.map((m, idx) => ({
      rank: idx + 1,
      articleId: m.metadata?.articleId,
      title: m.metadata?.title,
      score: m.score
    }))
  };
}

export async function answerQuestionOverNews({ question, userContext }) {
  const queryEmbedding = await embedText(question);
  const matches = await queryVector(queryEmbedding, env.topK);

  const contextText = matches
    .map((m, index) => `Source ${index + 1}: ${m.metadata?.title || "Unknown"}\n${m.metadata?.chunk || ""}`)
    .join("\n\n");

  const prompt = buildRagAnswerPrompt({
    question,
    userContext,
    contextText
  });

  const answer = await generateText(prompt);

  return {
    answer,
    sources: matches.map((m, idx) => ({
      rank: idx + 1,
      articleId: m.metadata?.articleId,
      title: m.metadata?.title,
      score: m.score
    }))
  };
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

function fallbackBriefing(raw, profile) {
  return {
    personalizedSummary: raw,
    whyThisMattersToYou: buildFallbackPersonalImpact(profile),
    keyInsights: [
      `Aligned with user interests: ${(profile?.interests || []).join(", ") || "N/A"}`,
      "Evaluate the strategic signal against current market conditions.",
      "Track follow-on updates for confirmation or reversal."
    ],
    impactAnalysis: {
      shortTerm: "Possible immediate volatility depending on market reaction.",
      midTerm: "Watch for execution progress and sector-level spillover.",
      longTerm: "Potential structural impact if trend sustains across quarters."
    },
    predictions: [
      "Base case: gradual repricing as more data confirms trend.",
      "Risk case: narrative weakens if subsequent reports contradict this signal."
    ],
    followUpQuestions: [
      "What indicators should be monitored weekly?",
      "What could invalidate this thesis?",
      "Which peer companies are most affected?"
    ]
  };
}

function normalizeBriefing(structured = {}, profile = {}) {
  const normalized = {
    ...structured,
    whyThisMattersToYou: ensurePersonalImpact(structured?.whyThisMattersToYou, profile)
  };

  return normalized;
}

function ensurePersonalImpact(impactPoints, profile = {}) {
  const cleaned = Array.isArray(impactPoints)
    ? impactPoints
        .map((point) => (typeof point === "string" ? point.trim() : ""))
        .filter(Boolean)
    : [];

  if (cleaned.length >= 3) {
    return cleaned.slice(0, 5);
  }

  return buildFallbackPersonalImpact(profile);
}

function buildFallbackPersonalImpact(profile = {}) {
  const profession = profile?.profession || "professional";
  const firstInterest = (profile?.interests || [])[0] || "your focus areas";
  const firstGoal = (profile?.goals || [])[0] || "your long-term plan";

  return [
    `As a ${profession}, this could change which skills and decisions are most valuable over the next 6 months.`,
    `Given your interest in ${firstInterest}, track competitor moves and policy updates because both can shift outcomes quickly.`,
    `Use this as a near-term signal for ${firstGoal}: set one monthly checkpoint to validate whether this trend is strengthening or fading.`
  ];
}
