"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  type Contact,
  type ContactStatus,
  type FieldCheckStatus,
  CONTACT_STATUS_LABELS,
  FIELD_CHECK_LABELS,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = neuen Kontakt erfassen, sonst bearbeiten */
  contact: Contact | null;
  onSaved: () => void;
}

export function ContactDialog({
  open,
  onOpenChange,
  contact,
  onSaved,
}: ContactDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailStatus, setEmailStatus] = useState<FieldCheckStatus>("unsicher");
  const [phoneStatus, setPhoneStatus] = useState<FieldCheckStatus>("unsicher");
  const [status, setStatus] = useState<ContactStatus>("neu");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFirstName(contact?.first_name ?? "");
      setLastName(contact?.last_name ?? "");
      setEmail(contact?.email ?? "");
      setPhone(contact?.phone ?? "");
      setEmailStatus(contact?.email_status ?? "unsicher");
      setPhoneStatus(contact?.phone_status ?? "unsicher");
      setStatus(contact?.status ?? "neu");
    }
  }, [open, contact]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const values = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      email_status: emailStatus,
      phone_status: phoneStatus,
      status,
    };

    const { error } = contact
      ? await supabase.from("contacts").update(values).eq("id", contact.id)
      : await supabase.from("contacts").insert(values);

    setSaving(false);

    if (error) {
      toast.error("Speichern fehlgeschlagen. Bitte nochmals versuchen.");
      return;
    }

    toast.success(contact ? "Kontakt aktualisiert." : "Kontakt erfasst.");
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {contact ? "Kontakt bearbeiten" : "Neuer Kontakt"}
          </DialogTitle>
          <DialogDescription>
            {contact
              ? "Angaben anpassen und speichern."
              : "Kontakt aus der E-Mail-Kampagne erfassen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">Vorname</Label>
              <Input
                id="first_name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nachname</Label>
              <Input
                id="last_name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-Mail</Label>
            <div className="flex gap-2">
              <Input
                id="contact_email"
                type="email"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select
                items={FIELD_CHECK_LABELS}
                value={emailStatus}
                onValueChange={(value) =>
                  setEmailStatus(value as FieldCheckStatus)
                }
              >
                <SelectTrigger
                  aria-label="E-Mail-Status"
                  className="w-30 shrink-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_CHECK_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Tel-Nummer</Label>
            <div className="flex gap-2">
              <Input
                id="contact_phone"
                type="tel"
                className="flex-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Select
                items={FIELD_CHECK_LABELS}
                value={phoneStatus}
                onValueChange={(value) =>
                  setPhoneStatus(value as FieldCheckStatus)
                }
              >
                <SelectTrigger
                  aria-label="Telefon-Status"
                  className="w-30 shrink-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_CHECK_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              items={CONTACT_STATUS_LABELS}
              value={status}
              onValueChange={(value) => setStatus(value as ContactStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {saving ? "Wird gespeichert …" : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
