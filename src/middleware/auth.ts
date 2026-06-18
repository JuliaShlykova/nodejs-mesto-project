import { Request, Response, NextFunction } from 'express';

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user?._id) {
    const error = new Error('Пользователь не авторизован');
    error.name = 'AuthError';
    return next(error);
  }

  return next();
};

export default authMiddleware;
