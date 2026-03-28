import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

let genAI;

function getClient() {
  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }

  return genAI;
}

export async function generateText(prompt, modelName = env.geminiModel) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function embedText(text) {
  const client = getClient();
  const candidates = uniqueModels([
    env.geminiEmbeddingModel,
    "embedding-001",
    "text-embedding-004"
  ]);

  for (const modelName of candidates) {
    try {
      const model = client.getGenerativeModel({ model: modelName });

      if (typeof model.embedContent !== "function") {
        continue;
      }

      const result = await model.embedContent(text);
      const values = result?.embedding?.values;
      if (Array.isArray(values) && values.length > 0) {
        return values;
      }
    } catch (error) {
      // Try next embedding model candidate when model is unavailable/unsupported.
      if (!isRetriableEmbeddingModelError(error)) {
        break;
      }
    }
  }

  // Final fallback keeps RAG flow alive even if embedding API model is unavailable.
  return hashVector(text, 128);
}

function uniqueModels(models) {
  return [...new Set(models.filter(Boolean))];
}

function isRetriableEmbeddingModelError(error) {
  const msg = String(error?.message || "").toLowerCase();
  return (
    msg.includes("404") ||
    msg.includes("not found") ||
    msg.includes("not supported") ||
    msg.includes("embedcontent")
  );
}

function hashVector(input, dims) {
  const vector = new Array(dims).fill(0);
  const text = input || "";

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    vector[i % dims] += ((code % 31) - 15) / 15;
  }

  const norm = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}
