# Prediction System (Rule-based + LLM)

## Endpoint

POST /api/ai/predict

## Input

### Option A: Existing stored article
```json
{
  "articleId": "65f1c9b62f4f1ad1f932d221"
}
```

### Option B: Raw article
```json
{
  "title": "RBI keeps rates unchanged as inflation cools",
  "content": "The central bank held rates and signaled cautious optimism...",
  "source": "Market Wire",
  "publishedAt": "2026-03-22T09:00:00.000Z"
}
```

## Output

- possibleFutureOutcomes
- marketImpact
- confidenceLevel
- watchSignals
- ruleSignals
- matchedPatterns

## Logic

1. Rule-based engine:
- Sentiment score from keywords
- Entity extraction
- Risk-flag detection
- Historical pattern matching from previously scraped multi-source business articles in MongoDB
- Deterministic confidence baseline

2. LLM reasoning:
- Prompt receives article + rule signals + matched patterns
- Generates scenario probabilities, market impact, and confidence explanation

3. Hybrid fusion:
- If LLM output is valid JSON: blend confidence with rule baseline
- If invalid JSON: use deterministic fallback output

## Prompt (used by the service)

```text
You are NeuroNews Forecast Analyst.

TASK:
Create plausible forward-looking scenarios from this news article using provided historical pattern signals.

ARTICLE:
Title: {{title}}
Content: {{content}}

RULE SIGNALS:
{{rule_signals_json}}

MATCHED HISTORICAL PATTERNS:
{{matched_patterns_json}}

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
```
