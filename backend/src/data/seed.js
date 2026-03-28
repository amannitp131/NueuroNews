import { connectDatabase } from "../config/db.js";
import { Article } from "../models/Article.js";
import { extractEntities, scoreSentiment } from "../utils/nlp.js";
import { indexArticleForRag } from "../services/ragService.js";
import { upsertStoryArcFromArticle } from "../services/storyService.js";
import { fetchMultiSourceArticles } from "../services/economicTimesScraperService.js";

async function seed() {
  await connectDatabase();
  await Article.deleteMany({});

  const items = await fetchMultiSourceArticles({ limit: 60 });

  for (const item of items) {
    const article = await Article.create({
      ...item,
      entities: extractEntities(`${item.title} ${item.content}`),
      sentimentScore: scoreSentiment(item.content),
      publishedAt: new Date(item.publishedAt || Date.now())
    });

    await indexArticleForRag(article);
    const arc = await upsertStoryArcFromArticle(article);
    article.storyArcId = arc._id;
    await article.save();
  }

  const sources = new Set(items.map((item) => item.source).filter(Boolean));
  console.log(`[seed] Inserted ${items.length} articles from ${sources.size} sources`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("[seed] Failed", error);
  process.exit(1);
});
