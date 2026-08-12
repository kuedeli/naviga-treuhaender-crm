-- Verifikationsstatus für E-Mail und Telefonnummer eines Kontakts:
-- Sind die Angaben aus der Kampagne korrekt?

create type public.field_check_status as enum (
  'korrekt',
  'unsicher',
  'falsch'
);

alter table public.contacts
  add column email_status public.field_check_status not null default 'unsicher',
  add column phone_status public.field_check_status not null default 'unsicher';
