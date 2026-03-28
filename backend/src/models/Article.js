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
    storyArcId: { type: mongoose.Schema.Types.ObjectId, ref: "StoryArc" },
    actionInsights: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        trigger: { type: String, required: true, trim: true },
        actions: [{ type: String }],
        urgency: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium"
        },
        timeHorizon: {
          type: String,
          enum: ["Immediate", "Short-term", "Long-term"],
          default: "Short-term"
        },
        signals: [{ type: String }],
        generatedAt: { type: Date, default: Date.now }
      }
    ],
    debateInsights: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        payload: { type: mongoose.Schema.Types.Mixed, required: true },
        debateExchanges: [
          {
            userOpinion: { type: String, required: true },
            aiCounterArgument: {
              title: { type: String },
              counterPoints: [{ type: String }],
              concessions: [{ type: String }]
            },
            exchangeIndex: { type: Number, default: 0 },
            timestamp: { type: Date, default: Date.now }
          }
        ],
        generatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Article = mongoose.model("Article", articleSchema);
