import { generateText } from "./mistralService.js";
import { buildPredictionPrompt } from "./promptTemplates.js";
import { extractEntities, scoreSentiment } from "../utils/nlp.js";
import { Article } from "../models/Article.js";

export async function generatePrediction({ article }) {
  const ruleSignals = buildRuleSignals(article);
  const matchedPatterns = await matchPatternsFromDb(article);

  const prompt = buildPredictionPrompt({
    article,
    matchedPatterns,
    ruleSignals
  });

  const llmRaw = await generateText(prompt);
  const llmParsed = safeJsonParse(llmRaw);

  const fallback = buildFallbackPrediction({ article, matchedPatterns, ruleSignals });
  const result = llmParsed ? mergeWithRuleConfidence(llmParsed, fallback) : fallback;

  return {
    ...result,
    ruleSignals,
    matchedPatterns
  };
}

function buildRuleSignals(article) {
  const text = `${article.title || ""} ${article.content || ""}`;
  const sentiment = scoreSentiment(text);
  const entities = extractEntities(text, 12);

  const momentum = sentiment >= 2 ? "positive" : sentiment <= -2 ? "negative" : "mixed";
  const riskFlags = ["lawsuit", "probe", "decline", "cut", "downturn"].filter((token) => text.toLowerCase().includes(token));

  return {
    sentimentScore: sentiment,
    momentum,
    riskFlags,
    entityCount: entities.length,
    entities
  };
}

