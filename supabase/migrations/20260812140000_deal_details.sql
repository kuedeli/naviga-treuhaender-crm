-- Deal-Detailfelder:
-- Domain, Anzahl KMU Kunden (geschätzt/bestätigt), Bestehender Broker,
-- Nächster Schritt, Nächster Termin

create type public.kmu_count_status as enum ('geschaetzt', 'bestaetigt');

create type public.broker_status as enum (
  'unbekannt',
  'zufrieden',
  'unzufrieden',
  'keiner'
);

alter table public.deals rename column company_size to kmu_count;

alter table public.deals
  add column kmu_count_status public.kmu_count_status not null default 'geschaetzt',
  add column domain text,
  add column existing_broker public.broker_status not null default 'unbekannt',
  add column next_step text,
  add column next_meeting date;
