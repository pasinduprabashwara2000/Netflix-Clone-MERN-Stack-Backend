import {Router} from 'express'
import {getProfile, getMyProfiles, createMyProfile, updateMyProfile, deleteMyProfile} from "../controller/ProfileController";
import {protect} from "../middleware/AuthMiddleware";

const router = Router();

// logged-in user's own profiles (keep these above any "/:id" route)
router.get('/mine', protect, getMyProfiles)
router.post('/mine', protect, createMyProfile)
router.put('/mine/:id', protect, updateMyProfile)
router.delete('/mine/:id', protect, deleteMyProfile)

router.get('/', getProfile)

export default router
