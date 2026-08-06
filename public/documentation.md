# John20 Deals - Product & Maintenance Documentation

## 1. Overview
**John20 Deals** is a full-stack e-commerce platform for used/refurbished gadgets in Ghana. This documentation helps developers and maintainers locate files, understand the architecture, and troubleshoot issues.

---

## 2. Visual Directory Structure

```text
john20-deals/
├── 📁 netlify/
│   ├── 📁 functions/              <-- SERVERLESS APIs (all DB writes happen here)
│   │   ├── admin-ops.ts           <-- Admin dashboard data + admin mutations
│   │   ├── user-ops.ts            <-- User-scoped reads/actions (profile, orders, reviews, newsletter)
│   │   ├── submit-order.ts        <-- Stock-checked order creation
│   │   ├── submit-swap.ts         <-- Swap request submission
│   │   ├── submit-sell.ts         <-- Sell request submission
│   │   ├── submit-repair.ts       <-- Repair request submission
│   │   ├── upload-url.ts          <-- Cloudflare R2 presigned upload URLs
│   │   └── 📁 shared/             <-- Shared helpers
│   │       ├── cors.ts            <-- Origin allow-listing
│   │       ├── rate-limit.ts      <-- In-memory rate limiting
│   │       └── notify-admin.ts    <-- Admin lookup + in-app notifications
│   │
├── 📁 src/                        <-- FRONTEND (React application)
│   ├── 📁 components/             <-- Reusable UI
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductReviews.tsx     <-- Reviews UI (writes via user-ops)
│   │   ├── NotificationBell.tsx   <-- In-app notifications bell
│   │   ├── ErrorBoundary.tsx      <-- Catches render errors
│   │   └── ...
│   ├── 📁 context/                <-- Global state
│   │   ├── AuthContext.tsx        <-- Clerk auth + admin role + profile sync
│   │   ├── CartContext.tsx        <-- Cart state (localStorage key: john20_cart)
│   │   └── WishlistContext.tsx    <-- Wishlist state (key: john20_wishlist)
│   ├── 📁 lib/                    <-- Utilities
│   │   ├── api.ts                 <-- Client helpers for admin-ops / user-ops
│   │   ├── supabase.ts            <-- Supabase client (public reads only)
│   │   ├── notifications.ts       <-- Notification helpers (via API)
│   │   └── upload.ts              <-- Image upload helper
│   ├── 📁 pages/                  <-- Screens
│   │   ├── AdminDashboard.tsx     <-- Admin panel (products, orders, swap/sell/repair, analytics)
│   │   ├── Home.tsx / Shop.tsx / ProductDetails.tsx
│   │   ├── Cart.tsx / Profile.tsx / Sell.tsx / Repair.tsx
│   │   └── ...
│   └── 📁 types/                  <-- TypeScript definitions
│       └── supabase.ts            <-- Database schema definitions
│
├── 📁 supabase/
│   └── migration_final.sql        <-- Idempotent DB migration + RLS (run in Supabase SQL Editor)
├── 📁 .github/workflows/ci.yml    <-- CI: npm ci + lint + build
├── 📄 netlify.toml                <-- Build config + API redirects
└── 📄 server.ts                   <-- Local dev server (delegates API to Netlify handlers)
```

---

## 3. Feature Maintenance Guide

| Feature / Logic | File Location | Description |
| :--- | :--- | :--- |
| **Order checkout (stock-checked)** | `/netlify/functions/submit-order.ts`, `/src/pages/Cart.tsx` | Validates items against stock, decrements stock, inserts order, notifies admins. |
| **Swap request submission** | `/netlify/functions/submit-swap.ts`, `/src/pages/ProductDetails.tsx` | Stores swap request + admin notification. |
| **Sell request submission** | `/netlify/functions/submit-sell.ts`, `/src/pages/Sell.tsx` | Stores sell request (incl. expected price) + admin notification. |
| **Repair request submission** | `/netlify/functions/submit-repair.ts`, `/src/pages/Repair.tsx` | Stores repair request + admin notification. |
| **Admin dashboard data + actions** | `/netlify/functions/admin-ops.ts`, `/src/pages/AdminDashboard.tsx` | All admin reads/writes (products, orders, swap/sell/repair lifecycle, subscribers). |
| **User data / profile / reviews / newsletter** | `/netlify/functions/user-ops.ts` | User orders/requests, notification fetch/mark-read, profile sync, reviews, newsletter subscribe. |
| **Admin in-app notifications** | `/netlify/functions/shared/notify-admin.ts`, `/netlify/functions/submit-*.ts` | Notifies admins (profiles with role=admin + legacy emails) on new requests. |
| **Image upload (presigned URL)** | `/netlify/functions/upload-url.ts`, `/src/lib/upload.ts` | Generates Cloudflare R2 presigned URLs for secure direct uploads. |
| **CORS allow-listing** | `/netlify/functions/shared/cors.ts` | Uses `ALLOWED_ORIGINS` env (comma-separated) + `process.env.URL` + localhost. |
| **API routing / redirects** | `/netlify.toml` | Maps `/api/*` to `/.netlify/functions/*`. |
| **Database schema / RLS** | `/supabase/migration_final.sql` | Run once in Supabase SQL Editor. Idempotent. |
| **Database types** | `/src/types/supabase.ts` | Update if you add columns/tables. |
| **CI pipeline** | `.github/workflows/ci.yml` | npm ci, lint, build on every push/PR. |

