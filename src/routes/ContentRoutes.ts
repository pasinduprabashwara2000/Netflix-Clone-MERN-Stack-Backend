import {Router} from "express";
import {createContent, updateContent, deleteContent, getContent, getPoster, getBanner, getContentDetails} from "../controller/ContentController";
import {uploadImages} from "../middleware/uploadImages";

const router = Router();

router.post("/", uploadImages, createContent)
router.put("/:id", uploadImages, updateContent)
router.delete("/:id", deleteContent)
router.get("/", getContent)
router.get("/:id/poster", getPoster)
router.get("/:id/banner", getBanner)
router.get("/:id/details", getContentDetails)

export default router
