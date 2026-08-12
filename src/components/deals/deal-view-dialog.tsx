"use client";

import { ExternalLink, Mail, Pencil, Phone } from "lucide-react";
import {
  type Contact,
  type Deal,
  type LossReason,
  BROKER_STATUS_LABELS,
  DEAL_STAGE_DOT_CLASSES,
  DEAL_STAGE_LABELS,
  KMU_COUNT_STATUS_LABELS,
  domainToUrl,
  isLostStage,
  isWonStage,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DealViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
  contacts: Contact[];
  lossReasons: LossReason[];
  onEdit: (deal: Deal) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-foreground/60">
        {label}
      </div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function DealViewDialog({
  open,
  onOpenChange,
  deal,
  contacts,
  lossReasons,
  onEdit,
}: DealViewDialogProps) {
  if (!deal) return null;

  const linkedContacts = contacts.filter((c) => c.deal_id === deal.id);
  const lossReasonLabel =
    lossReasons.find((r) => r.id === deal.loss_reason_id)?.label ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{deal.company_name}</DialogTitle>
          <DialogDescription>
            Erstellt am {new Date(deal.created_at).toLocaleDateString("de-CH")}
            {" · "}zuletzt geändert am{" "}
            {new Date(deal.updated_at).toLocaleDateString("de-CH")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Deal-Stage">
              <Badge variant="outline" className="gap-1.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    DEAL_STAGE_DOT_CLASSES[deal.stage]
                  )}
                />
                {DEAL_STAGE_LABELS[deal.stage]}
              </Badge>
            </Field>
            <Field label="Domain">
              {deal.domain ? (
                <a
                  href={domainToUrl(deal.domain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#316c9c] hover:underline"
                >
                  {deal.domain} <ExternalLink className="size-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Anzahl KMU Kunden">
              {deal.kmu_count ? (
                <>
                  {deal.kmu_count}{" "}
                  <span className="text-muted-foreground">
                    ({KMU_COUNT_STATUS_LABELS[deal.kmu_count_status]})
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Bestehender Broker?">
              {BROKER_STATUS_LABELS[deal.existing_broker]}
            </Field>
            <Field label="Nächster Schritt">
              {deal.next_step || (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Nächster Termin">
              {deal.next_meeting ? (
                new Date(deal.next_meeting).toLocaleDateString("de-CH")
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
          </div>

          {isWonStage(deal.stage) && (
            <Field label="Gewonnen">
              <div className="space-y-1.5">
                {deal.closed_won_at && (
                  <p className="text-sm font-medium text-emerald-800">
                    am{" "}
                    {new Date(deal.closed_won_at).toLocaleDateString("de-CH")}
                  </p>
                )}
                {deal.closed_reason && (
                  <p className="rounded-md bg-emerald-600/10 px-3 py-2 text-sm leading-relaxed break-words text-emerald-900">
                    {deal.closed_reason}
                  </p>
                )}
              </div>
            </Field>
          )}

          {isLostStage(deal.stage) && (
            <Field
              label={
                deal.stage === "disqualifiziert"
                  ? "Grund (disqualifiziert)"
                  : "Grund (verloren)"
              }
            >
              <div
                className={cn(
                  "space-y-1 rounded-md px-3 py-2",
                  deal.stage === "disqualifiziert"
                    ? "bg-zinc-500/10"
                    : "bg-red-700/10"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    deal.stage === "disqualifiziert"
                      ? "text-zinc-700"
                      : "text-red-900"
                  )}
                >
                  {lossReasonLabel ?? "—"}
                </p>
                {deal.closed_reason && (
                  <p
                    className={cn(
                      "text-sm leading-relaxed break-words",
                      deal.stage === "disqualifiziert"
                        ? "text-zinc-600"
                        : "text-red-900/80"
                    )}
                  >
                    {deal.closed_reason}
                  </p>
                )}
              </div>
            </Field>
          )}

          <Field label="Notizen">
            {deal.notes ? (
              <p className="leading-relaxed break-words whitespace-pre-wrap">
                {deal.notes}
              </p>
            ) : (
              <span className="text-muted-foreground">Keine Notizen.</span>
            )}
          </Field>

          <Field label="Kontaktperson(en)">
            {linkedContacts.length === 0 ? (
              <span className="text-muted-foreground">
                Keine Kontaktperson verknüpft.
              </span>
            ) : (
              <div className="space-y-1.5">
                {linkedContacts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border bg-muted/40 px-3 py-2"
                  >
                    <div className="text-sm font-medium">
                      {c.first_name} {c.last_name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <Mail className="size-3" /> {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3" /> {c.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Schliessen
          </Button>
          <Button type="button" onClick={() => onEdit(deal)}>
            <Pencil /> Bearbeiten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
