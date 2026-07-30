-- Naviga Treuhänder-CRM: Initiales Schema
-- Kontakte (aus der E-Mail-Kampagne) und Deals (sobald Richard im Gespräch ist).

-- ── Enums ────────────────────────────────────────────────────────────────────

create type public.contact_status as enum (
  'neu',
  'an_richard_uebergeben',
  'in_deal_umgewandelt',
  'kein_interesse'
);

create type public.deal_stage as enum (
  'qualification',
  'demo',
  'evaluation',
  'negotiation',
  'verbal_commit',
  'closed_won',
  'closed_lost'
);

-- ── Tabellen ─────────────────────────────────────────────────────────────────

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_size text,
  stage public.deal_stage not null default 'qualification',
  closed_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Bei Closed Won / Closed Lost ist eine Begründung Pflicht.
  constraint closed_reason_required check (
    stage not in ('closed_won', 'closed_lost') or closed_reason is not null
  )
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  status public.contact_status not null default 'neu',
  deal_id uuid references public.deals (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_deal_id_idx on public.contacts (deal_id);

-- ── updated_at automatisch pflegen ───────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- ── Zugriff: nur eingeloggte Benutzer ────────────────────────────────────────
-- "Automatically expose new tables" ist im Projekt deaktiviert,
-- darum braucht es explizite Grants. Anonyme Besucher (anon) erhalten nichts.

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.deals to authenticated;

alter table public.contacts enable row level security;
alter table public.deals enable row level security;

create policy "Eingeloggte dürfen contacts lesen"
  on public.contacts for select to authenticated using (true);
create policy "Eingeloggte dürfen contacts schreiben"
  on public.contacts for insert to authenticated with check (true);
create policy "Eingeloggte dürfen contacts ändern"
  on public.contacts for update to authenticated using (true) with check (true);
create policy "Eingeloggte dürfen contacts löschen"
  on public.contacts for delete to authenticated using (true);

create policy "Eingeloggte dürfen deals lesen"
  on public.deals for select to authenticated using (true);
create policy "Eingeloggte dürfen deals schreiben"
  on public.deals for insert to authenticated with check (true);
create policy "Eingeloggte dürfen deals ändern"
  on public.deals for update to authenticated using (true) with check (true);
create policy "Eingeloggte dürfen deals löschen"
  on public.deals for delete to authenticated using (true);
