import {Router} from "express";
import {saveWatchList, updateWatchList, deleteWatchList, getWatchList} from "../controller/WatchlistController";

const router = Router()

router.post("/", saveWatchList)
router.put("/:id", updateWatchList)
router.delete("/:id", deleteWatchList)
router.get("/", getWatchList)

export default router