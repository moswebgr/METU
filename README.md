# METU Marketplace

A responsive multi-vendor marketplace starter built with Next.js App Router, React, TypeScript, Tailwind CSS and Prisma.

## Included
- Responsive storefront with curated product discovery
- Search, category filtering and sorting
- Product cards, favorites and interactive shopping bag
- Seller recruitment and marketplace storytelling sections
- PostgreSQL/Prisma data model for customers, sellers, stores, products, categories, orders and reviews

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Run `npx prisma generate` and `npx prisma db push`.
5. Run `npm run dev` and open http://localhost:3000.

## Deploy to Vercel (recommended)
This is a Next.js application. **Do not deploy it with GitHub Pages**: GitHub Pages only hosts static files and cannot run the Next.js server features or Prisma-backed APIs required by a full marketplace.

1. Push the project to GitHub (the `main` branch is the production branch).
2. Sign in to Vercel and choose **Add New → Project**.
3. Import `moswebgr/METU`.
4. Keep the framework preset as **Next.js**. Vercel detects the build settings automatically.
5. Add the required environment variables in Vercel → Project → Settings → Environment Variables. At minimum, configure `DATABASE_URL` with a hosted PostgreSQL database when database-backed features are enabled.
6. Deploy. Future pushes to `main` trigger production deployments; pull requests can create preview deployments.

No `vercel.json` or GitHub Pages workflow is needed for the standard Next.js-on-Vercel setup.

## Continuous integration
The GitHub Actions workflow in `.github/workflows/ci.yml` installs dependencies, generates Prisma Client and runs a Next.js production build on pushes and pull requests.

## Production integrations still required
The current storefront uses curated demo products and client-side cart state. Before accepting real orders, connect catalog APIs to PostgreSQL, implement secure authentication and role-based authorization, add Stripe Checkout and verified webhooks, and build seller/admin management screens. The demo checkout does not process payments.

## Environment
See `.env.example`. Keep secrets out of Git. Never commit production database credentials, API keys or payment secrets.
