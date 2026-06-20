import HTTP_STATUS from '../constants/statusCode';
import ApiError from './ApiError';

export default class ConflictError extends ApiError {
  constructor(message = 'Данный ресурс уже существует') {
    super(HTTP_STATUS.CONFLICT, message);
  }
}
