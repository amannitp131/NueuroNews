import { Router } from "express";
import { getStoryArcById, getStoryArcs, getStoryTimeline, trackStoryArc } from "../controllers/storyController.js";

const router = Router();

router.post("/track", trackStoryArc);
router.get("/", getStoryArcs);
router.get("/:id", getStoryArcById);
router.get("/:id/timeline", getStoryTimeline);

export default router;
