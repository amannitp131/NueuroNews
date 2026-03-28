import { Article } from "../models/Article.js";
import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { extractEntities, scoreSentiment } from "../utils/nlp.js";
import { indexArticleForRag } from "../services/ragService.js";
import { upsertStoryArcFromArticle } from "../services/storyService.js";
import { fetchEconomicTimesArticles, fetchMultiSourceArticles } from "../services/economicTimesScraperService.js";

export const ingestArticle = asyncHandler(async (req, res) => {
  const { title, content, source, publishedAt, tags = [] } = req.body;

  const entities = extractEntities(`${title} ${content}`);
  const sentimentScore = scoreSentiment(content);

  const article = await Article.create({
    title,
    content,
    source: source || "manual",
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    tags,
    entities,
    sentimentScore
  });

  // Index for semantic retrieval and connect article to a story arc.
  await indexArticleForRag(article);
  const storyArc = await upsertStoryArcFromArticle(article);

  article.storyArcId = storyArc._id;
  await article.save();

  res.status(201).json({ success: true, data: article });
});

export const getPersonalizedFeed = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ userId: req.user.id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  const page = Math.max(1, Number(req.query?.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query?.limit || 30)));
  const skip = (page - 1) * limit;

  const keywords = [...profile.interests, ...profile.preferredSectors]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

  const regexList = keywords.map((k) => new RegExp(k, "i"));
  const feedQuery = regexList.length
    ? {
        $or: [
          { title: { $in: regexList } },
          { content: { $in: regexList } },
          { tags: { $in: regexList } },
          { entities: { $in: regexList } }
        ]
      }
    : {};

  let total = await Article.countDocuments(feedQuery);
  let feed = await Article.find(feedQuery).sort({ publishedAt: -1 }).skip(skip).limit(limit);
  const minPersonalized = 10;

  // If feed is too sparse, fetch multi-source business news and retry.
  if (total < minPersonalized) {
    const scraped = await fetchMultiSourceArticles({ limit: 60 });
    if (!scraped.length) {
      const etFallback = await fetchEconomicTimesArticles({ limit: 30 });
      await upsertScrapedArticles(etFallback);
    } else {
      await upsertScrapedArticles(scraped);
    }

    total = await Article.countDocuments(feedQuery);
    feed = await Article.find(feedQuery).sort({ publishedAt: -1 }).skip(skip).limit(limit);
  }

  // Top-up current page with latest source-diverse items if personalized matches are still few.
  if (page === 1 && feed.length < minPersonalized) {
    const missing = minPersonalized - feed.length;
    const existingIds = feed.map((article) => article._id);

    const filler = await Article.find({ _id: { $nin: existingIds } })
      .sort({ publishedAt: -1 })
      .limit(missing * 3);

    const diverseFiller = pickDiverseBySource(filler, missing);
    feed = [...feed, ...diverseFiller];
  }

  // If feed is empty, fetch latest ET news and retry so output stays live-data driven.
  if (!feed.length) {
    const scraped = await fetchEconomicTimesArticles({ limit: 25 });
    await upsertScrapedArticles(scraped);

    total = await Article.countDocuments(feedQuery);
    feed = await Article.find(feedQuery).sort({ publishedAt: -1 }).skip(skip).limit(limit);
  }

  res.json({
    success: true,
    data: {
      profile,
      articles: feed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    }
  });
});

export const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  res.json({ success: true, data: article });
});

export const scrapeEconomicTimesNews = asyncHandler(async (req, res) => {
  const limit = Number(req.body?.limit || req.query?.limit || 20);
  const scraped = await fetchEconomicTimesArticles({ limit });
  const ingestResult = await upsertScrapedArticles(scraped);

  res.status(200).json({
    success: true,
    data: {
      requested: limit,
      scraped: scraped.length,
      inserted: ingestResult.inserted,
      updated: ingestResult.updated
    }
  });
});

async function upsertScrapedArticles(items = []) {
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const entities = extractEntities(`${item.title} ${item.content}`);
    const sentimentScore = scoreSentiment(item.content);

    const existing = await Article.findOne({ url: item.url });
    if (existing) {
      existing.title = item.title;
      existing.content = item.content;
      existing.source = item.source;
      existing.publishedAt = new Date(item.publishedAt);
      existing.tags = item.tags || [];
      existing.entities = entities;
      existing.sentimentScore = sentimentScore;
      await existing.save();

      await indexArticleForRag(existing);
      const arc = await upsertStoryArcFromArticle(existing);
      existing.storyArcId = arc._id;
      await existing.save();
      updated += 1;
      continue;
    }

    const created = await Article.create({
      title: item.title,
      content: item.content,
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.publishedAt),
      tags: item.tags || [],
      entities,
      sentimentScore
    });

    await indexArticleForRag(created);
    const arc = await upsertStoryArcFromArticle(created);
    created.storyArcId = arc._id;
    await created.save();
    inserted += 1;
  }

  return { inserted, updated };
}

function pickDiverseBySource(items = [], limit = 10) {
  if (!items.length || limit <= 0) return [];

  const grouped = new Map();
  for (const item of items) {
    const key = String(item.source || "Unknown");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  const sourceKeys = Array.from(grouped.keys());
  const selected = [];

  while (selected.length < limit) {
    let progressed = false;

    for (const key of sourceKeys) {
      const bucket = grouped.get(key);
      if (!bucket || !bucket.length) continue;
      selected.push(bucket.shift());
      progressed = true;

      if (selected.length >= limit) break;
    }

    if (!progressed) break;
  }

  return selected;
}
