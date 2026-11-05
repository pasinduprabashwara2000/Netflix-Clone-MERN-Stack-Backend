import {Request, Response} from "express";
import Season from "../models/Season";

//POST /api/season/
export const createSeason = async (req : Request, res : Response) => {
    try {
        const {contentId, seasonNumber, title, releaseYear} = req.body

        if(!contentId || !seasonNumber || !title || !releaseYear) {
            return res.status(400).json({
                message : 'All fields are required'
            })
        }

        const season = await Season.create({contentId, seasonNumber, title, releaseYear})

        res.status(201).json({
            message : "Create Season Successfully",
            data : season
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Season : ', error
        })
    }
}

//PUT /api/season/:id
export const updateSeason = async (req : Request, res : Response) => {
    try {
        const {contentId, seasonNumber, title, releaseYear} = req.body

        const season = await Season.findByIdAndUpdate(req.params.id,
              {contentId, seasonNumber, title, releaseYear},
              {new : true, runValidators : true})

        if(!season){
            return res.status(404).json({
                message : 'Season Not Found'
            })
        }

        res.json({
            message : 'Season Updated Successfully',
            data : season
        })

    } catch (error) {
        return res.status(500).json({
            message : 'Failed to Update Season : ', error
        })
    }
}

//DELETE /api/delete/:id
export const deleteSeason = async (req : Request, res : Response) => {
    try {
        const season = await Season.findByIdAndDelete(req.params.id)

        if (!season) {
           return res.json({
               message : 'Season not found'
           })
        }

        res.json({
            message : 'Season Delete Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Season : ', error
        })
    }
}

//GET /api/season/
export const getSeason = async (req : Request, res : Response) => {
    try {
        const season = await Season.find().sort( {createdAt : -1} )
        return res.json(season)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to load seasons : ', error
        })
    }
}