export function chunkText(text, chunkSize = 500, overlap = 80) {
  if (!text || typeof text !== "string") return [];

  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + chunkSize).join(" ");
    chunks.push(slice);

    if (i + chunkSize >= words.length) break;
    i += Math.max(1, chunkSize - overlap);
  }

  return chunks;
}
