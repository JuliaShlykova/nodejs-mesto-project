import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import HTTP_STATUS from '../constants/statusCode';
import { NotFoundError, UnauthorizedError } from '../HTTPerrors';

export const getUsers = async (req: Request, res: Response, _next: NextFunction) => {
  const users = await User.find({});
  return res.status(HTTP_STATUS.OK).send(users);
};

export const getUserById = async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`Не найден пользователь с id: ${userId}`);
  }
  return res.status(HTTP_STATUS.OK).send(user);
};

export const createUser = async (req: Request, res: Response, _next: NextFunction) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    email,
    password: hashedPassword,
    name: name || undefined,
    about: about || undefined,
    avatar: avatar || undefined,
  };
  const newUser = await User.create(userData);
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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Неправильные почта или пароль');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new UnauthorizedError('Неправильные почта или пароль');
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

  const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '1d' });

  return res.status(HTTP_STATUS.OK).cookie('jwt', token, {
    maxAge: 3_600_000 * 24 * 1,
    httpOnly: true,
    sameSite: 'strict',
  }).send({ message: 'Авторизация прошла успешно' });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const currentUserId = req.user._id;

  const user = await User.findById(currentUserId);

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  return res.status(HTTP_STATUS.OK).send(user);
};
