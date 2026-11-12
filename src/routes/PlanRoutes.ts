import { Router } from 'express'
import {createPlan, updatePlan, getPlan} from "../controller/PlanController";

const router = Router()

router.post('/', createPlan)
router.put('/:id',updatePlan)
router.get('/',getPlan)

export default router

