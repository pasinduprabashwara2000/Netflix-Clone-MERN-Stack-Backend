import {Request, Response} from "express";
import Profile from "../models/Profile";

//GET /api/profile/
export const getProfile = async (req : Request, res : Response) => {
    try {
        const profile  = await Profile.find().sort({ createdAt : -1})
        res.json(profile)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Profiles : ', error
        })
    }
}