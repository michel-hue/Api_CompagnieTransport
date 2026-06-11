
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEmployeDto {
  // ── Identité ────────────────────────────────────────────────────────────────
  @ApiProperty() 
  @IsString()
   @IsNotEmpty()
    nom!: string;

  @ApiProperty() 
  @IsString()
   @IsNotEmpty() 
   prenom!: string;


  @ApiProperty() 
  @IsString() 
  @IsNotEmpty()
   lieunaissance!: string;

  @ApiPropertyOptional()
   @IsString()
    @IsOptional() 
    datenaissance?: string;

  @ApiProperty()
   @IsString()
    @IsNotEmpty() 
    nationnalite!: string;

  @ApiProperty()
   @IsString()
    @IsNotEmpty() 
    lieuresidence!: string;

  @ApiProperty()
   @IsString() 
   @IsNotEmpty() 
   contact!: string;

  @ApiProperty()
   @IsEmail()
    @IsNotEmpty()
     email!: string;

  @ApiProperty()
   @IsString()
    @IsNotEmpty() 
    sexe!: string;

  // ── Identité légale ─────────────────────────────────────────────────────────
  @ApiProperty() @IsString() @IsNotEmpty() typeidentite!: string;
  @ApiProperty() @IsString() @IsNotEmpty() numeroidentite!: string;
  @ApiProperty() @IsString() @IsNotEmpty() validiteidentite!: string;

  // ── Infos médicales & famille ───────────────────────────────────────────────
  @ApiProperty() @IsString() @IsNotEmpty() groupesanguin!: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() nombreenfant?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() nommere?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() nompere?: string;

  // ── Infos professionnelles ──────────────────────────────────────────────────
  @ApiProperty() @IsString() @IsNotEmpty() matricule!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() newmatricule?: string;
  @ApiProperty() @IsString() @IsNotEmpty() dernieremployeur!: string;
  @ApiProperty() @IsString() @IsNotEmpty() niveauetude!: string;
  @ApiProperty() @IsString() @IsNotEmpty() diplome!: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() carteprofessionnelle?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() numerocarteprofessionnelle?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() datedeprisedefonction?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() statutemploye?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() type?: number;

  // ── Accès (mot de passe pour créer le compte) ───────────────────────────────
  @ApiPropertyOptional() @IsString() @IsOptional() password?: string;
}