import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.header('x-auth-token');

    // check for token
    if (!token) {
      throw new HttpException('Unauthorized!!', HttpStatus.UNAUTHORIZED);
    }

    try {
      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        req['user'] = { userId: decoded['id'] };
        next();
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.UNAUTHORIZED);
    }
  }
}
