import {Router} from "express";
import {register, login} from "../controller/AuthController";
import {getMe, changePassword} from "../controller/AccountController";
import {protect} from "../middleware/AuthMiddleware";

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/change-password", protect, changePassword)

export default router
