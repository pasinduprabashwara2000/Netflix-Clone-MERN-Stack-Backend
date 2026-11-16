import {Router} from "express";
import {getHistory, addHistory, removeHistory, clearHistory} from "../controller/HistoryController";
import {protect} from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", protect, getHistory)
router.post("/", protect, addHistory)
router.delete("/", protect, clearHistory)
router.delete("/:id", protect, removeHistory)

export default router
