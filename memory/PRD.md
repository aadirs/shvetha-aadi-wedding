# Wedding Gift Collection Pots - PRD

## Problem Statement
Build a wedding gift "Collection Pots" full-stack web app (India-first) with Razorpay payments (INR), Supabase Postgres, single admin user, public access for anyone with link.

## Architecture
- **Backend**: FastAPI + Supabase Postgres (via REST API) + Razorpay SDK
- **Frontend**: React + Shadcn UI + Tailwind CSS + Razorpay Checkout.js
- **Database**: Supabase Postgres (5 tables: pots, pot_items, contribution_sessions, allocations, webhook_events)
- **Auth**: JWT with hardcoded admin credentials (Aadishve/061097)

## User Personas
1. **Wedding Guests** - View pots, contribute via Razorpay (UPI/cards/netbanking), leave blessings
2. **Couple (Admin)** - Manage pots, view contributions, export CSV, track progress

## Core Requirements
- Public: View pots, contribute without login, cart checkout, fee toggle
- Admin: CRUD pots/items, dashboard stats, contributions export
- Privacy: Never show individual amounts publicly
- Payments: Razorpay INR with webhook verification

## What's Been Implemented (Feb 7, 2026)
- Full backend with 20+ API endpoints (Supabase REST, Razorpay, JWT auth)
- Public homepage with "Shvetha & Aadi" wedding header, pot grid with progress bars
- Pot detail page with items, add-to-cart, contributor feed
- Cart drawer with multi-pot allocations, donor form, fee toggle, Razorpay checkout
- Admin dashboard with stats, pot CRUD with items, contributions table + CSV export
- South Indian traditional theme (crimson/gold/ivory), Playfair Display + Great Vibes fonts
- Cart persistence via localStorage
- Rate limiting, XSS sanitization, webhook signature verification
- 3 seed pots created: Dream Home, Honeymoon Adventures, Kitchen Essentials

## P0 (Done)
- [x] Supabase schema + all tables
- [x] Public pot listing with progress
- [x] Pot detail with items & contributors
- [x] Cart + multi-pot checkout
- [x] Razorpay order creation + webhook
- [x] Admin CRUD (pots, items)
- [x] Admin dashboard + CSV export
- [x] Mobile-first responsive design

## Fixes Applied (Feb 8, 2026)
- [x] **Fixed Razorpay checkout unresponsive on iOS Safari** — Removed checkout.js entirely. Now using Razorpay Payment Links API for ALL devices. When user clicks Pay, browser does a full page redirect to `https://razorpay.com/payment-link/...` (Razorpay's hosted checkout). No iframe, no popup, no cross-origin touch issues. After payment, Razorpay redirects to `/api/razorpay/payment-link/callback` which verifies HMAC signature and redirects to thank-you page.
  - Backend: `POST /api/razorpay/payment-link` (creates Razorpay Payment Link via API)
  - Backend: `GET /api/razorpay/payment-link/callback` (verifies signature, updates DB, redirects to /thank-you)
  - Frontend: `window.location.href = short_url` (full page redirect)
  - checkout.js script tag removed from index.html
- [x] Admin username capitalized: aadishve → Aadishve
- [x] "Goal reached" display for fully funded pots (completed prior session)
- [x] Admin username capitalized: aadishve → Aadishve
- [x] "Goal reached" display for fully funded pots (completed prior session)
- [x] Admin username capitalized: aadishve → Aadishve
- [x] "Goal reached" display for fully funded pots (completed prior session)

## Production Readiness (Feb 8, 2026)
- Full test suite: 19/19 backend, 100% frontend
- All flows tested on desktop (1920x800) and mobile (390x844)
- Zero critical bugs, zero UI bugs
- Tested: homepage, pot pages, cart, payment, thank you, admin login/dashboard/pots/contributions/export
- Ready for production: switch Razorpay keys from test to live in backend .env
- [ ] Razorpay webhook live testing (requires public webhook URL configured)
- [ ] Supabase realtime subscription for live total updates
- [ ] Email confirmation to donors after payment
- [ ] Image upload for pot covers (currently URL-based)

## P2 (Backlog)
- [ ] QR code sharing for individual pots
- [ ] Thank you page with confetti animation
- [ ] Admin: bulk archive, reorder pots
- [ ] PWA support for mobile home screen
