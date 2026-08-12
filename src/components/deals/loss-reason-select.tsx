"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type LossReason } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LossReasonSelectProps {
  reasons: LossReason[];
  value: string | null;
  onChange: (id: string) => void;
  onReasonCreated: (reason: LossReason) => void;
}

/** Grund-Dropdown mit der Möglichkeit, direkt neue Kategorien zu erfassen. */
export function LossReasonSelect({
  reasons,
  value,
  onChange,
  onReasonCreated,
}: LossReasonSelectProps) {
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const items = Object.fromEntries(reasons.map((r) => [r.id, r.label]));

  async function createReason() {
    const label = newLabel.trim();
    if (!label) return;

    const existing = reasons.find(
      (r) => r.label.toLowerCase() === label.toLowerCase()
    );
    if (existing) {
      onChange(existing.id);
      setCreating(false);
      setNewLabel("");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("loss_reasons")
      .insert({ label })
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error("Grund konnte nicht erfasst werden.");
      return;
    }

    onReasonCreated(data);
    onChange(data.id);
    setCreating(false);
    setNewLabel("");
  }

  return (
    <div className="space-y-2">
      {reasons.length > 0 ? (
        <Select
          items={items}
          value={value}
          onValueChange={(v) => onChange(v as string)}
        >
          <SelectTrigger aria-label="Grund" className="w-full">
            <SelectValue placeholder="Grund auswählen …" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-sm text-muted-foreground">
          Noch keine Gründe erfasst — leg unten die erste Kategorie an.
        </p>
      )}

      {creating ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder="z. B. Kein Budget"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createReason();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={saving || !newLabel.trim()}
            onClick={createReason}
          >
            <Check /> Anlegen
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setCreating(true)}
        >
          <Plus /> Neuen Grund erfassen
        </Button>
      )}
    </div>
  );
}
