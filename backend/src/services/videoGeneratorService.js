import { generateText } from "./geminiService.js";
import { buildVideoScriptPrompt } from "./promptTemplates.js";
import { env } from "../config/env.js";

export async function generateNewsVideoPackage({ article, targetDurationSec = 75, tone = "confident and clear" }) {
  const duration = clampDuration(targetDurationSec);
  const prompt = buildVideoScriptPrompt({ article, targetDurationSec: duration, tone });
  const raw = await generateText(prompt);

  const parsed = safeJsonParse(raw) || buildFallbackVideoPackage(article, duration);

  const withDefaults = {
    ...parsed,
    durationSec: clampDuration(parsed.durationSec || duration),
    scenes: normalizeScenes(parsed.scenes, parsed.voiceoverText || parsed.fullScript || "", parsed.durationSec || duration)
  };

  return {
    ...withDefaults,
    tts: buildTtsConfig(withDefaults.voiceoverText),
    frameGeneration: {
      provider: env.frameProvider,
      model: env.frameModel,
      prompts: withDefaults.scenes.map((scene) => ({
        sceneNumber: scene.sceneNumber,
        prompt: scene.framePrompt || scene.visualDescription
      }))
    }
  };
}

function clampDuration(sec) {
  const n = Number(sec || 75);
  return Math.max(60, Math.min(90, n));
}

function safeJsonParse(raw) {
  if (!raw || typeof raw !== "string") return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_error2) {
      return null;
    }
  }
}

function normalizeScenes(scenes, fallbackNarration, durationSec) {
  if (!Array.isArray(scenes) || !scenes.length) {
    return buildDefaultScenes(fallbackNarration, durationSec);
  }

  return scenes.map((scene, index) => ({
    sceneNumber: Number(scene.sceneNumber || index + 1),
    timeRange: scene.timeRange || approximateRange(index, scenes.length, durationSec),
    visualDescription: scene.visualDescription || "Business newsroom style visual with clean infographic overlay",
    onScreenText: scene.onScreenText || "Market Update",
    narration: scene.narration || "",
    framePrompt: scene.framePrompt || scene.visualDescription || "Business news cinematic frame"
  }));
}

function buildDefaultScenes(text, durationSec) {
  const chunks = [
    "Big picture headline and immediate market relevance",
    "What happened and why it matters",
    "Winners, risks, and near-term outlook",
    "Closing takeaway and action checklist"
  ];

  return chunks.map((chunk, index) => ({
    sceneNumber: index + 1,
    timeRange: approximateRange(index, chunks.length, durationSec),
    visualDescription: chunk,
    onScreenText: chunk,
    narration: chunk,
    framePrompt: `Cinematic business news frame: ${chunk}`
  }));
}

function approximateRange(index, total, durationSec) {
  const segment = Math.floor(durationSec / total);
  const start = index * segment;
  const end = index === total - 1 ? durationSec : (index + 1) * segment;
  return `${toClock(start)}-${toClock(end)}`;
}

function toClock(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function buildFallbackVideoPackage(article, durationSec) {
  const intro = `Today in business: ${article.title}.`;
  const middle = `Here is what happened: ${article.content.slice(0, 420)}`;
  const close = "Key takeaway: track execution, policy shifts, and market reaction before making decisions.";
  const voiceover = `${intro} ${middle} ${close}`;

  return {
    videoTitle: article.title,
    hook: intro,
    durationSec,
    fullScript: voiceover,
    voiceoverText: voiceover,
    scenes: buildDefaultScenes(voiceover, durationSec),
    keyTakeaways: [
      "Understand the catalyst behind the news",
      "Track second-order impact on related sectors",
      "Watch sentiment and data confirmation over coming days"
    ],
    disclaimer: "For educational purposes only. Not investment advice."
  };
}

function buildTtsConfig(voiceoverText) {
  return {
    provider: env.ttsProvider,
    enabled: Boolean(env.elevenLabsApiKey),
    voiceId: env.ttsVoiceId,
    input: voiceoverText,
    requestTemplate: {
      endpoint: "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
      method: "POST",
      headers: {
        "xi-api-key": "${ELEVENLABS_API_KEY}",
        "Content-Type": "application/json"
      },
      body: {
        text: voiceoverText,
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75
        }
      }
    }
  };
}
