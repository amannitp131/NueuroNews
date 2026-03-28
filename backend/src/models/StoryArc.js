import mongoose from "mongoose";

const timelinePointSchema = new mongoose.Schema(
  {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
    title: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    summary: { type: String, default: "" },
    sentimentScore: { type: Number, default: 0 }
  },
  { _id: false }
);

const storyArcSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    headline: { type: String, required: true },
    entities: [{ type: String }],
    entityMentions: {
      type: Map,
      of: Number,
      default: {}
    },
    sentimentTrend: [{ type: Number }],
    evolutionSummary: { type: String, default: "" },
    timeline: [timelinePointSchema]
  },
  { timestamps: true }
);

export const StoryArc = mongoose.model("StoryArc", storyArcSchema);
