-- Neue Deal-Pipeline:
-- Termin gesetzt (Lead) → No Show → Qualifiziert → Evaluierung → Verhandlung
-- → Closed Won (mit Datum + Freitext)
-- → Disqualifiziert / Closed Lost (mit frei erfassbaren Grund-Kategorien + Freitext)

-- ── Grund-Kategorien (manuell erfassbar) ─────────────────────────────────────

create table public.loss_reasons (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.loss_reasons to authenticated;

alter table public.loss_reasons enable row level security;

create policy "Eingeloggte dürfen loss_reasons verwalten"
  on public.loss_reasons for all to authenticated
  using (true) with check (true);

-- ── Stage-Enum ersetzen ──────────────────────────────────────────────────────

alter table public.deals drop constraint closed_reason_required;

create type public.deal_stage_new as enum (
  'termin_gesetzt',
  'no_show',
  'qualifiziert',
  'evaluierung',
  'verhandlung',
  'closed_won',
  'disqualifiziert',
  'closed_lost'
);

alter table public.deals alter column stage drop default;

alter table public.deals alter column stage type public.deal_stage_new using (
  case stage::text
    when 'qualification' then 'termin_gesetzt'
    when 'demo' then 'qualifiziert'
    when 'evaluation' then 'evaluierung'
    when 'negotiation' then 'verhandlung'
    when 'verbal_commit' then 'verhandlung'
    else stage::text
  end
)::public.deal_stage_new;

alter table public.deals alter column stage set default 'termin_gesetzt';

drop type public.deal_stage;
alter type public.deal_stage_new rename to deal_stage;

-- ── Neue Spalten ─────────────────────────────────────────────────────────────

alter table public.deals
  add column closed_won_at timestamptz,
  add column loss_reason_id uuid references public.loss_reasons (id) on delete set null;

-- Bestehende Closed-Won-Deals: Datum nachtragen
update public.deals
  set closed_won_at = updated_at
  where stage = 'closed_won' and closed_won_at is null;

-- Bestehende Closed-Lost-Deals ohne Grund: Auffang-Kategorie zuweisen
insert into public.loss_reasons (label)
  select 'Nicht kategorisiert'
  where exists (
    select 1 from public.deals
    where stage in ('disqualifiziert', 'closed_lost') and loss_reason_id is null
  )
  on conflict (label) do nothing;

update public.deals
  set loss_reason_id = (select id from public.loss_reasons where label = 'Nicht kategorisiert')
  where stage in ('disqualifiziert', 'closed_lost') and loss_reason_id is null;

-- ── Pflicht-Checks ───────────────────────────────────────────────────────────

alter table public.deals add constraint closed_won_requires_reason check (
  stage <> 'closed_won' or (closed_reason is not null and closed_won_at is not null)
);

alter table public.deals add constraint lost_requires_reason check (
  stage not in ('disqualifiziert', 'closed_lost') or loss_reason_id is not null
);
