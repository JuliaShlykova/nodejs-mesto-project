import { Router } from 'express';
import {
  dislikeCard,
  createCard, deleteCard, getCards, likeCard,
} from '../controllers/cards';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

export default router;
