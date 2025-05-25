// gateways/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];

    if (!auth?.startsWith('Bearer ')) return false;

    const token = auth.split(' ')[1];
    try {
      request.user = jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }
}
