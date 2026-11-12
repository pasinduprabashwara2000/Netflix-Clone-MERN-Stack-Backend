import {Router} from 'express'
import {getProfile} from "../controller/ProfileController";

const router = new Router();

router.get('/', getProfile)

export default router