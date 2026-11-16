import {Response} from "express";
import {Types} from "mongoose";
import WatchHistory from "../models/WatchHistory";
import Profile from "../models/Profile";
import Content from "../models/Content";
import "../models/Episode";
import "../models/Season";
import {AuthRequest} from "../middleware/AuthMiddleware";

const isId = (v : unknown) : v is string => typeof v === "string" && Types.ObjectId.isValid(v)

// the profile must belong to the logged-in user
const ownsProfile = (userId : string, profileId : string) =>
    Profile.exists({ _id : profileId, userId })

//GET /api/history?profileId=
export const getHistory = async (req : AuthRequest, res : Response) => {
    try {
        const profileId = req.query.profileId

        if (!isId(profileId)) {
            return res.status(400).json({ message : "Valid profileId is required" })
        }

        if (!(await ownsProfile(req.user!.id, profileId))) {
            return res.status(404).json({ message : "Profile not found" })
        }

        const rows = await WatchHistory.find({ profileId })
            .sort({ watchedAt : -1 })
            .limit(100)
            .populate("contentId", "title type avgRating maturityRating releaseYear posterUrl posterType updatedAt")
            .populate({
                path : "episodeId",
                select : "title episodeNumber seasonId",
                populate : { path : "seasonId", select : "seasonNumber", model : "Season" }
            })
            .lean()

        const data = rows
            // title may have been deleted by an admin
            .filter((row) => row.contentId)
            .map((row) => {
                const c : any = row.contentId
                const e : any = row.episodeId

                return {
                    _id : row._id,
                    watchedAt : row.watchedAt,
                    content : {
                        _id : c._id,
                        title : c.title,
                        type : c.type,
                        avgRating : c.avgRating,
                        maturityRating : c.maturityRating,
                        releaseYear : c.releaseYear,
                        posterUrl : c.posterType
                            ? `/api/content/${c._id}/poster?v=${new Date(c.updatedAt).getTime()}`
                            : c.posterUrl
                    },
                    episode : e
                        ? {
                            _id : e._id,
                            title : e.title,
                            episodeNumber : e.episodeNumber,
                            seasonNumber : e.seasonId?.seasonNumber
                        }
                        : null
                }
            })

        res.json(data)
    } catch (error) {
        res.status(500).json({
            message : "Failed to Load Watch History", error : (error as Error).message
        })
    }
}

//POST /api/history   { profileId, contentId, episodeId? }
export const addHistory = async (req : AuthRequest, res : Response) => {
    try {
        const {profileId, contentId, episodeId} = req.body

        if (!isId(profileId) || !isId(contentId)) {
            return res.status(400).json({ message : "profileId and contentId are required" })
        }

        if (!(await ownsProfile(req.user!.id, profileId))) {
            return res.status(404).json({ message : "Profile not found" })
        }

        if (!(await Content.exists({ _id : contentId }))) {
            return res.status(404).json({ message : "Title not found" })
        }

        const update : Record<string, any> = { $set : { watchedAt : new Date() } }

        if (isId(episodeId)) {
            update.$set.episodeId = episodeId
        } else {
            update.$unset = { episodeId : 1 }
        }

        try {
            await WatchHistory.findOneAndUpdate({ profileId, contentId }, update, { upsert : true })
        } catch (err : any) {
            // two requests created the same row at once: it already exists, so that's fine
            if (err?.code !== 11000) throw err
        }

        res.status(201).json({ message : "History Saved" })
    } catch (error) {
        res.status(500).json({
            message : "Failed to Save History", error : (error as Error).message
        })
    }
}

//DELETE /api/history/:id   (remove one title)
export const removeHistory = async (req : AuthRequest, res : Response) => {
    try {
        const entry = await WatchHistory.findById(req.params.id)

        if (!entry || !(await ownsProfile(req.user!.id, entry.profileId.toString()))) {
            return res.status(404).json({ message : "History item not found" })
        }

        await entry.deleteOne()
        res.json({ message : "Removed from History" })
    } catch (error) {
        res.status(500).json({
            message : "Failed to Remove History Item", error : (error as Error).message
        })
    }
}

//DELETE /api/history?profileId=   (clear everything for a profile)
export const clearHistory = async (req : AuthRequest, res : Response) => {
    try {
        const profileId = req.query.profileId

        if (!isId(profileId)) {
            return res.status(400).json({ message : "Valid profileId is required" })
        }

        if (!(await ownsProfile(req.user!.id, profileId))) {
            return res.status(404).json({ message : "Profile not found" })
        }

        await WatchHistory.deleteMany({ profileId })
        res.json({ message : "Watch History Cleared" })
    } catch (error) {
        res.status(500).json({
            message : "Failed to Clear History", error : (error as Error).message
        })
    }
}
