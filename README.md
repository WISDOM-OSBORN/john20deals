# John20 Deals - E-Commerce Platform

Modern full-stack e-commerce store for used/refurbished gadgets in Ghana. React + Vite + TypeScript frontend, Supabase (PostgreSQL) database with Row Level Security, Clerk authentication, Netlify Functions, and Cloudflare R2 image uploads.

## Features

- **Storefront**: Browse/search products, product details, reviews & ratings, wishlist, cart with stock-checked checkout.
- **Auth**: Clerk (email/Google). Admins identified by Clerk `publicMetadata.role === 'admin` or legacy admin emails.
- **Admin Dashboard**: Products CRUD, orders, customers, analytics, swap/sell/repair request management, newsletter subscribers.
- **Swap / Sell / Repair**: Users submit requests with photos; admins accept/decline/diagnose and notify via WhatsApp deep-links.
- **Admin notifications**: New swap/sell/repair/order submissions create persisted in-app notifications for admins and route a manual WhatsApp deep-link.
- **RLS-hardened**: Anonymous visitors can only read the public catalog; all writes go through Netlify Functions using the Supabase service-role key.
- **SEO**: `robots.txt`, `sitemap.xml`, per-page meta, error boundary.
- **CI**: GitHub Actions lint + build on push/PR.

## Tech Stack

- Frontend: React (v18), Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, react-helmet-async
- Auth: Clerk
- Backend: Netlify Functions (TypeScript), Supabase (PostgreSQL + Row Level Security), Cloudflare R2 (image uploads)
- Deployment: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Clerk application
- Cloudflare R2 bucket (public read)

### Installation

1. Clone and install:
   ```bash
   git clone <repository-url>
   cd john20-deals
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values (Supabase, Clerk, R2, `ALLOWED_ORIGINS`, `VITE_ADMIN_WHATSAPP`).

3. **Run the database migration**: open the Supabase SQL Editor and run the entire `supabase/migration_final.sql` script. This creates/updates tables, indexes, storage bucket, enables RLS, and adds public-read policies for `products` and `reviews`. It is idempotent and safe to re-run.

4. Configure Netlify environment variables to match your `.env` (including `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).

5. Run locally:
   ```bash
   npm run dev        # http://localhost:3000 (Vite + Express dev server)
   ```

6. Production build:
   ```bash
   npm run lint       # type-check
   npm run build      # bundle + server
   ```

### Environment Variables

See `.env.example` for full details. Key points:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — client-only, used for public catalog reads.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, used by Netlify Functions. Never expose the service-role key to the client.
- `ALLOWED_ORIGINS` — comma-separated browser origins allowed to call the API functions. `process.env.URL` (Netlify) and localhost are always allowed.
- `VITE_ADMIN_WHATSAPP` — admin WhatsApp number for cart checkout deep-links (default `233505694171`).

## Architecture & Security

Client never talks to the DB for writes. All mutations go through Netlify Functions:

| Function | Purpose |
| :--- | :--- |
| `submit-order` | Stock-checked order creation (decrements stock, validates inventory). |
| `submit-swap` / `submit-sell` / `submit-repair` | Store customer request submissions + notify admins. |
| `upload-url` | Generates Cloudflare R2 presigned upload URLs. |
| `admin-ops` | Admin dashboard data + all admin mutations (products, orders, swap/sell/repair lifecycle, subscribers, notifications). |
| `user-ops` | User-scoped data (orders/requests/notifications/reviews) + profile sync, newsletter subscribe, cancel repair. |

Shared helpers in `netlify/functions/shared/` handle CORS (`cors.ts`), rate limiting (`rate-limit.ts`), and admin lookup/notification (`notify-admin.ts`).

## Documentation

- [Product & Maintenance Documentation](./public/documentation.md)
- [Handover Guide](./HANDOVER.md)

## License

MIT
