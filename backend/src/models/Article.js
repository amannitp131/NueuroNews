import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    source: { type: String, default: "manual" },
    publishedAt: { type: Date, default: Date.now, index: true },
    url: { type: String, default: "", index: true },
    entities: [{ type: String }],
    sentimentScore: { type: Number, default: 0 },
    tags: [{ type: String }],
    embedding: [{ type: Number }],
    storyArcId: { type: mongoose.Schema.Types.ObjectId, ref: "StoryArc" }
  },
  { timestamps: true }
);

export const Article = mongoose.model("Article", articleSchema);
