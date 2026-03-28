import { Router } from "express";
import { getCurrentUser, loginUser, signupUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", requireAuth, getCurrentUser);

export default router;
