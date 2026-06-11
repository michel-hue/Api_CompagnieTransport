import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { EmployeService } from "./employe.service";

import { Inject } from "@nestjs/common";
import { SUPABASE_CLIENT } from "src/utils/supabase.provider";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateEmployeDto } from "./dto/create-employe.dto";

@Controller("employe")
@UseGuards(AuthGuard)
export class EmployeController {
  constructor(
    private readonly employeService: EmployeService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Créer un employé avec photo (Supabase Storage)
  // ─────────────────────────────────────────────────────────────────────────────

  @Post("/create")
  @UseInterceptors(FileInterceptor("photo"))
  @UsePipes(new ValidationPipe({ whitelist: true, skipNullProperties: true }))
  @ApiOperation({ summary: "Créer un employé" })
  @ApiResponse({ status: 200, description: "Employé créé avec succès.", type: CreateEmployeDto })
  @ApiResponse({ status: 503, description: "Erreur serveur." })
  async createEmploye(
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    data.employeid = uuidv4();
    data.createdby = req.created_by ?? "Admin";

    // Upload photo vers Supabase Storage si fournie
    if (file) {
      const filename = `${uuidv4()}_${file.originalname}`;
      const { data: uploadData, error } = await this.supabase.storage
        .from("photos")                  // ← ton bucket Supabase Storage
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (!error) {
        const { data: publicUrl } = this.supabase.storage
          .from("photos")
          .getPublicUrl(filename);
        data.photo = publicUrl.publicUrl;
      } else {
        data.photo = file.originalname;
      }
    }

    return await this.employeService.createEmploye(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Récupérer tous les employés
  // ─────────────────────────────────────────────────────────────────────────────

  @Get("/all")
  @ApiOperation({ summary: "Liste de tous les employés actifs" })
  @ApiResponse({ status: 200, description: "Liste récupérée avec succès." })
  async getAllEmploye() {
    return await this.employeService.getAllInfoEmploye();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Récupérer un employé par ID
  // ─────────────────────────────────────────────────────────────────────────────

  @Get("/:employeid")
  @ApiOperation({ summary: "Récupérer un employé par ID" })
  @ApiResponse({ status: 200, description: "Employé trouvé." })
  @ApiResponse({ status: 404, description: "Employé introuvable." })
  async getEmployeById(@Param("employeid") employeid: string) {
    return await this.employeService.getEmployeById(employeid);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Modifier un employé
  // ─────────────────────────────────────────────────────────────────────────────

  @Put("/:employeid")
  @UsePipes(new ValidationPipe({ whitelist: true, skipNullProperties: true }))
  @ApiOperation({ summary: "Modifier un employé" })
  @ApiResponse({ status: 200, description: "Employé modifié avec succès." })
  async updateEmploye(
    @Param("employeid") employeid: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    data.updatedby = req.created_by ?? "Admin";
    return await this.employeService.updateEmploye(employeid, data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Supprimer un employé (soft delete)
  // ─────────────────────────────────────────────────────────────────────────────

  @Delete("/:employeid")
  @ApiOperation({ summary: "Supprimer un employé (soft delete)" })
  @ApiResponse({ status: 200, description: "Employé supprimé avec succès." })
  async deleteEmploye(
    @Param("employeid") employeid: string,
    @Req() req: any,
  ) {
    const deletedby = req.params?.deletedby ?? req.created_by ?? "Admin";
    return await this.employeService.deleteEmploye(employeid, deletedby);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Vérifier les doublons
  // ─────────────────────────────────────────────────────────────────────────────

  @Post("/checkdata")
  @ApiOperation({ summary: "Vérifier les doublons avant création" })
  @ApiResponse({ status: 200, description: "Vérification effectuée." })
  async checkData(@Body() data: any) {
    return await this.employeService.checkData(data);
  }
}