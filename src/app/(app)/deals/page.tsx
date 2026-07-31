"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type Contact,
  type Deal,
  type DealStage,
  DEAL_STAGE_LABELS,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DealDialog, isClosedStage } from "@/components/deals/deal-dialog";
import { ReasonDialog } from "@/components/deals/reason-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { cn } from "@/lib/utils";

const STAGES: DealStage[] = [
  "qualification",
  "demo",
  "evaluation",
  "negotiation",
  "verbal_commit",
  "closed_won",
  "closed_lost",
];

const STAGE_DOT_CLASSES: Record<DealStage, string> = {
  qualification: "bg-[#316c9c]",
  demo: "bg-[#19345a]",
  evaluation: "bg-[#d1a87c]",
  negotiation: "bg-[#8a6539]",
  verbal_commit: "bg-[#151926]",
  closed_won: "bg-emerald-600",
  closed_lost: "bg-red-700",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    deal: Deal;
    stage: DealStage;
  } | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [dealsRes, contactsRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("last_name"),
    ]);

    if (dealsRes.error || contactsRes.error) {
      toast.error("Deals konnten nicht geladen werden.");
    } else {
      setDeals(dealsRes.data ?? []);
      setContacts(contactsRes.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function moveDeal(deal: Deal, stage: DealStage, reason: string | null) {
    const values = {
      stage,
      closed_reason: isClosedStage(stage) ? reason : null,
    };

    setDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, ...values } : d))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("deals")
      .update(values)
      .eq("id", deal.id);

    if (error) {
      toast.error("Verschieben fehlgeschlagen.");
      loadData();
      return;
    }

    toast.success(
      `${deal.company_name} → ${DEAL_STAGE_LABELS[stage]}`
    );
  }

  function handleDrop(stage: DealStage, e: React.DragEvent) {
    e.preventDefault();
    setDragOverStage(null);

    const dealId = e.dataTransfer.getData("text/plain");
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;

    if (isClosedStage(stage)) {
      setPendingMove({ deal, stage });
    } else {
      moveDeal(deal, stage, null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    const supabase = createClient();
    // Verknüpfte Kontakte zurück auf «An Richard übergeben» setzen
    await supabase
      .from("contacts")
      .update({ deal_id: null, status: "an_richard_uebergeben" })
      .eq("deal_id", deleteTarget.id);
    const { error } = await supabase
      .from("deals")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);

    if (error) {
      toast.error("Löschen fehlgeschlagen.");
      return;
    }

    toast.success("Deal gelöscht.");
    setDeleteTarget(null);
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Deals</h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} {deals.length === 1 ? "Deal" : "Deals"} in der
            Pipeline — Karten per Drag & Drop verschieben
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDeal(null);
            setDialogOpen(true);
          }}
        >
          <Plus /> Neuer Deal
        </Button>
      </div>

      {loading ? (
        <p className="py-10 text-muted-foreground">Wird geladen …</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stage);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(stage, e)}
                className={cn(
                  "flex w-64 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors",
                  dragOverStage === stage && "border-ring bg-secondary"
                )}
              >
                <div className="flex items-center gap-2 px-3 pt-3 pb-2.5">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      STAGE_DOT_CLASSES[stage]
                    )}
                  />
                  <span className="truncate text-[11px] font-semibold tracking-[0.12em] uppercase text-foreground/70">
                    {DEAL_STAGE_LABELS[stage]}
                  </span>
                  <span className="ml-auto rounded-full border bg-card px-2 py-px text-xs tabular-nums text-muted-foreground">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
                  {stageDeals.map((deal) => {
                    const dealContacts = contacts.filter(
                      (c) => c.deal_id === deal.id
                    );
                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", deal.id)
                        }
                        onDoubleClick={() => {
                          setEditingDeal(deal);
                          setDialogOpen(true);
                        }}
                        className="group cursor-grab rounded-lg border bg-card p-3.5 shadow-xs transition-shadow select-none hover:shadow-md active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm leading-snug font-semibold break-words">
                              {deal.company_name}
                            </p>
                            {deal.company_size && (
                              <p className="text-xs text-muted-foreground">
                                {deal.company_size}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="-mt-1.5 -mr-1.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 data-popup-open:opacity-100"
                                />
                              }
                            >
                              <MoreHorizontal />
                              <span className="sr-only">Aktionen</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingDeal(deal);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil /> Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(deal)}
                              >
                                <Trash2 /> Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {dealContacts.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {dealContacts.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary py-0.5 pr-2.5 pl-1.5 text-[11px] font-medium text-secondary-foreground"
                              >
                                <UserRound className="size-3 shrink-0 opacity-60" />
                                <span className="truncate">
                                  {c.first_name} {c.last_name}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}

                        {isClosedStage(deal.stage) && deal.closed_reason && (
                          <p
                            className={cn(
                              "mt-3 line-clamp-3 rounded-md px-2.5 py-1.5 text-xs leading-relaxed break-words",
                              deal.stage === "closed_won"
                                ? "bg-emerald-600/10 text-emerald-900"
                                : "bg-red-700/10 text-red-900"
                            )}
                          >
                            {deal.closed_reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editingDeal}
        contacts={contacts}
        onSaved={loadData}
      />

      <ReasonDialog
        open={pendingMove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
        won={pendingMove?.stage === "closed_won"}
        companyName={pendingMove?.deal.company_name ?? ""}
        onConfirm={(reason) => {
          if (pendingMove) {
            moveDeal(pendingMove.deal, pendingMove.stage, reason);
            setPendingMove(null);
          }
        }}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Deal löschen?"
        description={
          deleteTarget
            ? `${deleteTarget.company_name} wird endgültig gelöscht. Verknüpfte Kontakte bleiben erhalten und werden zurück auf «An Richard übergeben» gesetzt.`
            : ""
        }
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
