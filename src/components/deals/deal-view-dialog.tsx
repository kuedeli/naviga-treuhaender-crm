"use client";

import { Mail, Pencil, Phone } from "lucide-react";
import {
  type Contact,
  type Deal,
  DEAL_STAGE_DOT_CLASSES,
  DEAL_STAGE_LABELS,
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
  onEdit,
}: DealViewDialogProps) {
  if (!deal) return null;

  const linkedContacts = contacts.filter((c) => c.deal_id === deal.id);
  const isClosed = deal.stage === "closed_won" || deal.stage === "closed_lost";

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
          <div className="flex flex-wrap items-center gap-4">
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
            <Field label="Grösse">
              {deal.company_size || (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
          </div>

          {isClosed && deal.closed_reason && (
            <Field
              label={`Begründung (${deal.stage === "closed_won" ? "gewonnen" : "verloren"})`}
            >
              <p
                className={cn(
                  "rounded-md px-3 py-2 text-sm leading-relaxed break-words",
                  deal.stage === "closed_won"
                    ? "bg-emerald-600/10 text-emerald-900"
                    : "bg-red-700/10 text-red-900"
                )}
              >
                {deal.closed_reason}
              </p>
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
