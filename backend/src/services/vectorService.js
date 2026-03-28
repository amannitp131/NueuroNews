import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "../config/env.js";

const localVectors = [];
let pineconeIndex;

async function getPineconeIndex() {
  if (env.vectorStoreProvider !== "pinecone") return null;
  if (!env.pineconeApiKey || !env.pineconeIndex) return null;

  if (pineconeIndex) return pineconeIndex;

  const client = new Pinecone({ apiKey: env.pineconeApiKey });
  pineconeIndex = client.index(env.pineconeIndex);
  return pineconeIndex;
}

export async function upsertVector({ id, values, metadata }) {
  const index = await getPineconeIndex();

  if (index) {
    await index.upsert([{ id, values, metadata }]);
    return;
  }

  localVectors.push({ id, values, metadata });
}

export async function queryVector(values, topK = env.topK) {
  const index = await getPineconeIndex();

  if (index) {
    const response = await index.query({ vector: values, topK, includeMetadata: true });
    return response.matches || [];
  }

  const scored = localVectors
    .map((item) => ({
      ...item,
      score: cosineSimilarity(values, item.values)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

function cosineSimilarity(a = [], b = []) {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
