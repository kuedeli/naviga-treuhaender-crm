export type ContactStatus =
  | "neu"
  | "an_richard_uebergeben"
  | "in_deal_umgewandelt"
  | "kein_interesse";

export type DealStage =
  | "qualification"
  | "demo"
  | "evaluation"
  | "negotiation"
  | "verbal_commit"
  | "closed_won"
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
  qualification: "bg-[#316c9c]",
  demo: "bg-[#19345a]",
  evaluation: "bg-[#d1a87c]",
  negotiation: "bg-[#8a6539]",
  verbal_commit: "bg-[#151926]",
  closed_won: "bg-emerald-600",
  closed_lost: "bg-red-700",
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  qualification: "Qualification",
  demo: "Demo",
  evaluation: "Evaluation",
  negotiation: "Negotiation",
  verbal_commit: "Verbal Commit",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

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
  notes: string | null;
  created_at: string;
  updated_at: string;
}
