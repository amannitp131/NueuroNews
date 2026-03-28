import { Router } from "express";
import { getMyProfile, upsertProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();

router.post("/me", requireAuth, requireFields(["name", "profession", "interests"]), upsertProfile);
router.get("/me", requireAuth, getMyProfile);

export default router;
