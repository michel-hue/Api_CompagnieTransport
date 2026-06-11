import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class Utils {
  /**
   * Calcule le nombre de jours entre deux dates.
   */
  dateDiff(startDate: Date, endDate: Date): number {
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  }
 
  /**
   * Génère un mot de passe aléatoire de 12 caractères.
   * Peut être utilisé lors de la création d'un utilisateur Supabase Auth.
   */
  generateRandomPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  }
 
  /**
   * Retourne la date et l'heure actuelles sous forme d'objet Date.
   */
  getCurrentTimestamp(): Date {
    return new Date();
  }
 
  /**
   * Retourne la date actuelle + N jours au format YYYY-MM-DD.
   * Utile pour calculer des dates d'expiration ou d'échéance.
   */
  getFormatDatetoAddDay(nombreJour: number): string {
    const date = new Date();
    date.setDate(date.getDate() + nombreJour);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
 
  /**
   * Nettoie une valeur de filtre pour les requêtes Supabase.
   * Retourne null si la valeur est vide, undefined ou null.
   *
   * Exemple :
   *   const { data } = await supabase
   *     .from("demandes")
   *     .select("*")
   *     .eq("statut", utils.parseFilter(statut) ?? "en_attente");
   */
  parseFilter(value: any): any {
    return value === undefined || value === null || value === "" ? null : value;
  }
 
  /**
   * Calcule la liste des dates d'absence (timestamp) à partir d'une demande.
   * @param demande - objet avec `datedebut` (string ISO) et `duree` (number)
   */
  calculateAbsencesDates(demande: { datedebut: string; duree: number }): number[] {
    const dates: number[] = [];
    for (let i = 0; i < demande.duree; i++) {
      const date = new Date(demande.datedebut);
      date.setDate(date.getDate() + i);
      dates.push(date.getTime());
    }
    return dates;
  }
 
  /**
   * Calcule la liste des dates d'absence au format YYYY-MM-DD (string[]).
   * Compatible directement avec les colonnes `date` de Supabase.
   *
   * Exemple d'insertion :
   *   const dates = utils.calculateAbsencesDatesModifier(demande);
   *   await supabase.from("absences").insert(
   *     dates.map((date) => ({ employe_id: demande.employe_id, date }))
   *   );
   */
  calculateAbsencesDatesModifier(demande: { datedebut: string; duree: number }): string[] {
    const dates: string[] = [];
    for (let i = 0; i < demande.duree; i++) {
      const date = new Date(demande.datedebut);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().substring(0, 10));
    }
    return dates;
  }
 
  /**
   * Filtre spécifique pour un crédit employé.
   * Retourne "null" (string) si le tableau a plus d'un élément ou est vide.
   */
  parseCreditemployeFilter(value: any[]): string {
    return value.length === 1 ? value[0] : "null";
  }
}
 
// ─────────────────────────────────────────────
// Fonctions Supabase Auth (utilisateurs)
// ─────────────────────────────────────────────
 
/**
 * Crée un utilisateur dans Supabase Auth avec un mot de passe aléatoire.
 * Utile pour la création de comptes employés par un administrateur.
 *
 * @param email - Email de l'utilisateur
 * @returns L'utilisateur créé ou une erreur
 */
export async function createUserWithRandomPassword(email: string) {
  const utils = new Utils();
  const password = utils.generateRandomPassword();
 
  const { data, error } = await supabase.auth.signUp({ email, password });
 
  if (error) throw new Error(`Erreur création utilisateur : ${error.message}`);
 
  // Optionnel : envoyer le mot de passe par email via un service tiers
  console.info(`Compte créé pour ${email} — mot de passe : ${password}`);
 
  return { user: data.user, password };
}
 
// ─────────────────────────────────────────────
// Conversion montant en lettres (français / CFA)
// ─────────────────────────────────────────────
 
/**
 * Convertit un montant entier en lettres en français.
 * Exemple : 1500000 → "un million cinq cent mille francs CFA"
 *
 * Usage typique : génération de documents officiels (contrats, reçus, fiches de paie).
 */
export function montantEnLettres(n: number): string {
  if (n <= 0 || !Number.isFinite(n)) return "—";
 
  const entiers = Math.floor(n);
  const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const dizaines = [
    "", "dix", "vingt", "trente", "quarante", "cinquante",
    "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix",
  ];
 
  const toWords = (x: number): string => {
    if (x === 0) return "";
    if (x < 10) return unites[x];
    if (x < 20) {
      const u = ["dix", "onze", "douze", "treize", "quatorze", "quinze",
        "seize", "dix-sept", "dix-huit", "dix-neuf"];
      return u[x - 10];
    }
    if (x < 100) {
      const d = Math.floor(x / 10);
      const u = x % 10;
      let s = dizaines[d];
      if (d === 7) s = "soixante-" + (u < 7 ? toWords(10 + u) : "dix-" + unites[u]);
      else if (d === 9) s = "quatre-vingt-" + (u === 0 ? "dix" : toWords(10 + u));
      else if (u === 1 && d !== 8) s += "-et-un";
      else if (u > 0) s += "-" + toWords(u);
      return s;
    }
    if (x < 1000) {
      const c = Math.floor(x / 100);
      const r = x % 100;
      const cent = c === 1 ? "cent" : toWords(c) + " cent";
      return r === 0 ? cent : cent + " " + toWords(r);
    }
    if (x < 1_000_000) {
      const m = Math.floor(x / 1000);
      const r = x % 1000;
      const mille = m === 1 ? "mille" : toWords(m) + " mille";
      return r === 0 ? mille : mille + " " + toWords(r);
    }
    if (x < 1_000_000_000) {
      const m = Math.floor(x / 1_000_000);
      const r = x % 1_000_000;
      const millions = m === 1 ? "un million" : toWords(m) + " millions";
      return r === 0 ? millions : millions + " " + toWords(r);
    }
    const mrd = Math.floor(x / 1_000_000_000);
    const r = x % 1_000_000_000;
    const milliards = mrd === 1 ? "un milliard" : toWords(mrd) + " milliards";
    return r === 0 ? milliards : milliards + " " + toWords(r);
  };
 
  return toWords(entiers) + " francs CFA";
}