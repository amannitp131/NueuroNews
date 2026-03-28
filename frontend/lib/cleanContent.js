/**
 * Clean raw article content by removing HTML, CSS, and formatting artifacts
 * Extracts readable paragraphs and maintains structure
 */
export function cleanArticleContent(rawContent) {
  if (!rawContent) return "";

  let text = rawContent;

  // Remove HTML/CSS style blocks
  text = text.replace(/<style[^>]*>.*?<\/style>/gis, "");
  text = text.replace(/<script[^>]*>.*?<\/script>/gis, "");

  // Remove CSS classes and HTML comments
  text = text.replace(/var\s+\w+\s*=\s*[^;]+;/g, "");
  text = text.replace(/\/*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "");

  // Remove common navigation/UI patterns
  text = text.replace(/Subscribe to Unlock.*?Sign In/gis, "");
  text = text.replace(/What's Included.*?Subscription/gis, "");
  text = text.replace(/Listen to this article.*?×/gis, "");
  text = text.replace(/#\w+\{[^}]+\}/g, "");
  text = text.replace(/\bFont Size\b/g, "");
  text = text.replace(/\bAbcSmall\b|\bAbcMedium\b|\bAbcLarge\b/g, "");
  text = text.replace(/Rate Story|Follow us|Share|Save|Print|Comment|Synopsis/g, "");

  // Collapse multiple spaces/newlines into single space or paragraph break
  text = text.replace(/\n\s*\n/g, "\n\n");
  text = text.replace(/\s{2,}/g, " ");

  // Split by double newlines to preserve paragraph structure
  const paragraphs = text
    .split("\n\n")
    .map((para) => para.trim())
    .filter(
      (para) =>
        para.length > 20 &&
        !para.match(/^\d+\.\d+%/) && // Remove percentages
        !para.match(/^by\s/i) && // Remove bylines
        !para.match(/^last updated/i) && // Remove timestamps
        !para.match(/^section/i) && // Remove section labels
        !para.match(/^subscribe|sign in/i) && // Remove CTA
        !para.includes("#{") && // Remove CSS
        !para.includes("var ")
    );

  // Join with proper spacing
  return paragraphs.join("\n\n").trim();
}

/**
 * Extract key bullet points from article content
 * Useful for summarizing the article into main points
 */
export function extractKeyPoints(content) {
  const cleaned = cleanArticleContent(content);
  const paragraphs = cleaned.split("\n\n");

  // Take first 3-5 substantial paragraphs as key points
  const keyPoints = paragraphs
    .slice(0, 5)
    .filter((p) => p.length > 50);

  return keyPoints;
}
