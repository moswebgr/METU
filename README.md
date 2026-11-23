# METU Marketplace

METU is a Next.js App Router multi-vendor marketplace built with TypeScript, Prisma, PostgreSQL and Stripe Checkout.

## Current application

- Public storefront backed by active products in PostgreSQL
- Product detail pages, categories and product search
- Customer registration and credential sign-in
- Passwords hashed with bcrypt; sessions managed by NextAuth JWT cookies
- Seller application workflow and admin approval
- Seller store and draft product creation
- Customer order history
- Stripe Checkout session creation and signed webhook handling
- Role-protected seller and admin routes
- Responsive Greek-language storefront and SEO metadata

## Required production services

1. Vercel for hosting the Next.js application.
2. PostgreSQL (Neon recommended) for users, stores, products, inventory and orders.
3. Stripe account and webhook endpoint for card payments.
4. A domain name, configured after the production deployment is stable.

GitHub Pages is static hosting and cannot run this application's server routes, authentication, Prisma or Stripe webhooks. Use the Vercel project linked to this repository.

## Environment variables

Copy .env.example and configure the following in Vercel for Production, Preview and Development as appropriate:

- DATABASE_URL: PostgreSQL connection string (use the pooled connection URL from your provider).
- NEXTAUTH_SECRET: unique random secret (at least 32 random bytes).
- NEXTAUTH_URL: canonical production URL.
- STRIPE_SECRET_KEY: Stripe secret key; start with a test key.
- STRIPE_WEBHOOK_SECRET: signing secret for /api/stripe/webhook.
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Stripe publishable key (not currently needed by hosted Checkout but retained for future UI integrations).
- ADMIN_EMAILS: comma-separated email addresses to promote to ADMIN during seeding.
- NEXT_PUBLIC_SITE_URL: canonical public site URL.

Never commit real secrets.

## First-time setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Register an account using an email listed in ADMIN_EMAILS, then run npm run db:seed again to grant that existing account the ADMIN role. Admin access is never self-selected in the registration form.

## Stripe setup

Configure a Stripe webhook pointing to:

```
https://YOUR_PRODUCTION_DOMAIN/api/stripe/webhook
```

Subscribe to checkout.session.completed and checkout.session.expired. Use Stripe test keys and test cards before switching to live mode. Verify webhook delivery in Stripe before accepting live payments.

## Seller onboarding

A customer submits a seller application. An administrator approves it in the Admin Dashboard. Approval creates the seller's store and changes their role to SELLER. Seller-created products are saved as DRAFT and require admin approval before appearing publicly.

## Launch checklist

- [ ] Provision PostgreSQL and set DATABASE_URL in Vercel.
- [ ] Set a unique NEXTAUTH_SECRET and canonical app URLs.
- [ ] Deploy the production branch and confirm the build is green.
- [ ] Run Prisma schema setup and seed categories/admin role.
- [ ] Configure Stripe test keys and the webhook; test a complete payment.
- [ ] Configure transactional email, shipping rates/labels, VAT/tax handling and refund workflows.
- [ ] Add rate limiting / bot protection to registration and application endpoints.
- [ ] Review GDPR, cookie consent, terms, returns, seller agreements and privacy notices with qualified counsel.
- [ ] Test account recovery, order confirmation emails, stock races, refunds, multi-seller payouts and all mobile breakpoints.
- [ ] Only then attach the purchased domain and switch Stripe to live mode.

The codebase contains the core marketplace foundation, but a production launch still depends on external provider credentials, operational policies and end-to-end testing. In particular, seller payouts, shipping integrations, transactional email, tax/VAT calculations and customer password recovery are not yet implemented.
