import {Request, Response} from "express";
import Subscription from "../models/Subscription";

//SAVE /api/save/
export const saveSubscription = async (req : Request, res : Response) => {
    try {
        const {userId, planId, status, startDate, endDate, paymentRef} = req.body

        if(!userId || !planId || !status || !startDate || !endDate || !paymentRef) {
            return res.status(400).json({
                message : 'User Id , Plan Id, Status, Start Date, End Date and Payment Ref are required'
            })
        }

        const subscription = await Subscription.create({userId, planId, status, startDate, endDate, paymentRef})

        res.status(201).json({
            message : 'Subscription Save Successfully',
            data : subscription
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Save Subscription : ', error : (error as Error).message
        })
    }
}

//UPDATE /api/update/:id
export const updateSubscription = async (req : Request, res: Response) => {
    try {
        const {userId, planId, status, startDate, endDate, paymentRef} = req.body

        const subscription = await Subscription.findByIdAndUpdate(req.params.id,
            {userId,planId,status,startDate,endDate,paymentRef},
            {new : true, runValidators : true})

        if(!subscription){
            return res.status(404).json({
                message : 'Subscription not found'
            })
        }

        res.json({
            message : 'Subscription Update Successfully',
            data : subscription
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Update Subscription : ', error : (error as Error).message
        })
    }
}

//DELETE /api/subscription/:id
export const deleteSubscription = async (req : Request, res : Response) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id)

        if(!subscription){
            return res.status(404).json({
                message : 'Subscription not found'
            })
        }

        res.json({
            message : 'Subscription Delete Successfully'
        })

    } catch (error) {
        res.status(500).json({
            message : 'Failed to Delete Subscription', error : (error as Error).message
        })
    }
}

//GET /api/subscription/
export const getSubscription = async (req : Request, res : Response) => {
    try {
        const subscription = await Subscription.find().sort( { createdAt : -1} )
        res.json(subscription)
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Fetch Subscriptions : ', error : (error as Error).message
        })
    }
}