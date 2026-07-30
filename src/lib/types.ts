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

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  neu: "Neu",
  an_richard_uebergeben: "An Richard übergeben",
  in_deal_umgewandelt: "In Deal umgewandelt",
  kein_interesse: "Kein Interesse",
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
