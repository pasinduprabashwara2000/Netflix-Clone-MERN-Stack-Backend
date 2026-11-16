import {Router} from 'express'
import {updateSubscription, getSubscription, getMySubscription, createCheckout, confirmPayment} from "../controller/SubscriptionController";
import {protect} from "../middleware/AuthMiddleware";

const router = Router()

// signed-in user's own subscription (must be declared before "/:id")
router.get('/me', protect, getMySubscription)
router.post('/me/checkout', protect, createCheckout)
router.post('/me/confirm', protect, confirmPayment)

router.put('/:id',updateSubscription)
router.get('/',getSubscription)

export default router
