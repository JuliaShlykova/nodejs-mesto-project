import { NextFunction, Request, Response } from 'express';
import Card from '../models/card';
import HTTP_STATUS from '../constants/statusCode';

export const getCards = async (req: Request, res: Response, _next: NextFunction) => {
  const cards = await Card.find({});
  return res.status(HTTP_STATUS.OK).send(cards);
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;

  if (!name || !link) {
    const error = new Error(`Check fields: name: ${name}, link: ${link}`);
    error.name = 'ValidationError';
    return next(error);
  }

  const newCard = await Card.create({ name, link, owner: req.user._id });
  return res.status(HTTP_STATUS.CREATED).send(newCard);
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  const card = await Card.findById(cardId);
  if (!card) {
    const error = new Error(`No card with id: ${cardId}`);
    error.name = 'NotFoundError';
    return next(error);
  }
  await card.deleteOne();
  return res.sendStatus(HTTP_STATUS.NO_CONTENT);
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  const updatedCard = await Card.findByIdAndUpdate(cardId, {
    $addToSet: { likes: req.user._id },
  }, { new: true });
  if (!updatedCard) {
    const error = new Error(`No card with id: ${cardId}`);
    error.name = 'NotFoundError';
    return next(error);
  }
  return res.status(HTTP_STATUS.OK).send(updatedCard);
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  const updatedCard = await Card.findByIdAndUpdate(cardId, {
    $pull: { likes: req.user._id },
  }, { new: true });
  if (!updatedCard) {
    const error = new Error(`No card with id: ${cardId}`);
    error.name = 'NotFoundError';
    return next(error);
  }
  return res.status(HTTP_STATUS.OK).send(updatedCard);
};
