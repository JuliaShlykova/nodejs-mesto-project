import { NextFunction, Request, Response } from 'express';
import { isCelebrateError } from 'celebrate';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { ApiError } from '../HTTPerrors';
import HTTP_STATUS from '../constants/statusCode';

const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
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
    // Array.from converts the Map iterator into a safe, standard array of entries [[key, value]]
    const message = Array.from(err.details.values())
      // flatMap flattens the individual validation error details arrays into one single array
      .flatMap((joiError) => joiError.details)
      // Clean up the escaped double quotes from each error message text
      .map((detail) => detail.message.replace(/"/g, ''))
      // Join all distinct field errors with a period and space
      .join('. ');

    return res.status(HTTP_STATUS.BAD_REQUEST).send({
      message: message || 'Ошибка валидации данных',
    });

    // const errorBody = err.details.get('body') || err.details.get('params') || err.details.get('headers');
    // const message = errorBody?.details.map((d) => d.message).join('. ') || 'Ошибка валидации данных';

    // return res.status(HTTP_STATUS.BAD_REQUEST).send({ message });
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
};

export default errorHandler;
