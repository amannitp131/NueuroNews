import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";
import { env } from "../config/env.js";

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": env.scraperUserAgent
  }
});

export async function fetchEconomicTimesArticles({ limit = 20 } = {}) {
  const source = { name: "Economic Times", rssUrl: env.economicTimesRssUrl };
  return fetchArticlesFromSource(source, { limit });
}

export async function fetchMultiSourceArticles({ limit = 30 } = {}) {
  const sources = getNewsSources();
  if (!sources.length) return [];

  const perSourceLimit = Math.max(5, Math.ceil(limit / sources.length) + 2);
  const batches = await Promise.all(
    sources.map((source) => fetchArticlesFromSource(source, { limit: perSourceLimit }))
  );

  const merged = dedupeArticles(batches.flat()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return selectSourceDiverseArticles(merged, limit);
}

function getNewsSources() {
  const defaults = [
    { name: "Economic Times", rssUrl: env.economicTimesRssUrl },
    { name: "Reuters Business", rssUrl: "https://feeds.reuters.com/reuters/businessNews" },
    { name: "CNBC", rssUrl: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
    { name: "Business Standard", rssUrl: "https://www.business-standard.com/rss/home_page_top_stories.rss" }
  ];

  const raw = String(process.env.NEWS_RSS_SOURCES || "").trim();
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;

    const cleaned = parsed
      .map((item) => ({
        name: String(item?.name || "").trim(),
        rssUrl: String(item?.rssUrl || "").trim()
      }))
      .filter((item) => item.name && item.rssUrl);

    return cleaned.length ? cleaned : defaults;
  } catch (_error) {
    return defaults;
  }
}

async function fetchArticlesFromSource(source, { limit }) {
  let feed;
  try {
    feed = await parser.parseURL(source.rssUrl);
  } catch (_error) {
    return [];
  }

  const items = (feed.items || []).slice(0, limit);

  const articles = [];

  for (const item of items) {
    const url = item.link || "";
    const title = (item.title || "").trim();

    if (!title || !url) continue;

    const scrapedContent = env.scrapeFetchFullArticle ? await fetchArticleBody(url) : "";
    const fallbackContent = sanitizeHtmlText(item.contentSnippet || item.content || "");
    const content = scrapedContent || fallbackContent;

    if (!content || content.length < 80) continue;

    articles.push({
      title,
      content,
      source: source.name,
      url,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      tags: item.categories || []
    });
  }

  return articles;
}

function dedupeArticles(items = []) {
  const map = new Map();

  for (const item of items) {
    const key = String(item.url || item.title || "").trim().toLowerCase();
    if (!key || map.has(key)) continue;
    map.set(key, item);
  }

  return Array.from(map.values());
}

function selectSourceDiverseArticles(items = [], limit = 30) {
  if (!items.length) return [];

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

async function fetchArticleBody(url) {
  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        "User-Agent": env.scraperUserAgent,
        Accept: "text/html"
      }
    });

    const $ = cheerio.load(response.data || "");

    const paragraphCandidates = [
      "div.artText p",
      ".articleBlock p",
      ".Normal p",
      "article p",
      "div[itemprop='articleBody'] p"
    ];

    for (const selector of paragraphCandidates) {
      const text = $(selector)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean)
        .join(" ");

      const normalized = sanitizeHtmlText(text);
      if (normalized.length > 200) return normalized;
    }

    const bodyText = sanitizeHtmlText($("body").text());
    return bodyText.slice(0, 4000);
  } catch (_error) {
    return "";
  }
}

function sanitizeHtmlText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}
