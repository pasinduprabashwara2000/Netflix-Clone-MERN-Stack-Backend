import {Router} from 'express'
import {createProfile, updateProfile, deleteProfile, getProfile} from "../controller/ProfileController";

const router = new Router();

router.post('/', createProfile)
router.put('/:id', updateProfile)
router.delete('/:id', deleteProfile)
router.get('/', getProfile)

export default router