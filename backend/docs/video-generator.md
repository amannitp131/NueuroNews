# AI News Video Generator

## Endpoint

`POST /api/ai/video/generate`

## Input options

### Option A: Existing article
```json
{
  "articleId": "65f1c9b62f4f1ad1f932d221",
  "targetDurationSec": 75,
  "tone": "confident and clear"
}
```

### Option B: Raw news article
```json
{
  "title": "RBI keeps rates unchanged amid cooling inflation",
  "content": "The central bank maintained policy rates while highlighting moderating inflation and resilient domestic demand...",
  "source": "Market Wire",
  "publishedAt": "2026-03-22T09:00:00.000Z",
  "targetDurationSec": 80,
  "tone": "calm newsroom"
}
```

## Output

Returns a clean video package:
- `videoTitle`
- `hook`
- `durationSec` (60-90)
- `fullScript`
- `voiceoverText`
- `scenes[]` with `timeRange`, `visualDescription`, `onScreenText`, `narration`, `framePrompt`
- `keyTakeaways`
- `disclaimer`
- `tts` config block (optional)
- `frameGeneration` prompt list (basic)

## Notes

- Voiceover/TTS is optional and exposed as request template metadata.
- Frame generation is prompt-oriented by default for easy integration with image/video providers.
- If model JSON is malformed, service falls back to a deterministic structured package.
