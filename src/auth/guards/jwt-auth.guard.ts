import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Add custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      // Log the info for debugging, e.g., token expiration or signature issues
      if (info) {
        console.error('JWT Auth Guard Error Info:', info.message);
      }
      throw err || new UnauthorizedException(info?.message || 'Unauthorized access. Invalid or expired token.');
    }
    return user;
  }
}
