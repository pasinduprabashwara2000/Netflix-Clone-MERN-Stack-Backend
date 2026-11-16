import {Request, Response} from "express";
import {isValidObjectId} from "mongoose";
import Episode from "../models/Episode";

const FIELDS = ['seasonId', 'episodeNumber', 'title', 'description', 'videoUrl', 'thumbnailUrl'] as const

// keep only known, non-empty fields; the admin form sends durationMins, the model field is durationMinis
const pickFields = (body : Record<string, any> = {}) => {
    const data : Record<string, unknown> = Object.fromEntries(
        FIELDS.filter((key) => body[key] !== undefined && body[key] !== '').map((key) => [key, body[key]])
    )

    const minutes = body.durationMinis ?? body.durationMins
    if (minutes !== undefined && minutes !== '') data.durationMinis = minutes

    return data
}

// add durationMins so the admin table can show it
const toClient = (episode : { toJSON() : any }) => {
    const e = episode.toJSON()
    return { ...e, durationMins : e.durationMinis }
}

//POST /api/episode/   (JSON body, thumbnailUrl is a plain image link)
export const createEpisode = async (req : Request, res : Response) => {
    try {
        const data = pickFields(req.body)

        if([...FIELDS, 'durationMinis'].some((key) => !data[key])) {
            return res.status(400).json({
                message : 'All Fields are required'
            })
        }

        const episode = await Episode.create(data)

        return res.status(201).json({
            message : 'Episode Create Successfully',
            data : toClient(episode)
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Episode : ', error : (error as Error).message
        })
    }
}

//PUT /api/episode/:id
export const updateEpisode = async (req : Request, res : Response) => {
    try {
        const id = String(req.params.id)

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message : 'Invalid Episode Id' })
        }

        const episode = await Episode.findByIdAndUpdate(id, pickFields(req.body), {new : true, runValidators : true})

        if(!episode) {
            return res.status(404).json({
                message : 'Episode not found'
            })
        }

        res.json({
            message : 'Episode Update Successfully',
            data : toClient(episode)
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Episode : ', error : (error as Error).message
        })
    }
}

//DELETE /api/episode/:id
export const deleteEpisode  = async (req: Request, res : Response) => {
    try {
        const episode = await Episode.findByIdAndDelete(req.params.id)

        if(!episode){
            return res.status(404).json({
                message : 'Episode not found'
            })
        }

        res.json({
            message : 'Episode Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Episode : ', error : (error as Error).message
        })
    }
}

//GET /api/episode/
export const getEpisode = async (_req: Request, res: Response) => {
    try {
        const episodes = await Episode.find().sort({createdAt:-1})
        return res.json(episodes.map(toClient))
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Episodes : ', error : (error as Error).message
        })
    }
}
