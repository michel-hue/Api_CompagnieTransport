import {
  Inject,
  Injectable,
} from "@nestjs/common";
import { SUPABASE_CLIENT } from "src/utils/supabase.provider";
import { SupabaseClient } from "@supabase/supabase-js";
import { FormatResponse } from "src/utils/format_response";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

@Injectable()
export class EmployeService {
  formatResponse = new FormatResponse();

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Créer un employé + son accès
  // ─────────────────────────────────────────────────────────────────────────────

  async createEmploye(data: any) {
    try {
      const employeid = data.employeid ?? uuidv4();

      // 1. Insérer l'employé dans la table "employe"
      const { data: employe, error: employeError } = await this.supabase
        .from("employe")
        .insert({
          employeid,
          nom:                       data.nom,
          prenom:                    data.prenom,
          lieunaissance:             data.lieunaissance,
          datenaissance:             data.datenaissance ?? null,
          nationnalite:              data.nationnalite,
          lieuresidence:             data.lieuresidence,
          contact:                   data.contact,
          email:                     data.email,
          sexe:                      data.sexe,
          typeidentite:              data.typeidentite,
          numeroidentite:            data.numeroidentite,
          validiteidentite:          data.validiteidentite,
          groupesanguin:             data.groupesanguin,
          matricule:                 data.matricule,
          newmatricule:              data.newmatricule ?? data.matricule,
          dernieremployeur:          data.dernieremployeur,
          niveauetude:               data.niveauetude,
          diplome:                   data.diplome,
          carteprofessionnelle:      data.carteprofessionnelle ?? 0,
          numerocarteprofessionnelle: data.numerocarteprofessionnelle ?? null,
          nombreenfant:              data.nombreenfant ?? 0,
          nommere:                   data.nommere ?? null,
          nompere:                   data.nompere ?? null,
          photo:                     data.photo ?? null,
          type:                      data.type ?? 0,
          datedeprisedefonction:     data.datedeprisedefonction ?? "",
          statutemploye:             data.statutemploye ?? "Actif",
          createdby:                 data.createdby ?? "Admin",
          status:                    1,
        })
        .select()
        .single();
        

      if (employeError) {
        console.error("Erreur création employé:", employeError.message);
        return this.formatResponse.setResponseErrorFromServer();
      }

      // 2. Créer l'accès (compte) de l'employé
      const motDePasse = data.password ?? uuidv4().substring(0, 8); // mot de passe auto si non fourni
      const hashedPassword = await bcrypt.hash(motDePasse, 10);

      const expiredon = new Date();
      expiredon.setFullYear(expiredon.getFullYear() + 1); // expire dans 1 an

      const { error: accessError } = await this.supabase
        .from("access")
        .insert({
          accessid:  uuidv4(),
          username:  data.email,
          password:  hashedPassword,
          expiredon: expiredon.toISOString().substring(0, 10),
          employeid,
          firstuse:  0,
          createdby: data.createdby ?? "Admin",
        });

      if (accessError) {
        console.error("Erreur création accès:", accessError.message);
        // L'employé est créé mais pas l'accès → on signale sans bloquer
        return this.formatResponse.setResponseCreate({
          ...employe,
          warning: "Employé créé mais erreur lors de la création du compte d'accès",
        });
      }

      // 3. Retourner l'employé créé + le mot de passe en clair (à envoyer par email)
      return this.formatResponse.setResponseCreate({
        ...employe,
        password_initial: motDePasse, // à envoyer par email à l'employé
      });
    } catch (error:any) {
      console.error("createEmploye exception:", error.message);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Récupérer tous les employés
  // ─────────────────────────────────────────────────────────────────────────────

  async getAllInfoEmploye() {
    try {
      const { data, error } = await this.supabase
        .from("employe")
        .select("*")
        .eq("status", 1)
        .order("createdon", { ascending: false });

      if (error) throw error;

      return this.formatResponse.setResponseGet(data);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Vérifier les doublons avant création
  // ─────────────────────────────────────────────────────────────────────────────

  async checkData(data: any) {
    try {
      const checks: any = {};

      // Vérifier email
      if (data.email) {
        const { data: emailCheck } = await this.supabase
          .from("employe")
          .select("employeid")
          .eq("email", data.email)
          .single();
        checks.emailExists = !!emailCheck;
      }

      // Vérifier matricule
      if (data.matricule) {
        const { data: matriculeCheck } = await this.supabase
          .from("employe")
          .select("employeid")
          .eq("matricule", data.matricule)
          .single();
        checks.matriculeExists = !!matriculeCheck;
      }

      // Vérifier numéro d'identité
      if (data.numeroidentite) {
        const { data: identiteCheck } = await this.supabase
          .from("employe")
          .select("employeid")
          .eq("numeroidentite", data.numeroidentite)
          .single();
        checks.numeroidentiteExists = !!identiteCheck;
      }

      return this.formatResponse.setResponseGet(checks);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Récupérer un employé par ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getEmployeById(employeid: string) {
    try {
      const { data, error } = await this.supabase
        .from("employe")
        .select("*")
        .eq("employeid", employeid)
        .single();

      if (error || !data) return this.formatResponse.setResponseFromUserNotFound();

      return this.formatResponse.setResponseGet(data);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Modifier un employé
  // ─────────────────────────────────────────────────────────────────────────────

  async updateEmploye(employeid: string, data: any) {
    try {
      const { data: updated, error } = await this.supabase
        .from("employe")
        .update({
          ...data,
          updatedon: new Date().toISOString(),
        })
        .eq("employeid", employeid)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse.setResponseCreate(updated);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Supprimer un employé (soft delete)
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteEmploye(employeid: string, deletedby: string) {
    try {
      const { error } = await this.supabase
        .from("employe")
        .update({
          status:    0,
          deletedby,
          deletedon: new Date().toISOString(),
        })
        .eq("employeid", employeid);

      if (error) throw error;

      return this.formatResponse.setResponseCreate(null);
    } catch (error) {
      console.error(error);
      return this.formatResponse.setResponseErrorFromServer();
    }
  }
}