import {Request, Response} from "express";
import {isValidObjectId} from "mongoose";
import Content from "../models/Content";
import Genre from "../models/Genre";
import Season from "../models/Season";
import Episode from "../models/Episode";
import {invalidateAiCache} from "../services/AiService";

const REQUIRED = ['title', 'description', 'type', 'releaseYear', 'maturityRating', 'durationMins',
    'posterUrl', 'bannerUrl', 'trailer', 'videoUrl', 'isFeatured', 'avgRating'] as const

// keep only known fields from the request body
const pickFields = (body: Record<string, unknown> = {}) =>
    Object.fromEntries([...REQUIRED, 'genreId'].filter((key) => body[key] !== undefined).map((key) => [key, body[key]]))

//POST /api/content/   (JSON body, posterUrl and bannerUrl are plain image links)
export const createContent = async (req: Request, res : Response) => {
    try {
        const data = pickFields(req.body)

        if (REQUIRED.some((key) => data[key] === undefined || data[key] === '')){
            return res.status(400).json({
                message : 'All Fields Required'
            })
        }

        if (!data.genreId) delete data.genreId

        const content = await Content.create(data)
        invalidateAiCache()

        res.status(201).json({
            message : 'Content Created Successfully',
            data : content
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Content : ', error : (error as Error).message
        })
    }
}

//PUT /api/content/:id
export const updateContent = async (req : Request, res : Response) => {
    try {
        const id = String(req.params.id)

        if (!isValidObjectId(id)){
            return res.status(400).json({ message : 'Invalid Content Id' })
        }

        const data = pickFields(req.body)
        if ('genreId' in data) data.genreId = data.genreId || null

        const content = await Content.findByIdAndUpdate(id, data, {new : true, runValidators : true})

        if (!content){
            return res.status(404).json({
                message : 'Content Not Found'
            })
        }

        invalidateAiCache()

        res.json({
            message : 'Content Updated Successfully',
            data : content
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to update content : ', error : (error as Error).message
        })
    }
}

//DELETE /api/content/:id
export const deleteContent = async (req : Request, res : Response) => {
    try {
        const content = await Content.findByIdAndDelete(req.params.id)

        if(!content){
            return res.status(404).json({
                message : 'Content Not Found'
            })
        }

        invalidateAiCache()

        res.json({
            message : 'Content Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Content : ', error : (error as Error).message
        })
    }
}

const escapeRegex = (text : string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

//GET /api/content/?search=
export const getContent = async (req: Request, res : Response) => {
    try {
        const {search} = req.query
        const filter: Record<string, unknown> = {}

        const term = typeof search === 'string' ? search.trim().slice(0, 100) : ''

        if (term){
            const pattern = new RegExp(escapeRegex(term), 'i')
            filter.$or = [{ title : pattern }, { description : pattern }]
        }

        const content = await Content.find(filter).sort({ createdAt : -1 })

        if (term){
            // title matches first (starts-with, then contains), then description matches; best rated first inside each group
            const q = term.toLowerCase()
            const rank = (title : string) => {
                const t = title.toLowerCase()
                return t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2
            }
            content.sort((a, b) => rank(a.title) - rank(b.title) || b.avgRating - a.avgRating)
        }

        res.json(content)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Contents : ', error
        })
    }
}

//GET /api/content/:id/details  -> title + genre + seasons with episodes + similar titles
export const getContentDetails = async (req : Request, res : Response) => {
    try {
        const id = String(req.params.id)

        if (!isValidObjectId(id)){
            return res.status(400).json({ message : 'Invalid Content Id' })
        }

        const content = await Content.findById(id)

        if (!content){
            return res.status(404).json({ message : 'Content Not Found' })
        }

        const genre = content.genreId ? await Genre.findById(content.genreId).select('name') : null

        // seasons -> episodes (only series have them)
        const seasons = await Season.find({ contentId : content._id }).sort({ seasonNumber : 1 })
        const episodes = seasons.length
            ? await Episode.find({ seasonId : { $in : seasons.map((s) => s._id) } }).sort({ episodeNumber : 1 })
            : []

        const seasonsOut = seasons.map((s) => ({
            _id : s._id,
            seasonNumber : s.seasonNumber,
            title : s.title,
            releaseYear : s.releaseYear,
            episodes : episodes
                .filter((e) => e.seasonId.equals(s._id))
                .map((e) => ({
                    _id : e._id,
                    episodeNumber : e.episodeNumber,
                    title : e.title,
                    description : e.description,
                    durationMins : e.durationMinis,
                    videoUrl : e.videoUrl,
                    thumbnailUrl : e.thumbnailUrl
                }))
        }))

        // "More like this": same genre when set, otherwise same type
        const similarFilter: Record<string, unknown> = { _id : { $ne : content._id }, type : content.type }
        if (content.genreId) similarFilter.genreId = content.genreId

        let similar = await Content.find(similarFilter).sort({ avgRating : -1 }).limit(12)

        if (similar.length === 0 && content.genreId){
            similar = await Content.find({ _id : { $ne : content._id }, type : content.type })
                .sort({ avgRating : -1 }).limit(12)
        }

        res.json({
            ...content.toJSON(),
            genre : genre ? { _id : genre._id, name : genre.name } : null,
            seasons : seasonsOut,
            similar : similar.map((c) => c.toJSON())
        })
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Content Details : ', error
        })
    }
}
