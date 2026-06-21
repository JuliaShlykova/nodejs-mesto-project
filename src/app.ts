import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import logger from './utils/logger';
import { NotFoundError } from './HTTPerrors';
import { createUser, login } from './controllers/users';
import authMiddleware from './middleware/auth';
import errorHandler from './middleware/errorHandler';
import { validateCreateUser, validateLogin } from './middleware/validation';

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

app.post('/signin', validateLogin, login);
app.post('/signup', validateCreateUser, createUser);

app.use(authMiddleware);
app.use('/users', userRouter);
app.use('/cards', cardRouter);

// all other paths

app.use((req: Request, _res: Response, next: NextFunction) => next(new NotFoundError(`Запрашиваемый ресурс по адресу ${req.originalUrl} не найден`)));

// handling errors
app.use(errorHandler);

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
