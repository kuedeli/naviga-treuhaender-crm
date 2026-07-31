"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  won: boolean;
  companyName: string;
  onConfirm: (reason: string) => void;
}

export function ReasonDialog({
  open,
  onOpenChange,
  won,
  companyName,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {won ? "Deal gewonnen 🎉" : "Deal verloren"}
          </DialogTitle>
          <DialogDescription>
            {companyName} wird als «{won ? "Closed Won" : "Closed Lost"}»
            abgeschlossen. Eine kurze Begründung ist Pflicht.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm(reason.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="close_reason">Begründung</Label>
            <Textarea
              id="close_reason"
              required
              autoFocus
              placeholder={
                won
                  ? "z. B. Partnerschaft vereinbart, Start per 1.9."
                  : "z. B. bestehender Broker, kein Interesse an Kooperation"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
            <Button type="submit" disabled={!reason.trim()}>
              Abschliessen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
