import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    profession: { type: String, required: true },
    interests: [{ type: String, required: true }],
    goals: [{ type: String }],
    preferredRegions: [{ type: String }],
    preferredSectors: [{ type: String }]
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
