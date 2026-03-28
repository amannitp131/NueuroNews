import { Router } from "express";
import {
	getArticleById,
	getPersonalizedFeed,
	ingestArticle,
	scrapeEconomicTimesNews
} from "../controllers/articleController.js";
import { requireFields } from "../middleware/validateBody.js";

const router = Router();

router.post("/ingest", requireFields(["title", "content"]), ingestArticle);
router.post("/scrape", scrapeEconomicTimesNews);
router.get("/feed", getPersonalizedFeed);
router.get("/:id", getArticleById);

export default router;
