import {Response} from "express";
import {Types} from "mongoose";
import Profile from "../models/Profile";
import User from "../models/User";
import {AuthRequest} from "../middleware/AuthMiddleware";
import {toAiError, recommend, semanticSearch, chat, reindexAll, ChatTurn} from "../services/AiService";
import {getInsights as loadInsights, summarize} from "../services/AiInsightsService";

const isId = (v : unknown) : v is string => typeof v === "string" && Types.ObjectId.isValid(v)

// the profile must belong to the logged-in user
const findOwnProfile = (userId : string, profileId : string) =>
    Profile.findOne({ _id : profileId, userId }).select("isKids").lean()

const fail = (res : Response, error : unknown) => {
    const err = toAiError(error)
    res.status(err.status).json({ message : err.message })
}

//GET /api/ai/recommendations?profileId=
export const getRecommendations = async (req : AuthRequest, res : Response) => {
    try {
        const profileId = req.query.profileId

        if (!isId(profileId)) {
            return res.status(400).json({ message : "Valid profileId is required" })
        }

        const profile = await findOwnProfile(req.user!.id, profileId)

        if (!profile) {
            return res.status(404).json({ message : "Profile not found" })
        }

        res.json(await recommend(profile))
    } catch (error) {
        fail(res, error)
    }
}

//GET /api/ai/search?q=&profileId=
export const aiSearch = async (req : AuthRequest, res : Response) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 200) : ""

        if (!q) {
            return res.status(400).json({ message : "Search text is required" })
        }

        let profile = null
        const profileId = req.query.profileId

        if (profileId !== undefined) {
            if (!isId(profileId)) {
                return res.status(400).json({ message : "Invalid profileId" })
            }

            profile = await findOwnProfile(req.user!.id, profileId)

            if (!profile) {
                return res.status(404).json({ message : "Profile not found" })
            }
        }

        res.json(await semanticSearch(q, profile))
    } catch (error) {
        fail(res, error)
    }
}

//POST /api/ai/chat   { profileId, message, history? }
export const aiChat = async (req : AuthRequest, res : Response) => {
    try {
        const {profileId, message, history} = req.body ?? {}

        if (!isId(profileId)) {
            return res.status(400).json({ message : "Valid profileId is required" })
        }

        const text = typeof message === "string" ? message.trim().slice(0, 500) : ""

        if (!text) {
            return res.status(400).json({ message : "Message is required" })
        }

        const profile = await findOwnProfile(req.user!.id, profileId)

        if (!profile) {
            return res.status(404).json({ message : "Profile not found" })
        }

        // last few turns only, each one trimmed
        const turns : ChatTurn[] = Array.isArray(history)
            ? history
                .filter((t : any) => (t?.role === "user" || t?.role === "assistant") && typeof t.content === "string")
                .slice(-6)
                .map((t : any) => ({ role : t.role, content : t.content.slice(0, 500) }))
            : []

        res.json(await chat(profile, text, turns))
    } catch (error) {
        fail(res, error)
    }
}

const isAdmin = async (userId : string) => {
    const user = await User.findById(userId).select("role")
    return user?.role === "Admin"
}

//GET /api/ai/insights[?summary=1]   (admin only: watch analytics + optional AI summary)
export const getInsights = async (req : AuthRequest, res : Response) => {
    try {
        if (!(await isAdmin(req.user!.id))) {
            return res.status(403).json({ message : "Admin only" })
        }

        const insights = await loadInsights()
        const summary = req.query.summary === "1" ? await summarize(insights) : undefined

        res.json({ ...insights, summary })
    } catch (error) {
        fail(res, error)
    }
}

//POST /api/ai/reindex   (admin only: rebuild every title's embedding)
export const reindex = async (req : AuthRequest, res : Response) => {
    try {
        if (!(await isAdmin(req.user!.id))) {
            return res.status(403).json({ message : "Admin only" })
        }

        const count = await reindexAll()
        res.json({ message : "Reindex complete", count })
    } catch (error) {
        fail(res, error)
    }
}
