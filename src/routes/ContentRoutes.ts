import {Router} from "express";
import {createContent, updateContent, deleteContent, getContent, getContentDetails} from "../controller/ContentController";

const router = Router();

router.post("/", createContent)
router.put("/:id", updateContent)
router.delete("/:id", deleteContent)
router.get("/", getContent)
router.get("/:id/details", getContentDetails)

export default router