---

## 4. Repair v2 Lifecycle

`repair_requests.status` states (driven by the admin dropdown in AdminDashboard):

`received` → `diagnosed` → `in_progress` → `ready_for_pickup` → `picked_up`

Plus terminal states: `declined` (admin, with `decline_reason`) and `cancelled_by_user` (user cancels from Profile).

Admin can set a diagnosis + cost + estimated completion via the "Diagnose" modal (status becomes `diagnosed`). Reaching `ready_for_pickup` sends a WhatsApp deep-link; `picked_up` sets `completed_at`.

---

## 5. Security Model (RLS)

- RLS is **enabled on every table** (`migration_final.sql`).
- Anonymous (`anon`) access: **public read only** on `products` and `reviews` via `products_public_read` / `reviews_public_read` policies.
- Every other table grants **nothing** to anon.
- All writes/reads of non-public data happen in **Netlify Functions** using `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the client. It lives in Netlify env vars only.

---

## 6. Troubleshooting

### Issue: Users cannot upload images
1. Check `/netlify/functions/upload-url.ts` (allowed types + size cap).
2. Verify R2 env vars (`CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) in Netlify.
3. Confirm the R2 bucket allows public read.

### Issue: API calls fail with CORS errors
1. Check `ALLOWED_ORIGINS` in Netlify env vars — add your site origin (e.g. `https://john20deals.netlify.app`) or your custom domain.
2. `process.env.URL` (Netlify's own site URL) and localhost are always allowed.

### Issue: "Propose Swap" / Sell / Repair submit fails
1. Check the relevant `/netlify/functions/submit-*.ts` function logs in Netlify.
2. Confirm `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set in Netlify env vars.
3. Confirm `netlify.toml` redirect exists for the endpoint.

### Issue: Admin dashboard shows no data after RLS was enabled
1. This is expected if `admin-ops` function env vars aren't set — confirm `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
2. Re-run `supabase/migration_final.sql` in the Supabase SQL Editor.

### Issue: Cart or wishlist cleared / keys changed
- Storage keys migrated from `pennitech_cart`/`pennitech_wishlist` to `john20_cart`/`john20_wishlist`. Old keys are read once, copied, and removed automatically in `CartContext.tsx` / `WishlistContext.tsx`.

---

## 7. Database Schema Quick Reference

- **`profiles`**: User metadata (linked to Clerk user id). Written via `user-ops syncProfile`.
- **`products`**: Catalog inventory (admin managed via `admin-ops`). Public read.
- **`orders`**: Purchases with product snapshot + stock changes (created via `submit-order`).
- **`swap_requests`**: Trade-in proposals (`trade_in_value`, `cash_difference`, `terms`, `notified_at`).
- **`sell_requests`**: Sell offers incl. `offer_price` (was `expected_price` at submission).
- **`repair_requests`**: Repair lifecycle incl. `diagnosis`, `repair_cost`, `estimated_completion`, `completed_at`, `decline_reason`, `cancelled_at`, `admin_notes`.
- **`reviews`**: Product feedback. Public read; written via `user-ops addReview`.
- **`newsletter_subscribers`**: Emails. Written via `user-ops subscribeNewsletter`.
- **`notifications`**: Per-user in-app notifications. Written by `notify-admin` / `admin-ops`; read via `user-ops`.
