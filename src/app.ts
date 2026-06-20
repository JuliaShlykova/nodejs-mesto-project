import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import logger from './utils/logger';
import HTTP_STATUS from './constants/statusCode';
import { ApiError } from './HTTPerrors';

const PORT = Number(process.env.PORT) || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/mestodb';

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  req.user = {
    _id: '6a33a0c59e82a14e87014bab',
  };

  next();
});

app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new Error(`Запрашиваемый ресурс по адресу ${req.originalUrl} не найден`);
  error.name = 'NotFoundError';
  return next(error);
});

// handling errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.name}: ${err.message}`);

  // Catch ALL of your custom API errors instantly using instanceof
  if (err instanceof ApiError) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  // Handle specific Mongoose database formatting errors
  if ('code' in err && err.code === 11000) {
    return res.status(HTTP_STATUS.CONFLICT).send({
      message: 'Пользователь с таким email уже зарегистрирован',
    });
  }

  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: 'Передан некорректный id' });
  }
  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
  }

  // Fallback for unexpected global server crashes
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
});

mongoose
  .connect(DB_URL)
  .then(() => {
    logger.info('Successfully connected to MongoDB (mestodb)');
  })
  .catch((e) => {
    logger.error('Database connection error:', e);
  });

app.listen(PORT, () => {
  logger.info(`App is listening on port ${PORT}`);
});
