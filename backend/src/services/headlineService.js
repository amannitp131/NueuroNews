import { generateText } from "./mistralService.js";

const headlinePrompt = `Transform this news headline into a compelling, catchy version that grabs attention while remaining accurate. Make it punchy, insightful, and interesting.

Original headline: {headline}

Requirements:
- Max 80 characters
- Engaging and smart
- Preserve core meaning
- Add business/impact angle if possible
- No clickbait or false claims

Respond with ONLY the new headline, nothing else.`;

export async function generateCatchyHeadline(headline) {
  if (!headline || headline.trim().length === 0) {
    return headline;
  }

  try {
    const prompt = headlinePrompt.replace("{headline}", headline);
    const catchyHeadline = await generateText(prompt, "mistral-small-latest");
    
    // Clean up the response
    return catchyHeadline
      .trim()
      .replace(/^["']|["']$/g, "") // Remove quotes if any
      .slice(0, 100); // Safety limit
  } catch (error) {
    console.warn("Failed to generate catchy headline:", error.message);
    return headline; // Fall back to original
  }
}
