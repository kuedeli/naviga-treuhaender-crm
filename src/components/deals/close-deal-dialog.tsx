"use client";

import { useEffect, useState } from "react";
import {
  type DealStage,
  type LossReason,
  DEAL_STAGE_LABELS,
  isWonStage,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LossReasonSelect } from "@/components/deals/loss-reason-select";

export interface ClosePayload {
  closedReason: string | null;
  lossReasonId: string | null;
}

interface CloseDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: DealStage | null;
  companyName: string;
  reasons: LossReason[];
  onReasonCreated: (reason: LossReason) => void;
  onConfirm: (payload: ClosePayload) => void;
}

/** Dialog beim Verschieben in eine Endstation:
 *  Closed Won → Freitext (Pflicht); Disqualifiziert/Closed Lost → Grund (Pflicht) + Freitext. */
export function CloseDealDialog({
  open,
  onOpenChange,
  stage,
  companyName,
  reasons,
  onReasonCreated,
  onConfirm,
}: CloseDealDialogProps) {
  const [text, setText] = useState("");
  const [lossReasonId, setLossReasonId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setLossReasonId(null);
    }
  }, [open]);

  if (!stage) return null;

  const won = isWonStage(stage);
  const canSubmit = won ? text.trim().length > 0 : lossReasonId !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {won
              ? "Deal gewonnen 🎉"
              : stage === "disqualifiziert"
                ? "Deal disqualifizieren"
                : "Deal verloren"}
          </DialogTitle>
          <DialogDescription>
            {companyName} wird nach «{DEAL_STAGE_LABELS[stage]}» verschoben
            {won ? " — das Datum wird automatisch festgehalten." : "."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onConfirm({
              closedReason: text.trim() || null,
              lossReasonId,
            });
          }}
          className="space-y-4"
        >
          {!won && (
            <div className="space-y-2">
              <Label>Grund</Label>
              <LossReasonSelect
                reasons={reasons}
                value={lossReasonId}
                onChange={setLossReasonId}
                onReasonCreated={onReasonCreated}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="close_text">
              {won ? "Begründung" : "Erklärung (optional)"}
            </Label>
            <Textarea
              id="close_text"
              required={won}
              autoFocus={won}
              placeholder={
                won
                  ? "z. B. Partnerschaft vereinbart, Start per 1.9."
                  : "Details zum Grund …"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
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
            <Button type="submit" disabled={!canSubmit}>
              Abschliessen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
