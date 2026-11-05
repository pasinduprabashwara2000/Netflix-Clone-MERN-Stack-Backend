import {Router} from "express";
import {createGenre, updateGenre, deleteGenre, getGenre} from "../controller/GenreController";

const router = Router()

router.post('/', createGenre)
router.put('/:id', updateGenre)
router.delete('/:id', deleteGenre)
router.get('/', getGenre)

export default router