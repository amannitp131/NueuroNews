import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "GEMINI_API_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    // Allow booting without strict env in local prototypes but warn loudly.
    console.warn(`[env] Missing ${key}. Some features may not work.`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/neuronews",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "embedding-001",
  pineconeApiKey: process.env.PINECONE_API_KEY || "",
  pineconeIndex: process.env.PINECONE_INDEX || "",
  pineconeCloud: process.env.PINECONE_CLOUD || "aws",
  pineconeRegion: process.env.PINECONE_REGION || "us-east-1",
  vectorStoreProvider: process.env.VECTOR_STORE_PROVIDER || "local",
  topK: Number(process.env.TOP_K || 4),
  ttsProvider: process.env.TTS_PROVIDER || "elevenlabs",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  ttsVoiceId: process.env.TTS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL",
  frameProvider: process.env.FRAME_PROVIDER || "prompt-only",
  frameModel: process.env.FRAME_MODEL || "flux-schnell",
  economicTimesRssUrl:
    process.env.ECONOMIC_TIMES_RSS_URL || "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
  scraperUserAgent: process.env.SCRAPER_USER_AGENT || "NeuroNewsBot/1.0 (+educational-project)",
  scrapeFetchFullArticle: String(process.env.SCRAPE_FETCH_FULL_ARTICLE || "true") === "true"
};
