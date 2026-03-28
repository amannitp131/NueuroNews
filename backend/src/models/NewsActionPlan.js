import mongoose from "mongoose";

const newsActionPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    decisionTrigger: { type: String, required: true, trim: true },
    recommendedActions: [{ type: String }],
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    timeHorizon: {
      type: String,
      enum: ["Immediate", "Short-term", "Long-term"],
      default: "Short-term"
    },
    followUpSignals: [{ type: String }],
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

newsActionPlanSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const NewsActionPlan = mongoose.model("NewsActionPlan", newsActionPlanSchema);