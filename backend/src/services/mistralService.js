import { env } from "../config/env.js";

const MISTRAL_API_BASE = "https://api.mistral.ai/v1";

function getHeaders() {
  if (!env.mistralApiKey) {
    throw new Error("MISTRAL_API_KEY is missing. Get free key at https://console.mistral.ai");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.mistralApiKey}`,
  };
}

export async function generateText(prompt, modelName = env.mistralModel) {
  const response = await fetch(`${MISTRAL_API_BASE}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function embedText(text) {
  try {
    const response = await fetch(`${MISTRAL_API_BASE}/embeddings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: env.mistralEmbeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      // Fallback to hash-based embedding if API fails
      console.warn(`Mistral embedding API failed: ${response.status}`);
      return hashVector(text, 1024);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;
    
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }
  } catch (error) {
    console.warn("Mistral embedding error, using fallback:", error.message);
  }

  // Fallback: generate hash-based vector when embedding API fails
  return hashVector(text, 1024);
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
