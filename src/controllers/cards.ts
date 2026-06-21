import { NextFunction, Request, Response } from 'express';
import Card from '../models/card';
import HTTP_STATUS from '../constants/statusCode';
import { ForbiddenError, NotFoundError } from '../HTTPerrors';

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    return res.status(HTTP_STATUS.OK).send(cards);
  } catch (err) {
    return next(err);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, link } = req.body;

    const newCard = await Card.create({ name, link, owner: req.user._id });
    return res.status(HTTP_STATUS.CREATED).send(newCard);
  } catch (err) {
    return next(err);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return next(new NotFoundError(`Нет карточки с id: ${cardId}`));
    }

    if (!card.owner.equals(req.user._id)) {
      return next(new ForbiddenError('Вы не можете удалять карточки других пользователей'));
    }

    await card.deleteOne();
    return res.status(HTTP_STATUS.OK).send({ message: 'Карточка удалена' });
  } catch (err) {
    return next(err);
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;

    const updatedCard = await Card.findByIdAndUpdate(cardId, {
      $addToSet: { likes: req.user._id },
    }, { new: true });
    if (!updatedCard) {
      return next(new NotFoundError(`Нет карточки с id: ${cardId}`));
    }
    return res.status(HTTP_STATUS.OK).send(updatedCard);
  } catch (err) {
    return next(err);
  }
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;

    const updatedCard = await Card.findByIdAndUpdate(cardId, {
      $pull: { likes: req.user._id },
    }, { new: true });
    if (!updatedCard) {
      return next(new NotFoundError(`Нет карточки с id: ${cardId}`));
    }
    return res.status(HTTP_STATUS.OK).send(updatedCard);
  } catch (err) {
    return next(err);
  }
};
