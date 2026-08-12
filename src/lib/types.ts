export type ContactStatus =
  | "neu"
  | "an_richard_uebergeben"
  | "in_deal_umgewandelt"
  | "kein_interesse";

export type DealStage =
  | "termin_gesetzt"
  | "no_show"
  | "qualifiziert"
  | "evaluierung"
  | "verhandlung"
  | "closed_won"
  | "disqualifiziert"
  | "closed_lost";

export type FieldCheckStatus = "korrekt" | "unsicher" | "falsch";

export const FIELD_CHECK_LABELS: Record<FieldCheckStatus, string> = {
  korrekt: "Korrekt",
  unsicher: "Unsicher",
  falsch: "Falsch",
};

export const FIELD_CHECK_DOT_CLASSES: Record<FieldCheckStatus, string> = {
  korrekt: "bg-emerald-500",
  unsicher: "bg-amber-400",
  falsch: "bg-red-500",
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  neu: "Neu",
  an_richard_uebergeben: "An Richard übergeben",
  in_deal_umgewandelt: "In Deal umgewandelt",
  kein_interesse: "Kein Interesse",
};

export const DEAL_STAGE_DOT_CLASSES: Record<DealStage, string> = {
  termin_gesetzt: "bg-[#316c9c]",
  no_show: "bg-orange-400",
  qualifiziert: "bg-[#19345a]",
  evaluierung: "bg-[#d1a87c]",
  verhandlung: "bg-[#151926]",
  closed_won: "bg-emerald-600",
  disqualifiziert: "bg-zinc-400",
  closed_lost: "bg-red-700",
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  termin_gesetzt: "Termin gesetzt (Lead)",
  no_show: "No Show",
  qualifiziert: "Qualifiziert (Bearbeiteter Lead)",
  evaluierung: "Evaluierung",
  verhandlung: "Verhandlung",
  closed_won: "Closed Won",
  disqualifiziert: "Disqualifiziert",
  closed_lost: "Closed Lost",
};

/** Endstationen, die beim Verschieben einen Dialog verlangen */
export function isWonStage(stage: DealStage) {
  return stage === "closed_won";
}

export function isLostStage(stage: DealStage) {
  return stage === "disqualifiziert" || stage === "closed_lost";
}

export function isEndStage(stage: DealStage) {
  return isWonStage(stage) || isLostStage(stage);
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  email_status: FieldCheckStatus;
  phone_status: FieldCheckStatus;
  status: ContactStatus;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  company_name: string;
  company_size: string | null;
  stage: DealStage;
  closed_reason: string | null;
  closed_won_at: string | null;
  loss_reason_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LossReason {
  id: string;
  label: string;
  created_at: string;
}
