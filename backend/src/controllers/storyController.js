import { StoryArc } from "../models/StoryArc.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { trackStoryFromArticles } from "../services/storyService.js";

export const getStoryArcs = asyncHandler(async (req, res) => {
  const arcs = await StoryArc.find({}).sort({ updatedAt: -1 }).limit(30);
  res.json({ success: true, data: arcs });
});

export const getStoryArcById = asyncHandler(async (req, res) => {
  const arc = await StoryArc.findById(req.params.id);
  if (!arc) {
    return res.status(404).json({ success: false, message: "Story arc not found" });
  }

  res.json({ success: true, data: arc });
});

export const trackStoryArc = asyncHandler(async (req, res) => {
  const { headline, articles } = req.body;

  if (!Array.isArray(articles) || articles.length < 2) {
    return res.status(400).json({
      success: false,
      message: "At least two related articles are required to build a story arc"
    });
  }

  const storyArc = await trackStoryFromArticles({ headline, articles });

  res.status(201).json({
    success: true,
    data: {
      arcId: storyArc._id,
      headline: storyArc.headline,
      entities: storyArc.entities,
      entityMentions: storyArc.entityMentions,
      sentimentTrend: storyArc.sentimentTrend,
      evolutionSummary: storyArc.evolutionSummary,
      timeline: storyArc.timeline
    }
  });
});

export const getStoryTimeline = asyncHandler(async (req, res) => {
  const arc = await StoryArc.findById(req.params.id);
  if (!arc) {
    return res.status(404).json({ success: false, message: "Story arc not found" });
  }

  res.json({
    success: true,
    data: {
      arcId: arc._id,
      headline: arc.headline,
      entities: arc.entities,
      entityMentions: arc.entityMentions,
      sentimentTrend: arc.sentimentTrend,
      evolutionSummary: arc.evolutionSummary,
      timeline: arc.timeline
    }
  });
});
