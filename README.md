# DomestIQ Frontend (Refactored Base)

DomestIQ is currently a Vite + React frontend, now structured as a production-ready base for a real backend migration.

## Current Goals

- Keep current UX and visual design unchanged
- Remove business logic from UI components
- Centralize data access behind service abstractions
- Prepare project structure for Next.js + Supabase integration

## Commands

- `npm run dev`: run local development server
- `npm run build`: build production bundle
- `npm run lint`: run ESLint
- `npm run test`: run Vitest tests

## Vercel Deploy

This project is ready for static deploy on Vercel as a Vite SPA.

Required project settings in Vercel:

- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

SPA routing fallback is configured in `vercel.json` so routes like `/buscar`, `/categoria/...`, and `/producto/...` resolve to the app entrypoint.

Set these Environment Variables in Vercel (Production and Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_USE_REDIRECT_API` (optional, default `false`)

## Architecture Overview

- `src/domain`: pure business/domain types and logic
- `src/data/sources`: data source adapters (Supabase-backed catalog source)
- `src/services`: application services consumed by pages/components
- `src/infrastructure`: cross-cutting concerns (analytics schema, sanitize, logging, rate-limit, safe redirect)
- `src/server/contracts`: backend API contracts for future Next.js API routes
- `src/server/nextjs`: migration notes and server-action/API layout guidance

## Service Layer

The UI should depend on services, not direct mock files:

- `productService`
- `categoryService`
- `offerService`
- `analyticsService`

Supabase is connected behind `src/data/sources/mockCatalogSource.ts`, which now re-exports the Supabase implementation to preserve service contracts.

## Supabase Setup

1. Copy `.env.example` into `.env.local` and set:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
2. Apply database schema:
	- `supabase/migrations/20260414_0001_catalog_schema.sql`
3. Seed initial catalog data:
	- `supabase/seed.sql`

If you use Supabase CLI:

- `supabase db push`
- `supabase db reset --linked`

## Next.js Migration Notes

See `src/server/nextjs/integration-notes.md` for the target mapping toward:

- `app` routes
- `app/api` endpoints
- server actions

## Notes

- `src/data/mock-data.ts` remains for historical reference only and is no longer the active data source.
- UI components/pages were migrated to service consumption to reduce coupling.
- Offer clicks are tracked via Supabase `clicks` table. For Next.js deployments, enable `VITE_USE_REDIRECT_API=true` and use `src/server/nextjs/app/api/redirect/route.ts`.
