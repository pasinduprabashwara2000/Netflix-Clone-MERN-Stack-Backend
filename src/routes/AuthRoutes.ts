import {Router} from "express";
import {register, login} from "../controller/AuthController";
import {protect} from "../middleware/AuthMiddleware";
import User from "../models/User";

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", protect, async (req,res) => {
    const user = await User.findById((req as any).user.id)
        .select("-password");

    if(!user){
        return res.status(404).json({
            message : "User not found"
        })
    }

    res.json(user)

});

export default router