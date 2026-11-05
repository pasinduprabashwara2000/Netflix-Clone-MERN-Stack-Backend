import {Request, Response} from "express";
import Content from "../models/Content";

//POST /api/content/
export const createContent = async (req: Request, res : Response) => {
    try {
        const {title, description, type, releaseYear, maturityRating,
               durationMins, posterUrl, bannerUrl, trailer, videoUrl, isFeatured,
               avgRating} = req.body

        if (!title || !description || !type || releaseYear === undefined || !maturityRating ||
            !durationMins || !posterUrl || !bannerUrl || !trailer || !videoUrl || isFeatured === undefined
            || !avgRating){
            return res.status(400).json({
                message : 'All Fields Required'
            })
        }

        const content = await Content.create({title, description, type, releaseYear, maturityRating,
            durationMins, posterUrl, bannerUrl, trailer, videoUrl, isFeatured,
            avgRating})

        res.status(201).json({
            message : 'Content Created Successfully',
            data : content
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Content : ', error
        })
    }
}

//PUT /api/content/
export const updateContent = async (req : Request, res : Response) => {
    try {
        const {title, description, type, releaseYear, maturityRating,
            durationMins, posterUrl, bannerUrl, trailer, videoUrl, isFeatured,
            avgRating} = req.body

        const content = await Content.findByIdAndUpdate(req.params.id,
                        {title, description, type, releaseYear, maturityRating,
                        durationMins, posterUrl, bannerUrl, trailer, videoUrl, isFeatured,
                        avgRating},
                        {new : true, runValidators : true})

        if (!content){
            return res.status(404).json({
                message : 'Content Not Found'
            })
        }

        res.json({
            message : 'Content Updated Successfully',
            data : content
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to update content : ', error
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

        res.json({
            message : 'Content Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Content : ', error
        })
    }
}

//GET /api/content/
export const getContent = async (req : Request, res : Response) => {
    try {
        const content = await Content.find().sort({ createdAt : -1 })
        res.json(content)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Contents : ', error
        })
    }
}