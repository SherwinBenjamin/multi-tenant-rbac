import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  
  @Injectable()
  export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const { tenantId } = request.params;
  
      if (user.role === 'superadmin') return true;
      if (user.aud !== tenantId) {
        throw new ForbiddenException('You do not belong to this tenant');
      }
      return true;
    }
  }
  