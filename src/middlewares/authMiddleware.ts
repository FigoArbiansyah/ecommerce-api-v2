import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { failedResponse } from '../utils/ResponseHelper';
import { methodType } from '../utils';
import { RequestWithUser, User } from '../types/types';

const authenticate: methodType = (requiredRoles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json(failedResponse('Unauthorized'));
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json(failedResponse('Forbidden'));
      }

      // Menetapkan user ke req.user
      req.user = decoded;

      const { role } = decoded;

      if (!requiredRoles.includes(role)) {
        return res.status(403).json(failedResponse('Forbidden'));
      }

      next();
    });
  };
};

export default authenticate;
