import {Response} from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import {AuthRequest} from "../middleware/AuthMiddleware";

//GET /api/auth/me
export const getMe = async (req : AuthRequest, res : Response) => {
    try {
        const user = await User.findById(req.user!.id).select("name email role")

        if (!user) {
            return res.status(404).json({ message : "User not found" })
        }

        res.json({ id : user._id, name : user.name, email : user.email, role : user.role })
    } catch (error) {
        res.status(500).json({ message : "Failed to Load Account" })
    }
}

//PUT /api/auth/change-password   { currentPassword, newPassword }
export const changePassword = async (req : AuthRequest, res : Response) => {
    try {
        const {currentPassword, newPassword} = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message : "Current and New Password are required" })
        }

        if (String(newPassword).length < 8) {
            return res.status(400).json({ message : "New password must be at least 8 characters" })
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message : "New password must be different from the current one" })
        }

        const user = await User.findById(req.user!.id)

        if (!user) {
            return res.status(404).json({ message : "User not found" })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword)

        // 400 (not 401) on purpose: the frontend signs the user out on 401
        if (!isMatch) {
            return res.status(400).json({ message : "Current password is incorrect" })
        }

        user.hashedPassword = await bcrypt.hash(newPassword, 12)
        await user.save()

        res.json({ message : "Password Changed Successfully" })
    } catch (error) {
        res.status(500).json({ message : "Failed to Change Password" })
    }
}
