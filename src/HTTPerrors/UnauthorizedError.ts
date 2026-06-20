import HTTP_STATUS from '../constants/statusCode';
import ApiError from './ApiError';

export default class UnauthorizedError extends ApiError {
  constructor(message = 'Необходима авторизация') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}
