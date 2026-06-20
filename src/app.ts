import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isCelebrateError } from 'celebrate';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import logger from './utils/logger';
import HTTP_STATUS from './constants/statusCode';
import { ApiError, NotFoundError } from './HTTPerrors';
import { createUser, login } from './controllers/users';
import authMiddleware from './middleware/auth';

const PORT = Number(process.env.PORT) || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/mestodb';

const app = express();

// protection against XSS
app.use(helmet());

// protection against bruteforce and ddos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  message: { message: 'Слишком много запросов с этого IP, пожалуйста, попробуйте позже.' },
});
app.use(limiter);

app.use(cookieParser());
app.use(express.json());

// logger for every request
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();

  res.on('finish', () => {
    const responseTimeMs = (performance.now() - startTime).toFixed(2);

    logger.info({
      message: 'Request processed',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTimeMs}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
    });
  });

  next();
});

app.post('/signin', login);
app.post('/signup', createUser);

app.use(authMiddleware);
app.use('/users', userRouter);
app.use('/cards', cardRouter);

// all other paths
app.use((req: Request, _res: Response, _next: NextFunction) => {
  throw new NotFoundError(`Запрашиваемый ресурс по адресу ${req.originalUrl} не найден`);
});

// handling errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({
    message: err.message,
    name: err.name,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  // Catch custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  // Catch Celebrate Validation Errors
  if (isCelebrateError(err)) {
    const errorBody = err.details.get('body') || err.details.get('params') || err.details.get('headers');
    const message = errorBody?.details.map((d) => d.message).join('. ') || 'Ошибка валидации данных';

    return res.status(HTTP_STATUS.BAD_REQUEST).send({ message });
  }

  // Catch specific Mongoose database formatting errors
  if ('code' in err && err.code === 11000) {
    return res.status(HTTP_STATUS.CONFLICT).send({
      message: 'Пользователь с таким email уже зарегистрирован',
    });
  }

  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: 'Передан некорректный id' });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors)
      .map((error) => error.message)
      .join('. ');

    return res.status(HTTP_STATUS.BAD_REQUEST).send({
      message: messages || 'Переданы некорректные данные',
    });
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
    logger.error({
      message: 'Database connection error',
      error: e instanceof Error ? e.message : String(e),
    });
  });

app.listen(PORT, () => {
  logger.info(`App is listening on port ${PORT}`);
});
