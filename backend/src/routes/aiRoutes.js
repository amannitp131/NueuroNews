import { Router } from "express";
import {
	chatWithNews,
	generateNewsToAction,
	generateNewsVideo,
	predictOutcomes,
	summarizeArticle,
	enhanceHeadline
} from "../controllers/aiController.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();

router.post("/summarize", requireFields(["articleId"]), summarizeArticle);
router.post("/chat", requireFields(["question"]), chatWithNews);
router.post("/video/generate", generateNewsVideo);
router.post("/predict", predictOutcomes);
router.post("/action", generateNewsToAction);
router.post("/headline/enhance", requireFields(["headline"]), enhanceHeadline);

export default router;
