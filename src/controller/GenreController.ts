import {Request, Response} from "express";
import Genre from "../models/Genre";

//POST /api/genre/
export const createGenre = async (req : Request, res : Response) => {
    try {
       const {name, description} = req.body

       if(!name || !description){
           return res.status(400).json({
               message : 'name and description are required'
           })
       }

       const genre = await Genre.create({name, description})
       res.status(201).json({
           message : 'Genre Created Successfully',
           data : genre
       })
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Create Genre : ', error
        })
    }
}

//PUT /api/genre/:id
export const updateGenre = async (req : Request, res : Response) => {
    try {
        const {name, description} = req.body

        const genre = await Genre.findByIdAndUpdate(req.params.id,
            {name, description},
            {new : true, runValidators : true})

        if(!genre){
            return res.status(404).json({
                message : 'Genre not found'
            })
        }

        res.json({
            message : 'Genre Updated Successfully',
            data : genre
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Genre : ', error
        })
    }
}

//DELETE /api/genre/:id
export const deleteGenre = async (req : Request, res : Response) => {
    try {
        const genre = await Genre.findByIdAndDelete(req.params.id)

        if(!genre){
            return res.status(404).json({
                message : 'Genre not found'
            })
        }

        res.json({
            message : 'Genre Deleted Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Genre : ',error
        })
    }
}

//GET /api/genre/
export const getGenre = async (req : Request, res : Response) => {
    try {
        const genre = await Genre.find().sort( {createdAt : -1} )
        res.json(genre)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to load Genre : ',error
        })
    }
}