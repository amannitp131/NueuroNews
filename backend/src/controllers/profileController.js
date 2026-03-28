import { UserProfile } from "../models/UserProfile.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const upsertProfile = asyncHandler(async (req, res) => {
  const { name, profession, interests = [], goals = [], preferredRegions = [], preferredSectors = [] } = req.body;

  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      userId: req.user.id,
      email: req.user.email,
      name,
      profession,
      interests,
      goals,
      preferredRegions,
      preferredSectors
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: profile });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  res.json({ success: true, data: profile });
});
