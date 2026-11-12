import {Request, Response} from "express";
import Subscription from "../models/Subscription";

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