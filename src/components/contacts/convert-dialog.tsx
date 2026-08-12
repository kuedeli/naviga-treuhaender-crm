"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { type Contact } from "@/lib/types";
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

interface ConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onConverted: () => void;
}

export function ConvertDialog({
  open,
  onOpenChange,
  contact,
  onConverted,
}: ConvertDialogProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [kmuCount, setKmuCount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCompanyName("");
      setDomain("");
      setKmuCount("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact) return;
    setSaving(true);

    const supabase = createClient();
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .insert({
        company_name: companyName.trim(),
        domain: domain.trim() || null,
        kmu_count: kmuCount.trim() || null,
      })
      .select()
      .single();

    if (dealError || !deal) {
      setSaving(false);
      toast.error("Deal konnte nicht erstellt werden.");
      return;
    }

    const { error: contactError } = await supabase
      .from("contacts")
      .update({ deal_id: deal.id, status: "in_deal_umgewandelt" })
      .eq("id", contact.id);

    setSaving(false);

    if (contactError) {
      toast.error("Kontakt konnte nicht verknüpft werden.");
      return;
    }

    toast.success(`Deal «${deal.company_name}» erstellt.`, {
      action: {
        label: "Zum Board",
        onClick: () => router.push("/deals"),
      },
    });
    onOpenChange(false);
    onConverted();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>In Deal umwandeln</DialogTitle>
          <DialogDescription>
            {contact
              ? `Erstellt einen Deal in der Stage «Termin gesetzt (Lead)» und verknüpft ${contact.first_name} ${contact.last_name} als Kontaktperson.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="convert_company">Firmenname</Label>
            <Input
              id="convert_company"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="convert_domain">Domain</Label>
            <Input
              id="convert_domain"
              placeholder="z. B. mustertreuhand.ch"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="convert_kmu">Anzahl KMU Kunden (geschätzt)</Label>
            <Input
              id="convert_kmu"
              placeholder="z. B. 25"
              value={kmuCount}
              onChange={(e) => setKmuCount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Wird erstellt …" : "Deal erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
