import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import HTTP_STATUS from '../constants/statusCode';
import { BadRequestError, NotFoundError } from '../HTTPerrors';

export const getUsers = async (req: Request, res: Response, _next: NextFunction) => {
  const users = await User.find({});
  return res.status(HTTP_STATUS.OK).send(users);
};

export const getUserById = async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`No user with id: ${userId}`);
  }
  return res.status(HTTP_STATUS.OK).send(user);
};

export const createUser = async (req: Request, res: Response, _next: NextFunction) => {
  const { name, about, avatar } = req.body;

  if (!name || !about || !avatar) {
    throw new BadRequestError(`Check fields: name: ${name}, about: ${about}, avatar: ${avatar}`);
  }
  const newUser = await User.create({ name, about, avatar });
  return res.status(HTTP_STATUS.CREATED).send(newUser);
};

export const updateProfile = async (req: Request, res: Response, _next: NextFunction) => {
  const { name, about } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    throw new NotFoundError('Пользователь не найден');
  }

  return res.status(HTTP_STATUS.OK).send(updatedUser);
};

export const updateAvatar = async (req: Request, res: Response, _next: NextFunction) => {
  const { avatar } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    throw new NotFoundError('Пользователь не найден');
  }

  return res.status(HTTP_STATUS.OK).send(updatedUser);
};
