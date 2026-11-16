import {Router} from "express";
import {getRecommendations, aiSearch, aiChat, reindex} from "../controller/AiController";
import {protect} from "../middleware/AuthMiddleware";
import {rateLimit} from "../middleware/RateLimit";

const router = Router();

// 30 AI requests per user per minute
router.use(protect, rateLimit(30, 60 * 1000))

router.get("/recommendations", getRecommendations)
router.get("/search", aiSearch)
router.post("/chat", aiChat)
router.post("/reindex", reindex)

export default router
