import { Router } from "express";
import {
	chatWithNews,
	generateNewsToAction,
	generateNewsVideo,
	predictOutcomes,
	summarizeArticle
} from "../controllers/aiController.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();

router.post("/summarize", requireFields(["articleId"]), summarizeArticle);
router.post("/chat", requireFields(["question"]), chatWithNews);
router.post("/video/generate", generateNewsVideo);
router.post("/predict", predictOutcomes);
router.post("/action", requireFields(["articleId"]), generateNewsToAction);

export default router;
