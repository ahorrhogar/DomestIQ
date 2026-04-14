# Next.js Integration Notes

This project is currently a Vite SPA, but the data and domain layers are organized to ease migration to Next.js:

- Keep client rendering in route/page components.
- Move service implementations into server-side modules under app/api and server actions.
- Keep domain logic pure and shared between client and server.
- Keep `src/data/sources/mockCatalogSource.ts` as the stable import point; it now proxies Supabase source implementation.
- Use src/server/contracts/catalogApi.ts as the API response contract baseline.

Implemented baseline:
- Supabase source: `src/data/sources/supabaseCatalogSource.ts`
- Server-side redirect endpoint: `src/server/nextjs/app/api/redirect/route.ts`

Suggested migration targets:
- app/(shop)/page.tsx for home
- app/categoria/[slug]/[[...subSlug]]/page.tsx for category pages
- app/producto/[slug]/page.tsx for product detail
- app/asistente/page.tsx for assistant
- app/api/catalog/* for read endpoints
- app/actions/catalogActions.ts for server actions
