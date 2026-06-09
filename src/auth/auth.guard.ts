import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  private readonly excludedRoutes = new Set([
    JSON.stringify({ path: '/acces/connect', method: 'POST' }),
  ]);

  private isExcludedRoute(path: string, method: string): boolean {
    return this.excludedRoutes.has(JSON.stringify({ path, method }));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;

    if (this.isExcludedRoute(route.path, method)) {
      return true;
    }

    const authHeader = request.headers['authorization'];
    const apiKey = request.headers['x-api-key'];

    if (!authHeader || !apiKey) {
      throw new UnauthorizedException("Header d'autorisation ou Clé API introuvable");
    }

    try {
      const [user, isApiKeyValid] = await Promise.all([
        this.authService.verifyToken(authHeader, request),
        this.authService.verifyApiKey(apiKey),
      ]);

      if (!user || !isApiKeyValid) {
        throw new ForbiddenException('Accès refusé : Token et API Key invalides');
      }

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new UnauthorizedException('Authentification échouée');
    }
  }
}