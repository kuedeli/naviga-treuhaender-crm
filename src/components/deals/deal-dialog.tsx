"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type BrokerStatus,
  type Contact,
  type Deal,
  type DealStage,
  type KmuCountStatus,
  type LossReason,
  BROKER_STATUS_LABELS,
  DEAL_STAGE_LABELS,
  KMU_COUNT_STATUS_LABELS,
  isEndStage,
  isLostStage,
  isWonStage,
} from "@/lib/types";
import { LossReasonSelect } from "@/components/deals/loss-reason-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = neuen Deal erfassen, sonst bearbeiten */
  deal: Deal | null;
  contacts: Contact[];
  lossReasons: LossReason[];
  onReasonCreated: (reason: LossReason) => void;
  onSaved: () => void;
}

export function DealDialog({
  open,
  onOpenChange,
  deal,
  contacts,
  lossReasons,
  onReasonCreated,
  onSaved,
}: DealDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [kmuCount, setKmuCount] = useState("");
  const [kmuCountStatus, setKmuCountStatus] =
    useState<KmuCountStatus>("geschaetzt");
  const [existingBroker, setExistingBroker] =
    useState<BrokerStatus>("unbekannt");
  const [nextStep, setNextStep] = useState("");
  const [nextMeeting, setNextMeeting] = useState("");
  const [stage, setStage] = useState<DealStage>("termin_gesetzt");
  const [closedReason, setClosedReason] = useState("");
  const [lossReasonId, setLossReasonId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [addContactId, setAddContactId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCompanyName(deal?.company_name ?? "");
      setDomain(deal?.domain ?? "");
      setKmuCount(deal?.kmu_count ?? "");
      setKmuCountStatus(deal?.kmu_count_status ?? "geschaetzt");
      setExistingBroker(deal?.existing_broker ?? "unbekannt");
      setNextStep(deal?.next_step ?? "");
      setNextMeeting(deal?.next_meeting ?? "");
      setStage(deal?.stage ?? "termin_gesetzt");
      setClosedReason(deal?.closed_reason ?? "");
      setLossReasonId(deal?.loss_reason_id ?? null);
      setNotes(deal?.notes ?? "");
      setAddContactId(null);
    }
  }, [open, deal]);

  const linkedContacts = deal
    ? contacts.filter((c) => c.deal_id === deal.id)
    : [];
  const availableContacts = contacts.filter((c) => c.deal_id === null);
  const availableItems = Object.fromEntries(
    availableContacts.map((c) => [c.id, `${c.first_name} ${c.last_name}`])
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLostStage(stage) && !lossReasonId) {
      toast.error("Bitte einen Grund auswählen oder erfassen.");
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const values = {
      company_name: companyName.trim(),
      domain: domain.trim() || null,
      kmu_count: kmuCount.trim() || null,
      kmu_count_status: kmuCountStatus,
      existing_broker: existingBroker,
      next_step: nextStep.trim() || null,
      next_meeting: nextMeeting || null,
      stage,
      closed_reason: isEndStage(stage) ? closedReason.trim() || null : null,
      loss_reason_id: isLostStage(stage) ? lossReasonId : null,
      // Datum wird beim ersten Verschieben nach Closed Won gesetzt und bleibt danach stehen
      closed_won_at: isWonStage(stage)
        ? (deal?.closed_won_at ?? new Date().toISOString())
        : null,
      notes: notes.trim() || null,
    };

    const { error } = deal
      ? await supabase.from("deals").update(values).eq("id", deal.id)
      : await supabase.from("deals").insert(values);

    setSaving(false);

    if (error) {
      toast.error("Speichern fehlgeschlagen. Bitte nochmals versuchen.");
      return;
    }

    toast.success(deal ? "Deal aktualisiert." : "Deal erstellt.");
    onOpenChange(false);
    onSaved();
  }

  async function linkContact() {
    if (!deal || !addContactId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({ deal_id: deal.id, status: "in_deal_umgewandelt" })
      .eq("id", addContactId);

    if (error) {
      toast.error("Verknüpfen fehlgeschlagen.");
      return;
    }
    setAddContactId(null);
    onSaved();
  }

  async function unlinkContact(contactId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({ deal_id: null, status: "an_richard_uebergeben" })
      .eq("id", contactId);

    if (error) {
      toast.error("Entfernen fehlgeschlagen.");
      return;
    }
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{deal ? "Deal bearbeiten" : "Neuer Deal"}</DialogTitle>
          <DialogDescription>
            {deal
              ? "Angaben anpassen und speichern."
              : "Neuen Deal für ein Treuhandunternehmen erstellen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company_name">Firmenname</Label>
              <Input
                id="company_name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal_domain">Domain</Label>
              <Input
                id="deal_domain"
                placeholder="z. B. mustertreuhand.ch"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kmu_count">Anzahl KMU Kunden</Label>
            <div className="flex gap-2">
              <Input
                id="kmu_count"
                placeholder="z. B. 25"
                className="flex-1"
                value={kmuCount}
                onChange={(e) => setKmuCount(e.target.value)}
              />
              <Select
                items={KMU_COUNT_STATUS_LABELS}
                value={kmuCountStatus}
                onValueChange={(v) => setKmuCountStatus(v as KmuCountStatus)}
              >
                <SelectTrigger
                  aria-label="KMU-Anzahl-Status"
                  className="w-32 shrink-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KMU_COUNT_STATUS_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bestehender Broker?</Label>
            <Select
              items={BROKER_STATUS_LABELS}
              value={existingBroker}
              onValueChange={(v) => setExistingBroker(v as BrokerStatus)}
            >
              <SelectTrigger
                aria-label="Bestehender Broker"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BROKER_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deal-Stage</Label>
            <Select
              items={DEAL_STAGE_LABELS}
              value={stage}
              onValueChange={(value) => setStage(value as DealStage)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEAL_STAGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isWonStage(stage) && (
            <div className="space-y-2">
              <Label htmlFor="closed_reason">Begründung (gewonnen)</Label>
              <Textarea
                id="closed_reason"
                required
                placeholder="z. B. Partnerschaft vereinbart, Start per 1.9."
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
              />
            </div>
          )}

          {isLostStage(stage) && (
            <>
              <div className="space-y-2">
                <Label>Grund</Label>
                <LossReasonSelect
                  reasons={lossReasons}
                  value={lossReasonId}
                  onChange={setLossReasonId}
                  onReasonCreated={onReasonCreated}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closed_reason">Erklärung (optional)</Label>
                <Textarea
                  id="closed_reason"
                  placeholder="Details zum Grund …"
                  value={closedReason}
                  onChange={(e) => setClosedReason(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="next_step">Nächster Schritt</Label>
              <Input
                id="next_step"
                placeholder="z. B. Offerte nachfassen"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_meeting">Nächster Termin</Label>
              <Input
                id="next_meeting"
                type="date"
                value={nextMeeting}
                onChange={(e) => setNextMeeting(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal_notes">Notizen</Label>
            <Textarea
              id="deal_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {deal && (
            <div className="space-y-2">
              <Label>Kontaktperson(en)</Label>
              <div className="space-y-1.5">
                {linkedContacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Noch keine Kontaktperson verknüpft.
                  </p>
                )}
                {linkedContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-1.5 text-sm"
                  >
                    <span>
                      {c.first_name} {c.last_name}
                      {c.email ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {c.email}
                        </span>
                      ) : null}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => unlinkContact(c.id)}
                    >
                      <X />
                      <span className="sr-only">Entfernen</span>
                    </Button>
                  </div>
                ))}
                {availableContacts.length > 0 ? (
                  <div className="flex items-center gap-2 pt-1">
                    <Select
                      items={availableItems}
                      value={addContactId}
                      onValueChange={(value) =>
                        setAddContactId(value as string)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Kontakt auswählen …" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableContacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!addContactId}
                      onClick={linkContact}
                    >
                      <Plus /> Verknüpfen
                    </Button>
                  </div>
                ) : (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Kein weiterer Kontakt verfügbar — alle erfassten Kontakte
                    sind bereits einem Deal zugeordnet. Neue Kontaktpersonen
                    zuerst unter «Kontakte» erfassen, dann hier verknüpfen.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Wird gespeichert …" : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
