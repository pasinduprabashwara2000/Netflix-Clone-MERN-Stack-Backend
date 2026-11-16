import {Request, Response} from "express";
import {isValidObjectId} from "mongoose";
import Subscription from "../models/Subscription";
import Plan from "../models/Plan";
import Stripe from "stripe";
import {AuthRequest} from "../middleware/AuthMiddleware";

// CLIENT_URL may hold several origins; redirects use the first one
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/+$/, "")

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured")
    return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// subscription with its plan filled in, as { ...subscription, plan }
const withPlan = (subscription : { toJSON() : any }) => {
    const {planId, ...rest} = subscription.toJSON()
    return {...rest, plan : planId}
}

//GET /api/subscription/me   (signed-in user; null when they have none)
export const getMySubscription = async (req : AuthRequest, res : Response) => {
    try {
        const subscription = await Subscription.findOne({userId : req.user!.id}).sort({createdAt : -1}).populate("planId")

        if (!subscription) return res.json(null)

        // an active subscription past its end date is expired
        if (subscription.status === "Active" && subscription.endDate < new Date()) {
            subscription.status = "Expired"
            await subscription.save()
        }

        res.json(withPlan(subscription))
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Load Subscription : ', error : (error as Error).message
        })
    }
}

//POST /api/subscription/me/checkout   { planId }   -> { url } of the Stripe payment page
export const createCheckout = async (req : AuthRequest, res : Response) => {
    try {
        const userId = req.user!.id
        const {planId} = req.body

        const plan = isValidObjectId(planId) ? await Plan.findById(planId) : null
        if (!plan) {
            return res.status(400).json({ message : 'Choose a valid plan' })
        }

        const current = await Subscription.findOne({userId}).sort({createdAt : -1})
        if (current?.status === "Active" && current.endDate > new Date() && String(current.planId) === String(plan._id)) {
            return res.status(400).json({ message : 'You are already on this plan' })
        }

        // the price always comes from the database, never from the client
        const session = await getStripe().checkout.sessions.create({
            mode : "payment",
            line_items : [{
                quantity : 1,
                price_data : {
                    currency : "usd",
                    unit_amount : Math.round(plan.price * 100),
                    product_data : { name : `Hotflix ${plan.name} - 1 month` }
                }
            }],
            metadata : { userId, planId : String(plan._id) },
            success_url : `${CLIENT_URL}/?session_id={CHECKOUT_SESSION_ID}#/account/plan`,
            cancel_url : `${CLIENT_URL}/?payment=cancelled#/account/plan`
        })

        res.json({ url : session.url })
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Start Payment : ', error : (error as Error).message
        })
    }
}

//POST /api/subscription/me/confirm   { sessionId }   verifies the payment with Stripe, then activates the plan
export const confirmPayment = async (req : AuthRequest, res : Response) => {
    try {
        const userId = req.user!.id
        const session = await getStripe().checkout.sessions.retrieve(String(req.body.sessionId))

        if (session.payment_status !== "paid" || session.metadata?.userId !== userId) {
            return res.status(400).json({ message : 'Payment not completed' })
        }

        // already applied (page refresh): do not extend the subscription again
        let subscription = await Subscription.findOne({userId, paymentRef : session.id})

        if (!subscription) {
            const startDate = new Date()
            const endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + 1)

            subscription = await Subscription.findOne({userId}).sort({createdAt : -1}) ?? new Subscription({userId})
            subscription.set({planId : session.metadata.planId, status : "Active", startDate, endDate, paymentRef : session.id})
            await subscription.save()
        }

        await subscription.populate("planId")

        res.json({
            message : 'Payment successful. Your plan is active',
            data : withPlan(subscription)
        })
    } catch (error) {
        res.status(500).json({
            message : 'Failed to Confirm Payment : ', error : (error as Error).message
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