import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; // pas de rôle requis

    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    const userRole = user?.user_metadata?.role;

    if (!roles.includes(userRole)) {
      throw new ForbiddenException('Accès refusé');
    }

    return true;
  }
}