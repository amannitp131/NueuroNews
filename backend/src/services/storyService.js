import { StoryArc } from "../models/StoryArc.js";
import { extractEntities, scoreSentiment } from "../utils/nlp.js";
import { generateText } from "./geminiService.js";

export async function buildStoryKey(entities = []) {
  if (!entities.length) return "general-market-updates";
  return entities.slice(0, 3).map((v) => v.toLowerCase().replace(/\s+/g, "-")).join("_");
}

export async function upsertStoryArcFromArticle(article) {
  const key = await buildStoryKey(article.entities || []);

  let existing = await StoryArc.findOne({ key });
  if (!existing) {
    const entityMentions = buildEntityMentions(article.entities || []);
    const timeline = [
      {
        articleId: article._id,
        title: article.title,
        publishedAt: article.publishedAt,
        summary: article.content.slice(0, 220),
        sentimentScore: article.sentimentScore || 0
      }
    ];

    try {
      const created = await StoryArc.create({
        key,
        headline: article.title,
        entities: article.entities || [],
        entityMentions,
        sentimentTrend: [article.sentimentScore || 0],
        evolutionSummary: await summarizeEvolution(timeline, article.entities || []),
        timeline
      });
      return created;
    } catch (error) {
      // Another request created the same arc in parallel. Reuse it.
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      existing = await StoryArc.findOne({ key });
      if (!existing) {
        throw error;
      }
    }
  }

  const alreadyTracked = (existing.timeline || []).some(
    (point) => String(point.articleId) === String(article._id)
  );
  if (alreadyTracked) {
    return existing;
  }

  const mergedEntities = [...new Set([...(existing.entities || []), ...(article.entities || [])])];
  const timeline = [
    ...(existing.timeline || []),
    {
      articleId: article._id,
      title: article.title,
      publishedAt: article.publishedAt,
      summary: article.content.slice(0, 220),
      sentimentScore: article.sentimentScore || 0
    }
  ].sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

  existing.entities = mergedEntities;
  existing.entityMentions = {
    ...(existing.entityMentions?.toJSON?.() || {}),
    ...mergeEntityMentions(existing.entityMentions?.toJSON?.() || {}, article.entities || [])
  };
  existing.sentimentTrend = timeline.map((point) => point.sentimentScore).slice(-30);
  existing.timeline = timeline;
  existing.evolutionSummary = await summarizeEvolution(timeline, mergedEntities);

  await existing.save();
  return existing;
}

export async function trackStoryFromArticles({ headline, articles = [] }) {
  const normalized = articles.map((item, idx) => {
    const title = item.title || `Story update ${idx + 1}`;
    const content = item.content || "";
    const entities = extractEntities(`${title} ${content}`, 12);
    const sentimentScore = scoreSentiment(content);

    return {
      title,
      content,
      entities,
      sentimentScore,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      articleId: item.articleId
    };
  });

  const keyEntities = rankEntities(normalized).map((entity) => entity.name);
  const key = await buildStoryKey(keyEntities);

  const timeline = normalized
    .map((item) => ({
      articleId: item.articleId,
      title: item.title,
      publishedAt: item.publishedAt,
      summary: item.content.slice(0, 220),
      sentimentScore: item.sentimentScore
    }))
    .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

  const rankedEntities = rankEntities(normalized);
  const entityMentions = rankedEntities.reduce((acc, item) => {
    acc[item.name] = item.count;
    return acc;
  }, {});

  const evolutionSummary = await summarizeEvolution(timeline, keyEntities);
  const sentimentTrend = timeline.map((point) => point.sentimentScore);

  const storyArc = await StoryArc.findOneAndUpdate(
    { key },
    {
      key,
      headline: headline || timeline[timeline.length - 1]?.title || "Story Arc",
      entities: keyEntities,
      entityMentions,
      sentimentTrend,
      evolutionSummary,
      timeline
    },
    { upsert: true, new: true }
  );

  return storyArc;
}

function rankEntities(articles = []) {
  const mentions = {};

  for (const article of articles) {
    for (const entity of article.entities || []) {
      mentions[entity] = (mentions[entity] || 0) + 1;
    }
  }

  return Object.entries(mentions)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function buildEntityMentions(entities = []) {
  return entities.reduce((acc, entity) => {
    acc[entity] = (acc[entity] || 0) + 1;
    return acc;
  }, {});
}

function mergeEntityMentions(existing = {}, incoming = []) {
  const next = { ...existing };
  for (const entity of incoming) {
    next[entity] = (next[entity] || 0) + 1;
  }
  return next;
}

function isDuplicateKeyError(error) {
  return error?.name === "MongoServerError" && error?.code === 11000;
}

async function summarizeEvolution(timeline = [], entities = []) {
  if (!timeline.length) {
    return "No evolution summary available.";
  }

  const compactTimeline = timeline
    .slice(0, 10)
    .map((point, idx) => `${idx + 1}. ${point.title} | ${new Date(point.publishedAt).toISOString()} | sentiment ${point.sentimentScore}`)
    .join("\n");

  const prompt = `Summarize this business story evolution in 4-5 lines.
Focus on what changed from first update to latest update, key entities, and sentiment trajectory.

Entities: ${entities.join(", ") || "N/A"}

Timeline:
${compactTimeline}`;

  try {
    return await generateText(prompt);
  } catch (_error) {
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    const delta = (last.sentimentScore || 0) - (first.sentimentScore || 0);
    const direction = delta > 0 ? "improved" : delta < 0 ? "weakened" : "remained stable";

    return `The narrative moved from "${first.title}" to "${last.title}" across ${timeline.length} updates. Key entities included ${entities.slice(0, 5).join(", ") || "multiple market players"}. Overall sentiment ${direction}, indicating a ${direction === "improved" ? "more constructive" : direction === "weakened" ? "more cautious" : "mixed"} trajectory.`;
  }
}
