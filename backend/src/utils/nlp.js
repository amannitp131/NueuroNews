const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "into", "over", "under", "after", "before", "while", "about", "their", "there", "where", "have", "will", "been", "were", "they", "them", "than", "then", "when", "what", "which", "whose", "would", "could", "should", "because", "business"
]);

const POSITIVE = ["growth", "record", "surge", "beat", "profit", "optimism", "gain", "strong"];
const NEGATIVE = ["drop", "decline", "loss", "risk", "lawsuit", "downturn", "weak", "cut"];

export function extractEntities(text, limit = 8) {
  if (!text) return [];

  const matches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g) || [];
  const deduped = [...new Set(matches)]
    .map((value) => value.trim())
    .filter((value) => value.length > 2 && !STOP_WORDS.has(value.toLowerCase()));

  return deduped.slice(0, limit);
}

export function scoreSentiment(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();

  let score = 0;
  for (const token of POSITIVE) {
    if (lower.includes(token)) score += 1;
  }

  for (const token of NEGATIVE) {
    if (lower.includes(token)) score -= 1;
  }

  return score;
}