async function matchPatternsFromDb(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tokens = extractTokens(text);

  const historical = await Article.find({
    source: /Economic Times/i,
    title: { $ne: article.title }
  })
    .sort({ publishedAt: -1 })
    .limit(300)
    .lean();

  if (!historical.length) return [];

  const ranked = historical
    .map((item) => {
      const candidateText = `${item.title || ""} ${item.content || ""}`.toLowerCase();
      const candidateTokens = extractTokens(candidateText);
      const overlap = intersectionCount(tokens, candidateTokens);
      const denominator = Math.max(tokens.size, 1);
      const score = overlap / denominator;

      return {
        item,
        overlap,
        score
      };
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  if (!ranked.length) return [];

  return buildDynamicPatterns(ranked);
}

function buildFallbackPrediction({ article, matchedPatterns, ruleSignals }) {
  const baseConfidence = matchedPatterns.length
    ? avg(matchedPatterns.map((item) => item.baseConfidence || 0.6))
    : 0.55;

  const sentimentAdjustment = ruleSignals.sentimentScore >= 2 ? 0.06 : ruleSignals.sentimentScore <= -2 ? -0.04 : 0;
  const riskAdjustment = Math.min(0.08, (ruleSignals.riskFlags || []).length * 0.02);
  const confidenceScore = clamp(baseConfidence + sentimentAdjustment - riskAdjustment, 0.3, 0.92);

  const outcomes = matchedPatterns.length
    ? matchedPatterns.map((pattern, idx) => ({
        scenario: pattern.typicalOutcomes[0] || `${pattern.label} continuation scenario`,
        timeHorizon: idx === 0 ? "1-3 months" : idx === 1 ? "1-4 weeks" : "6-12 months",
        probability: Number((0.45 - idx * 0.1).toFixed(2)),
        rationale: `Pattern match: ${pattern.label} (${pattern.keywordHits} keyword hits).`
      }))
    : [
        {
          scenario: "Base case: market digests news with moderate sector rotation",
          timeHorizon: "1-3 months",
          probability: 0.42,
          rationale: "No strong historical pattern match; using neutral baseline."
        }
      ];

  const impactLevel = matchedPatterns.some((item) => item.marketImpact === "high") ? "high" : "medium";

  return {
    possibleFutureOutcomes: outcomes,
    marketImpact: {
      overall: impactLevel,
      sectorsLikelyUp: inferUpSectors(article),
      sectorsLikelyDown: inferDownSectors(ruleSignals),
      volatilityOutlook: ruleSignals.riskFlags.length
        ? "Elevated volatility likely due to identified risk signals."
        : "Moderate volatility with event-driven moves."
    },
    confidenceLevel: {
      score: Number(confidenceScore.toFixed(2)),
      label: confidenceScore >= 0.75 ? "high" : confidenceScore >= 0.55 ? "medium" : "low",
      explanation: "Confidence combines pattern overlap, sentiment strength, and risk-flag penalties."
    },
    watchSignals: [
      "Management guidance revisions and consensus estimate changes",
      "Volume and volatility behavior in related sector indices",
      "Policy/regulatory updates affecting the underlying theme"
    ]
  };
}

function buildDynamicPatterns(rankedRows) {
  const groups = new Map();

  for (const row of rankedRows) {
    const keywords = extractTopKeywords(`${row.item.title || ""} ${row.item.content || ""}`);
    const key = keywords.slice(0, 3).join("-") || "market-pattern";

    if (!groups.has(key)) {
      groups.set(key, {
        id: `et-${key}`,
        label: `Economic Times pattern: ${keywords.slice(0, 2).join(" / ") || "market theme"}`,
        keywords,
        marketImpact: Math.abs(row.item.sentimentScore || 0) >= 2 ? "high" : "medium",
        baseConfidence: clamp(0.55 + row.score * 0.4, 0.4, 0.9),
        samples: [],
        score: 0
      });
    }

    const group = groups.get(key);
    group.samples.push(row.item);
    group.score = Math.max(group.score, row.score);
  }

  return [...groups.values()]
    .map((group) => {
      const sample = group.samples[0];
      return {
        id: group.id,
        label: group.label,
        keywords: group.keywords,
        typicalOutcomes: [
          sample?.title || "Comparable market movement from historical ET coverage",
          "Follow-on updates suggest evolving sector rotation",
          "Positioning risk depends on confirmation in subsequent reports"
        ],
        marketImpact: group.marketImpact,
        baseConfidence: Number(group.baseConfidence.toFixed(2)),
        keywordHits: group.keywords.length,
        score: Number(group.score.toFixed(2))
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function inferUpSectors(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();

  if (text.includes("ai") || text.includes("gpu")) return ["Semiconductors", "Cloud Infrastructure"];
  if (text.includes("rbi") || text.includes("rate")) return ["Banking", "Rate-sensitive Growth"];
  if (text.includes("ev") || text.includes("battery")) return ["EV Supply Chain", "Advanced Materials"];

  return ["Broad Market Leaders"];
}

function inferDownSectors(ruleSignals) {
  if (ruleSignals.riskFlags.length > 0) return ["Highly Leveraged Cyclicals", "Regulatory-sensitive Names"];
  if (ruleSignals.sentimentScore <= -1) return ["Speculative Growth"];
  return ["No clear downside concentration"]; 
}

function mergeWithRuleConfidence(llmResult, fallback) {
  const llmConfidence = Number(llmResult?.confidenceLevel?.score);
  if (!Number.isFinite(llmConfidence)) {
    return {
      ...llmResult,
      confidenceLevel: fallback.confidenceLevel
    };
  }

  const blended = clamp((llmConfidence + fallback.confidenceLevel.score) / 2, 0.3, 0.92);

  return {
    ...fallback,
    ...llmResult,
    confidenceLevel: {
      ...(llmResult.confidenceLevel || {}),
      score: Number(blended.toFixed(2)),
      label: blended >= 0.75 ? "high" : blended >= 0.55 ? "medium" : "low",
      explanation:
        llmResult.confidenceLevel?.explanation ||
        "Blended confidence from LLM reasoning and deterministic rule engine."
    }
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
    } catch (_error2) {
      return null;
    }
  }
}

function avg(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function extractTokens(text) {
  const stop = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "will", "into", "about", "after", "before",
    "were", "been", "their", "there", "what", "when", "where", "which", "market", "markets", "economy"
  ]);

  return new Set(
    String(text || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !stop.has(token))
  );
}

function intersectionCount(a, b) {
  let count = 0;
  for (const token of a) {
    if (b.has(token)) count += 1;
  }
  return count;
}

function extractTopKeywords(text) {
  const tokens = [...extractTokens(text)];
  return tokens.slice(0, 8);
}
