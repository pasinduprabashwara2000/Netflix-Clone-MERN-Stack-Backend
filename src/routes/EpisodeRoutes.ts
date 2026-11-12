import {Router} from "express";
import {createEpisode, updateEpisode, deleteEpisode, getEpisode} from "../controller/EpisodeController";

const router = new Router();

router.post("/", createEpisode)
router.put("/:id", updateEpisode)
router.delete("/:id", deleteEpisode)
router.get("/", getEpisode)

export default router