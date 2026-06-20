import HTTP_STATUS from '../constants/statusCode';
import ApiError from './ApiError';

export default class ForbiddenError extends ApiError {
  constructor(message = 'Недостаточно прав для выполнения операции') {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}
