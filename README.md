# METU Marketplace

A responsive multi-vendor marketplace starter built with Next.js App Router, React, TypeScript, Tailwind CSS and Prisma.

## Included
- Responsive storefront with curated product discovery
- Search, category filtering and sorting
- Product cards, favorites and interactive shopping bag
- Seller recruitment and marketplace storytelling sections
- PostgreSQL/Prisma data model for customers, sellers, stores, products, categories, orders and reviews

## Quick start
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Run `npx prisma generate` and `npx prisma db push`.
5. Run `npm run dev` and open http://localhost:3000.

## Production integrations still required
The storefront currently uses curated demo products and client-side cart state. Before accepting real orders, connect catalog APIs to PostgreSQL, implement secure authentication and role-based authorization, add Stripe Checkout and verified webhooks, and build seller/admin management screens. The demo checkout does not process payments.

## Environment
See `.env.example`. Keep secrets out of Git.
