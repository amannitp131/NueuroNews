import { Article } from "../models/Article.js";
import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { answerQuestionOverNews, personalizedSummary } from "../services/ragService.js";
import { generateNewsVideoPackage } from "../services/videoGeneratorService.js";
import { generatePrediction } from "../services/predictionService.js";
import { generateNewsToActionPlan } from "../services/newsToActionService.js";
import { generateCatchyHeadline } from "../services/headlineService.js";

export const summarizeArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.body;

  const article = await Article.findById(articleId);
  if (!article) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const profile = await UserProfile.findOne({ userId: req.user.id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  const summary = await personalizedSummary({ article, profile });

  res.json({
    success: true,
    data: {
      articleId: article._id,
      personalizedSummary: summary.personalizedSummary,
      whyThisMattersToYou: summary.whyThisMattersToYou,
      keyInsights: summary.keyInsights,
      impactAnalysis: summary.impactAnalysis,
      predictions: summary.predictions,
      followUpQuestions: summary.followUpQuestions,
      retrievalSources: summary.retrievalSources
    }
  });
});

export const chatWithNews = asyncHandler(async (req, res) => {
  const { question } = req.body;

  const profile = await UserProfile.findOne({ userId: req.user.id });
  const response = await answerQuestionOverNews({
    question,
    userContext: profile
      ? {
          profession: profile.profession,
          interests: profile.interests,
          goals: profile.goals
        }
      : {}
  });

  res.json({ success: true, data: response });
});

export const generateNewsVideo = asyncHandler(async (req, res) => {
  const { articleId, title, content, source, publishedAt, targetDurationSec, tone } = req.body;

  let article;

  if (articleId) {
    article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
  } else {
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Provide either articleId or title + content"
      });
    }

    article = {
      title,
      content,
      source: source || "manual",
      publishedAt: publishedAt || new Date().toISOString()
    };
  }

  const videoPackage = await generateNewsVideoPackage({
    article,
    targetDurationSec,
    tone
  });

  res.status(200).json({
    success: true,
    data: {
      articleRef: articleId || null,
      ...videoPackage
    }
  });
});

export const predictOutcomes = asyncHandler(async (req, res) => {
  const { articleId, title, content, source, publishedAt } = req.body;

  let article;

  if (articleId) {
    article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
  } else {
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Provide either articleId or title + content"
      });
    }

    article = {
      title,
      content,
      source: source || "manual",
      publishedAt: publishedAt || new Date().toISOString()
    };
  }

  const prediction = await generatePrediction({ article });

  res.status(200).json({
    success: true,
    data: {
      articleRef: articleId || null,
      ...prediction
    }
  });
});

export const generateNewsToAction = asyncHandler(async (req, res) => {
  const { articleId, rawText, title, source, publishedAt, forceRefresh = false } = req.body;

  if (!articleId && !rawText) {
    return res.status(400).json({
      success: false,
      message: "Provide either articleId or rawText"
    });
  }

  let article = null;
  if (articleId) {
    article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
  } else {
    article = {
      title: title || "Manual News Input",
      content: rawText,
      source: source || "manual",
      publishedAt: publishedAt || new Date().toISOString()
    };
  }

  const profile = await UserProfile.findOne({ userId: req.user.id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  // Optional per-user cache on Article when articleId is provided.
  if (articleId && !forceRefresh) {
    const cached = (article.actionInsights || []).find((entry) => String(entry.userId) === String(req.user.id));
    if (cached) {
      return res.json({
        success: true,
        data: {
          articleId,
          trigger: cached.trigger,
          actions: cached.actions,
          urgency: cached.urgency,
          timeHorizon: cached.timeHorizon,
          signals: cached.signals,
          decisionTrigger: cached.trigger,
          recommendedActions: cached.actions,
          urgencyLevel: cached.urgency,
          followUpSignals: cached.signals,
          generatedAt: cached.generatedAt,
          cached: true
        }
      });
    }
  }

  const generated = await generateNewsToActionPlan({ article, profile });
  const generatedAt = new Date();

  if (articleId) {
    article.actionInsights = (article.actionInsights || []).filter(
      (entry) => String(entry.userId) !== String(req.user.id)
    );

    article.actionInsights.push({
      userId: req.user.id,
      trigger: generated.trigger,
      actions: generated.actions,
      urgency: generated.urgency,
      timeHorizon: generated.timeHorizon,
      signals: generated.signals,
      generatedAt
    });

    await article.save();
  }

  return res.json({
    success: true,
    data: {
      articleId: articleId || null,
      trigger: generated.trigger,
      actions: generated.actions,
      urgency: generated.urgency,
      timeHorizon: generated.timeHorizon,
      signals: generated.signals,
      decisionTrigger: generated.decisionTrigger,
      recommendedActions: generated.recommendedActions,
      urgencyLevel: generated.urgencyLevel,
      followUpSignals: generated.followUpSignals,
      generatedAt,
      cached: false
    }
  });
});

export const enhanceHeadline = asyncHandler(async (req, res) => {
  const { headline } = req.body;

  if (!headline || typeof headline !== "string") {
    return res.status(400).json({ success: false, message: "Headline text is required" });
  }

  const catchyHeadline = await generateCatchyHeadline(headline);

  return res.json({
    success: true,
    data: {
      original: headline,
      enhanced: catchyHeadline
    }
  });
});
