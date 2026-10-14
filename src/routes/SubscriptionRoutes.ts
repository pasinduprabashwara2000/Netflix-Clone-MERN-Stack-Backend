import {Router} from 'express'
import {saveSubscription, updateSubscription, deleteSubscription, getSubscription} from "../controller/SubscriptionController";

const router = Router()

router.post('/',saveSubscription)
router.put('/:id',updateSubscription)
router.delete('/:id', deleteSubscription)
router.get('/',getSubscription)

export default router