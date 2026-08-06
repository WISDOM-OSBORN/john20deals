# John20 Deals - Handover Guide

This document captures decisions, unfinished work, and operational knowledge so the next developer (or the owner) can pick up where the last session left off.

## Current status

- Rebrand (John20 Deals) is committed and pushed (`c9c31b3`).
- Post-audit fixes are **implemented locally but NOT yet committed/pushed**. Commit them together as a single batch.
- Local clone: `C:\Users\Lenovo\Desktop\AFTER SCHOOL\john 20 deals\john20deals`
- Remote: `https://github.com/WISDOM-OSBORN/john20deals.git` (branch `main`)

## What was decided (do not re-open without the owner)

- **No payment integration.** Orders are created in-app; payment/collection is arranged manually over WhatsApp with the admin.
- **RLS Option A (fix now).** Row Level Security is enabled everywhere; all DB writes go through Netlify Functions with the service-role key. Anonymous users can only read `products` and `reviews`.
- **Directed admin notifications.** New swap/sell/repair/order submissions create persisted in-app notifications for admins (lookup by `profiles.role='admin'` + legacy emails) and open a manual WhatsApp deep-link. WhatsApp remains manual (no automated API).

## Environment / secrets

All in Netlify env vars and `.env.example`:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, used by Functions)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client, public reads only)
- `ALLOWED_ORIGINS` (comma-separated browser origins; `process.env.URL` + localhost always allowed)
- `VITE_ADMIN_WHATSAPP` (admin WhatsApp for cart deep-links; fallback `233505694171`)
- R2 envs: `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

Legacy admin emails: `rockwellsan7@gmail.com`, `johndarkwah20@gmail.com` (in `AuthContext.tsx` and `netlify/functions/shared/notify-admin.ts`).

## One-time setup steps (owner action required)

1. In the Supabase SQL Editor, run the whole `supabase/migration_final.sql` once. It is idempotent and safe to re-run. **This has not been run yet.**
2. In Clerk dashboard, set admin user `publicMetadata.role = "admin"` (or keep using a legacy admin email).

## Verification before push

```bash
npm run lint   # tsc --noEmit - must pass
npm run build  # vite build + server bundle - must pass
```

## Known gotchas

- **Windows PowerShell**: `rg` is unavailable; use the Grep/Glob tools.
- **Git push credential cache**: if `git push` fails with 403 (stale credential for `pennirent`), run:
  `cmdkey /delete:LegacyGeneric:target=git:https://github` and retry.
- **Dev server** (`server.ts`) delegates `/api/*` to the Netlify function handlers so behaviour matches production.

## Suggested commit message

```
feat: post-audit hardening batch

- directed admin notifications (persisted + WhatsApp deep-links)
- stock-checked order creation (submit-order)
- CORS allow-listing via ALLOWED_ORIGINS + env-based config
- RLS: service-role admin-ops/user-ops functions, client rewired off anon writes
- docs: README, documentation.md, HANDOVER.md, .env.example
- SEO (robots/sitemap), error boundary, CI, bug fixes
```
