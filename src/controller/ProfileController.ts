import {Request, Response} from "express";
import Profile from "../models/Profile";
import WatchHistory from "../models/WatchHistory";
import {AuthRequest} from "../middleware/AuthMiddleware";

const MAX_PROFILES = 5;

//GET /api/profile/   (admin panel: all profiles)
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

//GET /api/profile/mine   (logged-in user's profiles)
export const getMyProfiles = async (req : AuthRequest, res : Response) => {
    try {
        const profiles = await Profile.find({ userId : req.user!.id }).sort({ createdAt : 1 })
        res.json(profiles)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Profiles', error : (error as Error).message
        })
    }
}

//POST /api/profile/mine
export const createMyProfile = async (req : AuthRequest, res : Response) => {
    try {
        const userId = req.user!.id
        const name = String(req.body.name ?? '').trim()
        const isKids = Boolean(req.body.isKids)

        if (!name) {
            return res.status(400).json({ message : 'Profile name is required' })
        }

        const count = await Profile.countDocuments({ userId })
        if (count >= MAX_PROFILES) {
            return res.status(400).json({ message : `You can only have ${MAX_PROFILES} profiles` })
        }

        const profile = await Profile.create({
            userId,
            name,
            isKids,
            avatarUrl : `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name + userId)}`,
            language : 'English',
            maturityLevel : isKids ? '7+' : '18+'
        })

        res.status(201).json(profile)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Profile', error : (error as Error).message
        })
    }
}

//PUT /api/profile/mine/:id   { name?, isKids? }
export const updateMyProfile = async (req : AuthRequest, res : Response) => {
    try {
        const update : Record<string, unknown> = {}

        if (req.body.name !== undefined) {
            const name = String(req.body.name).trim()
            if (!name) {
                return res.status(400).json({ message : 'Profile name is required' })
            }
            update.name = name
        }

        if (req.body.isKids !== undefined) {
            const isKids = Boolean(req.body.isKids)
            update.isKids = isKids
            update.maturityLevel = isKids ? '7+' : '18+'
        }

        const profile = await Profile.findOneAndUpdate(
            { _id : req.params.id, userId : req.user!.id },
            update,
            { new : true }
        )

        if (!profile) {
            return res.status(404).json({ message : 'Profile not found' })
        }

        res.json(profile)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Profile', error : (error as Error).message
        })
    }
}

//DELETE /api/profile/mine/:id   (also removes that profile's watch history)
export const deleteMyProfile = async (req : AuthRequest, res : Response) => {
    try {
        const profile = await Profile.findOneAndDelete({ _id : req.params.id, userId : req.user!.id })

        if (!profile) {
            return res.status(404).json({ message : 'Profile not found' })
        }

        await WatchHistory.deleteMany({ profileId : profile._id })

        res.json({ message : 'Profile Deleted Successfully' })
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Profile', error : (error as Error).message
        })
    }
}
