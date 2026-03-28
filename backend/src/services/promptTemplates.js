function profileBlock(profile = {}) {
  return `Profession: ${profile.profession || "N/A"}\nInterests: ${(profile.interests || []).join(", ") || "N/A"}\nGoals: ${(profile.goals || []).join(", ") || "N/A"}`;
}

export function buildPersonalizedBriefingPrompt({ article, profile, retrievedContext = "" }) {
  return `You are NeuroNews, an AI business intelligence analyst.

TASK:
Rewrite and explain the news for this specific user. Keep language simple and practical.

USER PROFILE:
${profileBlock(profile)}

ARTICLE:
Title: ${article.title}
Content: ${article.content}

ADDITIONAL CONTEXT FROM RETRIEVAL:
${retrievedContext || "No additional context found."}

OUTPUT FORMAT (strict JSON):
{
  "personalizedSummary": "string",
  "whyThisMattersToYou": ["string", "string", "string"],
  "keyInsights": ["string", "string", "string"],
  "impactAnalysis": {
    "shortTerm": "string",
    "midTerm": "string",
    "longTerm": "string"
  },
  "predictions": ["string", "string"],
  "followUpQuestions": ["string", "string", "string"]
}

RULES:
- Make it personalized to the user's interests and goals.
- Explain impact in simple terms.
- Include both risks and opportunities.
- For "whyThisMattersToYou", return 3-5 practical, actionable bullet points.
- Make each bullet concrete for this user profile; avoid generic statements.
- Prefer direct phrasing like "As a ..." or "Given your interest in ..." when relevant.
- Do not include markdown. Return valid JSON only.`;
}

export function buildRagAnswerPrompt({ question, userContext, contextText }) {
  return `You are NeuroNews Q&A.

USER PROFILE:
${JSON.stringify(userContext || {}, null, 2)}

RETRIEVED CONTEXT:
${contextText || "No retrieved context."}

QUESTION:
${question}

INSTRUCTIONS:
- Answer only from retrieved context.
- Personalize examples to user profile when possible.
- If context is insufficient, explicitly say what evidence is missing.
- Add inline citations like [1], [2].
- End with 2 suggested follow-up questions.
- Keep answer concise and actionable.`;
}

export function buildVideoScriptPrompt({ article, targetDurationSec = 75, tone = "confident and clear" }) {
  return `You are NeuroNews Video Producer AI.

TASK:
Convert the following business news into a short, high-impact video package for social + analyst briefings.

ARTICLE:
Title: ${article.title}
Content: ${article.content}
Source: ${article.source || "Unknown"}
PublishedAt: ${article.publishedAt || "Unknown"}

VIDEO CONSTRAINTS:
- Duration: ${targetDurationSec} seconds (allowed range 60-90)
- Tone: ${tone}
- Audience: business professionals and informed retail investors

OUTPUT FORMAT (strict JSON only):
{
  "videoTitle": "string",
  "hook": "string",
  "durationSec": 75,
  "fullScript": "60-90 sec narrator script",
  "voiceoverText": "clean TTS-ready narration",
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "00:00-00:10",
      "visualDescription": "what to show",
      "onScreenText": "short overlay text",
      "narration": "spoken line",
      "framePrompt": "image/video generation prompt"
    }
  ],
  "keyTakeaways": ["string", "string", "string"],
  "disclaimer": "educational, not investment advice"
}

RULES:
- Keep script factual and concise.
- Avoid hype and absolute claims.
- Ensure scene timings cover the full duration.
- Make voiceover natural and easy for TTS.
- Do not output markdown. Return valid JSON only.`;
}

export function buildPredictionPrompt({ article, matchedPatterns, ruleSignals }) {
  return `You are NeuroNews Forecast Analyst.

TASK:
Create plausible forward-looking scenarios from this news article using provided historical pattern signals.

ARTICLE:
Title: ${article.title}
Content: ${article.content}

RULE SIGNALS:
${JSON.stringify(ruleSignals, null, 2)}

MATCHED HISTORICAL PATTERNS:
${JSON.stringify(matchedPatterns, null, 2)}

OUTPUT FORMAT (strict JSON only):
{
  "possibleFutureOutcomes": [
    {
      "scenario": "string",
      "timeHorizon": "1-4 weeks | 1-3 months | 6-12 months",
      "probability": 0.0,
      "rationale": "string"
    }
  ],
  "marketImpact": {
    "overall": "low | medium | high",
    "sectorsLikelyUp": ["string"],
    "sectorsLikelyDown": ["string"],
    "volatilityOutlook": "string"
  },
  "confidenceLevel": {
    "score": 0.0,
    "label": "low | medium | high",
    "explanation": "string"
  },
  "watchSignals": ["string", "string", "string"]
}

RULES:
- Keep probabilities realistic and sum approximately <= 1.0 across primary scenarios.
- Use rule signals and matched patterns explicitly in rationale.
- Avoid definitive claims; present conditional outcomes.
- Return valid JSON only.`;
}

export function buildNewsToActionPrompt({ article, profile }) {
  return `You are a business intelligence analyst.

INPUT:
- News article content
- User profile (profession, interests, goals)

TASK:
Convert this news into actionable insights.

USER PROFILE:
${profileBlock(profile)}

ARTICLE:
Title: ${article.title}
Content: ${article.content}
Source: ${article.source || "Unknown"}
PublishedAt: ${article.publishedAt || "Unknown"}

OUTPUT FORMAT (strict JSON only):
{
  "trigger": "string",
  "actions": ["string", "string"],
  "urgency": "Low | Medium | High",
  "timeHorizon": "Immediate | Short-term | Long-term",
  "signals": ["string", "string", "string"]
}

RULES:
- trigger: explain in 1-2 lines why this news is important RIGHT NOW.
- actions: give 2-4 practical actions tailored to the user profile.
- urgency: choose Low, Medium, or High and base it on concrete near-term implications.
- signals: list concrete things the user should monitor next (3-5 items).
- Avoid generic statements.
- Personalize using user profile.
- Focus on real-world decisions (career, investment, learning).
- Avoid vague advice.
- Keep tone clear, sharp, practical.
- Do not include markdown. Return valid JSON only.`;
}
