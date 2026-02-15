import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verifyToken } from 'utils/jwt';

@Injectable()
export class JwtValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const user_id = request.body['user_id'] || request.headers['user_id'];
    const authorization = request.headers['authorization'];
    if (authorization && authorization.split(' ').length > 1) {
      return this.checkTokenValidity(authorization.split(' ')[1], user_id);
    }
    return false;
  }

  checkTokenValidity(token: string, user_id: string) {
    const validated = verifyToken(token);
    if (validated != null && validated.user_id === user_id) {
      return true;
    }
    return false;
  }
}
