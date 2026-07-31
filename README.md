# John20 Deals - E-Commerce Platform

Welcome to the **John20 Deals** platform! This is a modern, full-stack e-commerce application built with React, Vite, Tailwind CSS, and Supabase.

## 🚀 Features

- **Storefront**: Browse products, view details, and manage a shopping cart.
- **User Authentication**: Secure user login and registration powered by Supabase.
- **Admin Dashboard**: Comprehensive management of products, orders, customers, and swap requests.
- **Swap Requests**: Users can propose to trade in their items for store products.
- **Reviews & Ratings**: Customers can leave reviews and ratings for products.
- **Wishlist**: Save favorite products for later.
- **Responsive Design**: Beautiful, mobile-first design using Tailwind CSS.
- **Newsletter**: Subscribe to the newsletter for updates and promotions.

## 🛠️ Tech Stack

- **Frontend**: React (v18), Vite, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Netlify / Cloudflare (Functions for Presigned URLs and webhooks)

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd john20-deals
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 📚 Documentation

For detailed product and technical documentation, please see the [Product Documentation](./public/documentation.md) located in the `public` folder.

## 📄 License

This project is licensed under the MIT License.
