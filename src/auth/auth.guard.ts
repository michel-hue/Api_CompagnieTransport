import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { FormatResponse } from "../utils/format_response";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly formatResponse = new FormatResponse();

  constructor(private readonly authService: AuthService) {}

  // ─── Routes exclues de l'authentification ───────────────────────────────────
  private readonly excludedRoutes = new Set([
    JSON.stringify({ path: "/acces/connect", method: "POST" }),
  ]);

  private isExcludedRoute(path: string, method: string): boolean {
    return this.excludedRoutes.has(JSON.stringify({ path, method }));
  }

  // ─── Point d'entrée principal ────────────────────────────────────────────────
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;

    // Laisser passer les routes publiques (ex: login)
    if (this.isExcludedRoute(route.path, method)) {
      return true;
    }

    const authHeader = request.headers["authorization"];
    const apiKey = request.headers["x-api-key"];

    if (!authHeader || !apiKey) {
      throw new UnauthorizedException(
        "Header d'autorisation ou Clé API introuvable",
      );
    }

    try {
      // Valider JWT et API Key en parallèle
      const [isJwtValid, isApiKeyValid] = await Promise.all([
        this.authService.verifyToken(authHeader, request),
        this.authService.verifyApiKey(apiKey),
      ]);

      // JWT invalide → utilise FormatResponse (comme dans l'ancien Guard)
      if (!isJwtValid) {
        this.formatResponse.setResponseErrorFromToken();
        throw new UnauthorizedException("Token JWT invalide ou expiré");
      }

      // API Key invalide → utilise FormatResponse
      if (!isApiKeyValid) {
        this.formatResponse.setResponseFromAccessExpired();
        throw new ForbiddenException("Accès refusé : API Key invalide ou expirée");
      }

      // Enrichir le body selon la méthode HTTP (createdby / updatedby / deletedby)
      this.applyAuditFields(request);

      return true;
    } catch (error: any) {
      // Relancer les exceptions HTTP déjà formatées
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      // Erreur inattendue
      console.error("AuthGuard — erreur inattendue :", error?.message);
      throw new UnauthorizedException("Authentification échouée");
    }
  }

  // ─── Injecte les champs d'audit dans la requête ──────────────────────────────
  /**
   * Reproduit le comportement de l'ancien Guard :
   * - POST  → body.createdby
   * - PUT   → body.updatedby
   * - DELETE → params.deletedby
   *
   * L'employeid est récupéré depuis request.user, qui est enrichi
   * par authService.verifyToken() (comme dans l'ancien Guard).
   */
  private applyAuditFields(request: any): void {
    const employeid = request?.user?.employeid;
    if (!employeid) return;

    request.created_by = employeid;

    if (request.body) {
      switch (request.method) {
        case "POST":
          request.body.createdby = employeid;
          break;
        case "PUT":
          request.body.updatedby = employeid;
          break;
        case "DELETE":
          request.params.deletedby = employeid;
          break;
      }
    }

    // Sécurité supplémentaire pour DELETE sans body
    if (request.method === "DELETE") {
      request.params.deletedby = employeid;
    }
  }
}