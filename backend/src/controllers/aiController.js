import { Article } from "../models/Article.js";
import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { answerQuestionOverNews, personalizedSummary } from "../services/ragService.js";
import { generateNewsVideoPackage } from "../services/videoGeneratorService.js";
import { generatePrediction } from "../services/predictionService.js";
import { NewsActionPlan } from "../models/NewsActionPlan.js";
import { generateNewsToActionPlan } from "../services/newsToActionService.js";

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
  const { articleId, forceRefresh = false } = req.body;

  const article = await Article.findById(articleId);
  if (!article) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const profile = await UserProfile.findOne({ userId: req.user.id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  const existingPlan = await NewsActionPlan.findOne({
    userId: req.user.id,
    articleId
  });

  if (existingPlan && !forceRefresh) {
    return res.json({
      success: true,
      data: {
        articleId,
        decisionTrigger: existingPlan.decisionTrigger,
        recommendedActions: existingPlan.recommendedActions,
        urgencyLevel: existingPlan.urgencyLevel,
        timeHorizon: existingPlan.timeHorizon,
        followUpSignals: existingPlan.followUpSignals,
        generatedAt: existingPlan.generatedAt,
        cached: true
      }
    });
  }

  const generated = await generateNewsToActionPlan({ article, profile });

  const saved = await NewsActionPlan.findOneAndUpdate(
    { userId: req.user.id, articleId },
    {
      userId: req.user.id,
      articleId,
      decisionTrigger: generated.decisionTrigger,
      recommendedActions: generated.recommendedActions,
      urgencyLevel: generated.urgencyLevel,
      timeHorizon: generated.timeHorizon,
      followUpSignals: generated.followUpSignals,
      generatedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json({
    success: true,
    data: {
      articleId,
      decisionTrigger: saved.decisionTrigger,
      recommendedActions: saved.recommendedActions,
      urgencyLevel: saved.urgencyLevel,
      timeHorizon: saved.timeHorizon,
      followUpSignals: saved.followUpSignals,
      generatedAt: saved.generatedAt,
      cached: false
    }
  });
});
