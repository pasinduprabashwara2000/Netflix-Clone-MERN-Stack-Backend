import {Request, Response} from "express";
import Plan from "../models/Plan";

//POST /api/plan
export const createPlan = async (req : Request, res : Response) => {
    try {
        const {name, price, maxStreams, videoQuality} = req.body

        if(!name || price === undefined || !maxStreams || !videoQuality) {
            return res.status(400).json({
                message: 'name, price, max streams and video quality are required'
            })
        }

        const plan = await Plan.create({name, price, maxStreams, videoQuality})

        res.status(201).json({
            message : 'Plan Created Successfully',
            data : plan
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Save Plan : ', error : (error as Error).message
        })
    }
}

//PUT /api/plan/:id
export const updatePlan = async (req : Request, res : Response) => {
    try {
        const {name, price, maxStreams, videoQuality} = req.body

        const plan = await Plan.findByIdAndUpdate(req.params.id,
            {name, price, maxStreams, videoQuality },
            {new : true, runValidators : true})

        if(!plan){
            return res.status(404).json({
                message : 'plan not found'
            })
        }

        res.json({
            message : 'Plan Update Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Plan : ', error : (error as Error).message
        })
    }
}

//DELETE /api/plan/:id
export const deletePlan = async (req : Request, res : Response) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id)

        if(!plan){
            return res.status(404).json({
                message : 'plan not found'
            })
        }

        res.json({
            message : 'Plan Deleted Successfully',
            data : plan
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Plan : ', error : (error as Error).message
        })
    }
}

//GET /api/plan/id:
export const getPlan = async (req : Request, res : Response) => {
    try {
        const plan = await Plan.find().sort({ createdAt : -1})
        res.json(plan)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to fetch Plans : ', error : (error as Error).message
        })
    }
}