import {Request, Response} from "express";
import Episode from "../models/Episode";

//POST /api/episode/
export const createEpisode = async (req : Request, res : Response) => {
    try {
        const {seasonId, episodeNumber, title, description, durationMinis, videoUrl, thumbnailUrl} = req.body

        if(!seasonId || !episodeNumber || !title || !description || !durationMinis || !videoUrl || !thumbnailUrl) {
            return res.status(201).json({
                message : 'All Fields are required'
            })
        }

        const Episode = await Episode.create({seasonId, episodeNumber, title, description, durationMinis, videoUrl, thumbnailUrl})

        return res.status(201).json({
            message : 'Episode Create Successfully',
            data : Episode
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Episode : ', error
        })
    }
}

//PUT /api/episode/:id
export const updateEpisode = async (req : Request, res : Response) => {
    try {
        const {seasonId, episodeNumber, title, description, durationMinis, videoUrl, thumbnailUrl} = req.body

        const episode = await Episode.findByIdAndUpdate(req.params.id,
                        {seasonId, episodeNumber, title, description, durationMinis, videoUrl, thumbnailUrl},
                        {new : true, runValidators : true})

        if(!episode) {
            return res.status(404).json({
                message : 'Episode not found'
            })
        }

        res.json({
            message : 'Episode Update Successfully',
            data : episode
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Episode : ',error
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
            message : 'Failed to Delete Episode : ', error
        })
    }
}