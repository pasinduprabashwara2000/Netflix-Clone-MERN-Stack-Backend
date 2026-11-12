import {Router} from "express";
import {createUser, updateUser,getUser} from "../controller/UserController";

const router = Router()

router.post('/', createUser)
router.put('/:id', updateUser)
router.get('/', getUser)

export default router