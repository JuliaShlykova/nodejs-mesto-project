import { Router } from 'express';
import {
  dislikeCard,
  createCard, deleteCard, getCards, likeCard,
} from '../controllers/cards';
import { validateCardId, validateCreateCard } from '../middleware/validation';

const router = Router();

router.get('/', getCards);
router.post('/', validateCreateCard, createCard);
router.delete('/:cardId', validateCardId, deleteCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

export default router;
