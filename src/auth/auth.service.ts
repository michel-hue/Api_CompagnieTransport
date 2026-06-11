import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JwtService } from "@nestjs/jwt";
import { FormatResponse } from "src/utils/format_response";
import { SUPABASE_CLIENT } from "src/utils/supabase.provider";
import { v4 as uuidv4 } from "uuid";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class AuthService {
  formatResponse = new FormatResponse();

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private jwtService: JwtService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Méthodes utilisées par AuthGuard
  // ─────────────────────────────────────────────────────────────────────────────

  async verifyToken(authorizationValue: string, request: any): Promise<boolean> {
    try {
      if (!authorizationValue || !authorizationValue.startsWith("Bearer ")) {
        return this.formatResponse.setResponseErrorFromToken();
      }

      const token = authorizationValue.split(" ")[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET ?? "MYSECRETKEY");

      if (!decoded?.current_user) {
        return this.formatResponse.setResponseErrorFromToken();
      }

      const { expiredon, employeid } = decoded.current_user;

      if (new Date(expiredon) < new Date()) {
        return this.formatResponse.setResponseFromAccessExpired();
      }

      request.user = decoded.current_user;
      request.created_by = employeid;

      return true;
    } catch (err:any) {
      console.error("JWT Validation Error:", err.message);
      throw new UnauthorizedException("Token JWT invalide ou expiré");
    }
  }

  async verifyApiKey(apiKey: string | string[]): Promise<boolean> {
    if (!apiKey) return false;

    try {
      const { data, error } = await this.supabase
        .from("apikey")
        .select("expiredon")
        .eq("apikey", apiKey)          // colonne "apikey"
        .single();

      if (error || !data) return false;

      return new Date(data.expiredon) >= new Date();
    } catch (error: any) {
      console.error("Erreur validation API Key:", error?.message);
      throw new ServiceUnavailableException(
        "Base de données indisponible : impossible de valider l'API Key.",
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Authentification
  // ─────────────────────────────────────────────────────────────────────────────

  async userAuth(username: string, pass: string, origine: any) {
    try {
      // 1. Chercher l'utilisateur dans la table "access"
      //  Les colonnes ont des espaces → utiliser les noms exacts entre guillemets
      const { data: result, error } = await this.supabase
        .from("access")
        .select(`
          accessid,
          username,
          password,
          expiredon,
          employeid,
          firstuse
        `)
        .eq("username",username)
        .single();

      if (error || !result) {
        return this.formatResponse.setResponseFromUserNotFound();
      }

      // 2. Vérifier le mot de passe
      const validPassword = await bcrypt.compare(pass, result.password);
      if (!validPassword) {
        return this.formatResponse.setResponseFromAccessInvalid();
      }

      // 3. Récupérer les infos complètes de l'employé
      const { data: userInfo, error: userError } = await this.supabase
        .from("employe")
        .select("*")
        .eq("employeid",result.employeid)
        .single();

      if (userError || !userInfo) {
        return this.formatResponse.setResponseFromInfoNotFount();
      }

      const infoUser = {
        ...userInfo,
        accessid:  result.accessid,
        expiredon: result.expiredon,
        firstuse:  result.username,
      };

      // 4. Générer le JWT
      const token = this.jwtService.sign(
        { current_user: infoUser },
        { expiresIn: "24h", algorithm: "HS256" },
      );

      return this.formatResponse.setResponseConnectGet({}, result, token);
    } catch (e:any) {
      console.error(e.message, e.stack);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

 

  // ─────────────────────────────────────────────────────────────────────────────
  // Déconnexion
  // ─────────────────────────────────────────────────────────────────────────────

  async deconnectUser(data: any) {
    try {
      // Log de déconnexion — à adapter si tu as une table activités
      return this.formatResponse.setResponseCreate(null);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Vérification API Key (endpoint exposé)
  // ─────────────────────────────────────────────────────────────────────────────

  async checkApiKey(apiKey: string) {
    try {
      const { data, error } = await this.supabase
        .from("apikey")
        .select("*")
        .eq("apikey", apiKey)
        .single();

      if (error) throw error;

      return this.formatResponse.setResponseGet(data);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }
}