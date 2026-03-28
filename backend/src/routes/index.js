import { Router } from "express";
import profileRoutes from "./profileRoutes.js";
import authRoutes from "./authRoutes.js";
import articleRoutes from "./articleRoutes.js";
import aiRoutes from "./aiRoutes.js";
import storyRoutes from "./storyRoutes.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// API surface for NeuroNews backend.
router.use("/auth", authRoutes);
router.use("/profiles", requireAuth, profileRoutes);
router.use("/news", requireAuth, articleRoutes);
router.use("/ai", requireAuth, aiRoutes);
router.use("/stories", requireAuth, storyRoutes);

export default router;
