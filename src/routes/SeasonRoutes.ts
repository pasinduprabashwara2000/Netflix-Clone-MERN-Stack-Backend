import Router from 'express'
import {createSeason, updateSeason, deleteSeason, getSeason} from "../controller/SeasonController";

const router = new Router()

router.post('/', createSeason)
router.put('/:id', updateSeason)
router.delete('/:id', deleteSeason)
router.get('/', getSeason)

export default router
