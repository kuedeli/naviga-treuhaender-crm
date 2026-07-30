"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type Contact,
  type ContactStatus,
  CONTACT_STATUS_LABELS,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactDialog } from "@/components/contacts/contact-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<ContactStatus, string> = {
  neu: "border-[#316c9c]/40 bg-[#316c9c]/10 text-[#316c9c]",
  an_richard_uebergeben: "border-[#19345a]/40 bg-[#19345a]/10 text-[#19345a]",
  in_deal_umgewandelt: "border-[#d1a87c]/60 bg-[#d1a87c]/20 text-[#8a6539]",
  kein_interesse: "border-border bg-muted text-muted-foreground",
};

export default function KontaktePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadContacts = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Kontakte konnten nicht geladen werden.");
    } else {
      setContacts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? contacts.filter((c) =>
        [
          c.first_name,
          c.last_name,
          c.email ?? "",
          c.phone ?? "",
          CONTACT_STATUS_LABELS[c.status],
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : contacts;

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);

    if (error) {
      toast.error("Löschen fehlgeschlagen. Bitte nochmals versuchen.");
      return;
    }

    toast.success("Kontakt gelöscht.");
    setDeleteTarget(null);
    loadContacts();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Kontakte</h1>
          <p className="text-sm text-muted-foreground">
            {contacts.length}{" "}
            {contacts.length === 1 ? "Kontakt" : "Kontakte"} aus der Kampagne
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingContact(null);
            setDialogOpen(true);
          }}
        >
          <Plus /> Neuer Kontakt
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen …"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Tel-Nummer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erfasst am</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Wird geladen …
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  {contacts.length === 0
                    ? "Noch keine Kontakte erfasst. Leg mit «Neuer Kontakt» los."
                    : "Keine Treffer für diese Suche."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {contact.first_name} {contact.last_name}
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:underline"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{contact.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(STATUS_BADGE_CLASSES[contact.status])}
                    >
                      {CONTACT_STATUS_LABELS[contact.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(contact.created_at).toLocaleDateString("de-CH")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" />
                        }
                      >
                        <MoreHorizontal />
                        <span className="sr-only">Aktionen</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingContact(contact);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil /> Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(contact)}
                        >
                          <Trash2 /> Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={editingContact}
        onSaved={loadContacts}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Kontakt löschen?"
        description={
          deleteTarget
            ? `${deleteTarget.first_name} ${deleteTarget.last_name} wird endgültig gelöscht.`
            : ""
        }
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
