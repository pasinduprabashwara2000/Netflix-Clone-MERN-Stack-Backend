import { Router } from 'express'
import {createPlan, updatePlan, deletePlan, getPlan} from "../controller/PlanController";

const router = Router()

router.post('/', createPlan)
router.put('/:id',updatePlan)
router.delete('/:id',deletePlan)
router.get('/',getPlan)

export default router

