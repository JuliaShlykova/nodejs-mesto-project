import HTTP_STATUS from '../constants/statusCode';
import ApiError from './ApiError';

export default class BadRequestError extends ApiError {
  constructor(message = 'Переданы некорректные данные') {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}
