"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type Contact,
  type Deal,
  type DealStage,
  DEAL_STAGE_LABELS,
} from "@/lib/types";
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

export function isClosedStage(stage: DealStage) {
  return stage === "closed_won" || stage === "closed_lost";
}

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = neuen Deal erfassen, sonst bearbeiten */
  deal: Deal | null;
  contacts: Contact[];
  onSaved: () => void;
}

export function DealDialog({
  open,
  onOpenChange,
  deal,
  contacts,
  onSaved,
}: DealDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [stage, setStage] = useState<DealStage>("qualification");
  const [closedReason, setClosedReason] = useState("");
  const [notes, setNotes] = useState("");
  const [addContactId, setAddContactId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCompanyName(deal?.company_name ?? "");
      setCompanySize(deal?.company_size ?? "");
      setStage(deal?.stage ?? "qualification");
      setClosedReason(deal?.closed_reason ?? "");
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
    setSaving(true);

    const supabase = createClient();
    const values = {
      company_name: companyName.trim(),
      company_size: companySize.trim() || null,
      stage,
      closed_reason: isClosedStage(stage) ? closedReason.trim() || null : null,
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
              <Label htmlFor="company_size">Grösse</Label>
              <Input
                id="company_size"
                placeholder="z. B. 15 Mitarbeitende"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              />
            </div>
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

          {isClosedStage(stage) && (
            <div className="space-y-2">
              <Label htmlFor="closed_reason">
                Begründung ({stage === "closed_won" ? "gewonnen" : "verloren"})
              </Label>
              <Textarea
                id="closed_reason"
                required
                placeholder="Warum wurde der Deal so abgeschlossen?"
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
              />
            </div>
          )}

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
