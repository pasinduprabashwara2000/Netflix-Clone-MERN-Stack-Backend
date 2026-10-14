import {Router} from "express";
import {createUser, updateUser, deleteUser, getUser} from "../controller/UserController";

const router = Router()

router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.get('/', getUser)

export default router