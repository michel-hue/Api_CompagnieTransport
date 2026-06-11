import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthDto } from "./auth.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "./auth.guard";
import { Inject } from "@nestjs/common";
import { SUPABASE_CLIENT } from "src/utils/supabase.provider";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

@Controller("access")

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Connexion
  // ─────────────────────────────────────────────────────────────────────────────

  @Post("/connect")
  @ApiOperation({ summary: "Connecter un utilisateur" })
  @ApiResponse({ status: 200, description: "Connexion réussie.", type: AuthDto })
  @ApiResponse({ status: 401, description: "Identifiants invalides." })
  @ApiResponse({ status: 503, description: "Erreur serveur." })
  async connectUser(@Body() data: AuthDto, @Req() req: any) {
    return await this.authService.userAuth(
      data.username,
      data.password,
      this.getOrigine(req),
    );
  }

  @Post("/deconnect")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Déconnecter un utilisateur" })
  @ApiResponse({ status: 200, description: "Déconnexion réussie." })
  @ApiResponse({ status: 503, description: "Erreur serveur." })
  async deconnectUser(@Body() data: any, @Req() req: any) {
    return await this.authService.deconnectUser({
      utilisateurid: data.employeid,
      origine: this.getOrigine(req),
    });
  }

 
  // @Post("/enrolementinfo")
  // @UseGuards(AuthGuard)
  // @ApiOperation({ summary: "Infos pour l'enrôlement" })
  // @ApiResponse({ status: 200, description: "Données récupérées avec succès." })
  // @ApiResponse({ status: 503, description: "Erreur serveur." })
  // async enrolementInfo() {
  //   return await this.employeService.getAllInfoEmploye();
  // }

  // ─────────────────────────────────────────────────────────────────────────────
  // Nationalités
  // ─────────────────────────────────────────────────────────────────────────────

  // @Post("/nationalite")
  // @UseGuards(AuthGuard)
  // @ApiOperation({ summary: "Liste des nationalités" })
  // @ApiResponse({ status: 200, description: "Liste récupérée avec succès." })
  // @ApiResponse({ status: 503, description: "Erreur serveur." })
  // async getFullNationalite() {
  //   return await this.nationaliteService.getNationalite();
  // }

  // ─────────────────────────────────────────────────────────────────────────────
  // Vérification des doublons
  // ─────────────────────────────────────────────────────────────────────────────

  // @Post("/checkdata")
  // @UseGuards(AuthGuard)
  // @ApiOperation({ summary: "Vérifier les doublons avant enrôlement" })
  // @ApiResponse({ status: 200, description: "Vérification effectuée." })
  // @ApiResponse({ status: 503, description: "Erreur serveur." })
  // async checkData(@Body() data: any) {
  //   return await this.employeService.checkData(data);
  // }

  // ─────────────────────────────────────────────────────────────────────────────
  // Création d'un employé avec photo (Supabase Storage)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Remplace MinioUploadService par Supabase Storage.
   * Le fichier est uploadé dans le bucket "photos" (à créer dans Supabase Dashboard).
   *
   * Pour créer le bucket :
   *   Supabase Dashboard → Storage → New bucket → "photos" → Public: true
   */
  // @Post("/insertfree")
  // @UseInterceptors(FileInterceptor("photo"))
  // @UsePipes(new ValidationPipe({ whitelist: true, skipNullProperties: true }))
  // @ApiOperation({ summary: "Créer un employé avec photo" })
  // @ApiResponse({ status: 200, description: "Employé créé avec succès.", type: CreateemployeDto })
  // @ApiResponse({ status: 503, description: "Erreur serveur." })
  // async createEmploye(
  //   @Body() data: any,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: any,
  // ) {
  //   data.employeid = uuidv4();
  //   data.createdby = req.created_by ?? "Admin";

  //   // Upload de la photo vers Supabase Storage (remplace Minio)
  //   if (file) {
  //     const filename = `${uuidv4()}_${file.originalname}`;

  //     const { data: uploadData, error } = await this.supabase.storage
  //       .from("photos")                    // ← nom de ton bucket Supabase Storage
  //       .upload(filename, file.buffer, {
  //         contentType: file.mimetype,
  //         upsert: false,
  //       });

  //     if (error) {
  //       console.error("Erreur upload Supabase Storage:", error.message);
  //       // On continue sans photo plutôt que de bloquer la création
  //       data.photo = file.originalname;
  //     } else {
  //       // Récupérer l'URL publique du fichier uploadé
  //       const { data: publicUrl } = this.supabase.storage
  //         .from("photos")
  //         .getPublicUrl(filename);

  //       data.photo = publicUrl.publicUrl;
  //     }
  //   }

  //   return await this.employeService.createEmploye(data);
  // }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utilitaire privé
  // ─────────────────────────────────────────────────────────────────────────────

  private getOrigine(req: any): string {
    return req.headers["origin"] ?? req.headers["referer"] ?? "unknown";
  }
}