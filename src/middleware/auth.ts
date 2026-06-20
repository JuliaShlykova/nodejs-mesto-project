import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../HTTPerrors';

interface TokenPayload {
  _id: string;
}

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // looking for token in headers (according to task) and cookies
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.replace('Bearer ', '');
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    throw new UnauthorizedError();
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError();
  }

  req.user = payload;

  next();
};

export default authMiddleware;
