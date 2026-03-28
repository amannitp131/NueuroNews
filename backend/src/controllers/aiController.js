import { Article } from "../models/Article.js";
import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { answerQuestionOverNews, personalizedSummary } from "../services/ragService.js";
import { generateNewsVideoPackage } from "../services/videoGeneratorService.js";
import { generatePrediction } from "../services/predictionService.js";
import { generateNewsToActionPlan } from "../services/newsToActionService.js";
import { generateCatchyHeadline } from "../services/headlineService.js";
import { generateDebateMode, generateDebateExchange } from "../services/debateService.js";

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

export const generateDebate = asyncHandler(async (req, res) => {
  const { articleId, rawText, title, content, source, publishedAt, forceRefresh = false } = req.body;

  let article;

  if (articleId) {
    article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
  } else {
    const text = String(rawText || content || "").trim();
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Provide either articleId or raw article text"
      });
    }

    article = {
      title: title || "Manual Article Input",
      content: text,
      source: source || "manual",
      publishedAt: publishedAt || new Date().toISOString()
    };
  }

  // Profile is optional for Debate Mode.
  const profile = await UserProfile.findOne({ userId: req.user.id });

  // Optional per-user cache for stored articles.
  if (articleId && !forceRefresh) {
    const cached = (article.debateInsights || []).find((entry) => String(entry.userId) === String(req.user.id));
    if (cached?.payload) {
      return res.status(200).json({
        success: true,
        data: {
          articleRef: articleId,
          ...cached.payload,
          generatedAt: cached.generatedAt,
          cached: true
        }
      });
    }
  }

  const debate = await generateDebateMode({ article, profile });

  const generatedAt = new Date();

  if (articleId) {
    article.debateInsights = (article.debateInsights || []).filter(
      (entry) => String(entry.userId) !== String(req.user.id)
    );

    article.debateInsights.push({
      userId: req.user.id,
      payload: debate,
      generatedAt
    });

    await article.save();
  }

  return res.status(200).json({
    success: true,
    data: {
      articleRef: articleId || null,
      ...debate,
      generatedAt,
      cached: false
    }
  });
});

export const submitDebateOpinion = asyncHandler(async (req, res) => {
  const { articleId, userOpinion } = req.body;

  if (!articleId) {
    return res.status(400).json({
      success: false,
      message: "articleId is required"
    });
  }

  if (!userOpinion || typeof userOpinion !== "string" || !userOpinion.trim()) {
    return res.status(400).json({
      success: false,
      message: "userOpinion text is required"
    });
  }

  const article = await Article.findById(articleId);
  if (!article) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  // Find or create the user's debate insight entry
  let debateInsight = (article.debateInsights || []).find(
    (entry) => String(entry.userId) === String(req.user.id)
  );

  if (!debateInsight) {
    return res.status(404).json({
      success: false,
      message: "Debate not yet initiated for this article. Generate debate mode first."
    });
  }

  // Get existing exchanges for context
  const previousExchanges = debateInsight.debateExchanges || [];
  const exchangeIndex = previousExchanges.length + 1;

  // Call AI service to generate counter-argument
  const counterArgument = await generateDebateExchange({
    article,
    userOpinion: userOpinion.trim(),
    previousExchanges: previousExchanges.slice(-3) // Include last 3 exchanges for context
  });

  // Create new exchange entry
  const newExchange = {
    userOpinion: userOpinion.trim(),
    aiCounterArgument: counterArgument,
    exchangeIndex,
    timestamp: new Date()
  };

  // Add to debateExchanges array
  debateInsight.debateExchanges = debateInsight.debateExchanges || [];
  debateInsight.debateExchanges.push(newExchange);

  // Save article
  await article.save();

  return res.status(200).json({
    success: true,
    data: {
      articleRef: articleId,
      exchange: newExchange,
      exchangeIndex
    }
  });
});
