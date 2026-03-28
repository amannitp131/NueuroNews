import { asyncHandler } from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { UserProfile } from "../models/UserProfile.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      name: user.name
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

function publicUser(user, profile = null) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    profession: profile?.profession,
    interests: profile?.interests || [],
    goals: profile?.goals || []
  };
}

export const signupUser = asyncHandler(async (req, res) => {
  const { email, name, password, profession, interests, goals } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ success: false, message: "email, name and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash });

  const parsedInterests = Array.isArray(interests)
    ? interests.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
  const parsedGoals = Array.isArray(goals)
    ? goals.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];

  const profile = await UserProfile.create({
    userId: user._id,
    email: user.email,
    name: user.name,
    profession: typeof profession === "string" && profession.trim() ? profession.trim() : "General",
    interests: parsedInterests,
    goals: parsedGoals
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: publicUser(user, profile)
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const profile = await UserProfile.findOne({ userId: user._id });
  const token = signToken(user);

  res.json({
    success: true,
    data: {
      token,
      user: publicUser(user, profile)
    }
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const profile = await UserProfile.findOne({ userId: user._id });
  res.json({ success: true, data: { user: publicUser(user, profile) } });
});
