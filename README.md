# Naviga Treuhänder-CRM

Internes CRM für die Treuhänder-Sales-Kampagne: Kontakte erfassen, an Richard übergeben, Deals durch die Pipeline führen.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS)
- Hosting: [Vercel](https://vercel.com)

## Lokal entwickeln

```bash
npm install
npm run dev
```

Dann [http://localhost:3000](http://localhost:3000) öffnen. Es braucht eine `.env.local` (siehe `.env.example`) mit den Supabase-Zugangsdaten.

## Datenbank

Das Schema liegt in `supabase/migrations/`. Zugriff auf die Tabellen haben nur eingeloggte Benutzer (Row Level Security); Benutzerkonten werden manuell im Supabase-Dashboard angelegt (Authentication → Users).

## Struktur

- `src/app/login` – Login-Seite
- `src/app/(app)` – geschützter Bereich (Kontakte, Deals)
- `src/lib/supabase` – Supabase-Clients (Browser & Server)
- `src/proxy.ts` – Auth-Schutz für alle Seiten
