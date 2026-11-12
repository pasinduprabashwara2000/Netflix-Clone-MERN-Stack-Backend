import {Router} from 'express'
import {updateSubscription, getSubscription} from "../controller/SubscriptionController";

const router = Router()

router.put('/:id',updateSubscription)
router.get('/',getSubscription)

export default router