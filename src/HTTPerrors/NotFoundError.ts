import HTTP_STATUS from '../constants/statusCode';
import ApiError from './ApiError';

export default class NotFoundError extends ApiError {
  constructor(message = 'Ресурс не найден') {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}
