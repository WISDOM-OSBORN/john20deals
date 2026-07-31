# John20 Deals - Product & Maintenance Documentation

## 1. Overview
**John20 Deals** is a comprehensive, scalable e-commerce platform. This documentation is specifically designed to help developers and maintainers quickly locate files, understand the architecture, and troubleshoot issues easily.

---

## 2. 🗂️ Visual Directory Structure
Here is the visual layout of the codebase to help you find exactly what you need for maintenance:

```text
john20-deals/
├── 📁 netlify/
│   └── 📁 functions/         <-- 🚀 SERVERLESS APIs (Backend Logic)
│       ├── submit-swap.ts    <-- API: Handles swap request submissions
│       └── upload-url.ts     <-- API: Handles secure image uploads (Presigned URLs)
│
├── 📁 src/                   <-- 💻 FRONTEND CODE (React application)
│   ├── 📁 components/        <-- Reusable UI pieces
│   │   ├── Navbar.tsx        <-- Main navigation & Cart toggle
│   │   ├── ProductCard.tsx   <-- Individual product display in grids
│   │   └── ...
│   │
│   ├── 📁 context/           <-- Global State Management
│   │   ├── AuthContext.tsx   <-- Manages user login/session state
│   │   └── CartContext.tsx   <-- Manages shopping cart items & totals
│   │
│   ├── 📁 lib/               <-- Utilities & Configurations
│   │   └── supabase.ts       <-- Supabase database connection setup
│   │
│   ├── 📁 pages/             <-- Main Application Screens
│   │   ├── AdminDashboard.tsx<-- 🛡️ ADMIN PANEL (Products, Swaps, Orders)
│   │   ├── Home.tsx          <-- Landing page
│   │   ├── Shop.tsx          <-- Product directory
│   │   └── ProductDetails.tsx<-- Single product view & "Propose Swap" modal
│   │
│   └── 📁 types/             <-- TypeScript Definitions
│       └── supabase.ts       <-- Database schema definitions
│
├── 📄 netlify.toml           <-- Deployment & API routing configuration
└── 📄 package.json           <-- Dependencies & build scripts
```

---

## 3. 🗺️ Where to Find Features (Maintenance Guide)

Use this table to quickly locate the code for specific features when you need to make updates or fix bugs.

| Feature / Logic | File Location | Description |
| :--- | :--- | :--- |
| **Swap Requests (Frontend)** | `/src/pages/ProductDetails.tsx` | Contains the "Propose Swap" modal UI and submission logic. |
| **Swap Requests (Backend API)** | `/netlify/functions/submit-swap.ts` | Receives the swap data and inserts it into the database. |
| **Admin Dashboard**| `/src/pages/AdminDashboard.tsx` | Where admins view swaps, add products, and manage orders. |
| **Shopping Cart Logic** | `/src/context/CartContext.tsx` | Handles adding/removing items and calculating totals. |
| **Image Upload API** | `/netlify/functions/upload-url.ts` | Generates secure links for uploading images. |
| **Database Connection** | `/src/lib/supabase.ts` | Supabase initialization. Check here if DB connection is failing. |
| **Database Types/Schema** | `/src/types/supabase.ts` | Update this if you add new columns to your database. |
| **API Routing / Redirects** | `/netlify.toml` | Maps `/api/submit-swap` to the serverless function. |

---

## 4. 🛠️ Troubleshooting & Issue Solving

### Issue: Users cannot upload images for Swaps or Admin Products
**Where to look:**
1. Check `/netlify/functions/upload-url.ts` (Backend API handling uploads).
2. Verify Cloudflare R2 / S3 environment variables in your deployment dashboard (Netlify/Vercel).
3. Look at `handleSwapUpload` in `/src/pages/ProductDetails.tsx` to see if the frontend is catching an error.

### Issue: "Propose Swap" button is not working or throwing errors
**Where to look:**
1. Check `/src/pages/ProductDetails.tsx` (Look for the `submitSwapRequest` function).
2. Check `/netlify/functions/submit-swap.ts` to ensure the backend is correctly parsing the request and communicating with Supabase.
3. Ensure `netlify.toml` has the correct redirect: `/api/submit-swap` -> `/.netlify/functions/submit-swap`.

### Issue: Admin cannot see new Swap Requests
**Where to look:**
1. Open `/src/pages/AdminDashboard.tsx`.
2. Look for the `fetchData` function to ensure it is querying the `swap_requests` table correctly.
3. Check your Supabase database directly to ensure the row was actually inserted.

### Issue: Cart clears when refreshing the page
**Where to look:**
1. Open `/src/context/CartContext.tsx`.
2. Ensure `localStorage` is being properly read during initialization and written to when the cart state changes.

---

## 5. Database Schema Quick Reference

*   **`profiles`**: User metadata (Linked to Supabase Auth).
*   **`products`**: The main catalog inventory (Admin managed).
*   **`orders`**: Tracks customer purchases and cart snapshots.
*   **`swap_requests`**: Trade-in proposals linked to users and products.
*   **`reviews`**: Product feedback.
