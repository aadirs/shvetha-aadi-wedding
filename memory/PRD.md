# Wedding Gift Collection Pots - PRD

## Problem Statement
Build a wedding gift "Collection Pots" full-stack web app (India-first) with dual payment support (Razorpay + personal UPI), Supabase Postgres, single admin user, public access for anyone with link.

## Architecture
- **Backend**: FastAPI + Supabase Postgres (via REST API) + Razorpay SDK
- **Frontend**: React + Shadcn UI + Tailwind CSS + qrcode.react + canvas-confetti
- **Database**: Supabase Postgres (5 tables: pots, pot_items, contribution_sessions, allocations, webhook_events)
- **Auth**: JWT with admin credentials (Aadishve/061097)
- **Payment Toggle**: `PAYMENT_PROVIDER` env var switches between "upi" and "razorpay"

## User Personas
1. **Wedding Guests** - View pots, contribute via UPI (scan QR / deep link) or Razorpay, leave blessings
2. **Couple (Admin)** - Manage pots, view contributions, mark as Received/Failed, export CSV

## Core Requirements
- Public: View pots, contribute without login, cart checkout
- UPI mode: Cart → UPI Modal (QR + deep link) → Blessing form (name/phone/message/UTR) → Confetti → Thank You
- Razorpay mode: Cart with donor form → Razorpay checkout.js popup → Thank You
- Admin: CRUD pots/items, dashboard stats, contributions export, mark contributions Received/Failed
- Privacy: Never show individual amounts publicly

## What's Been Implemented

### Phase 1 (Feb 7, 2026)
- Full backend with 20+ API endpoints (Supabase REST, Razorpay, JWT auth)
- Public homepage with "Shvetha & Aadi" wedding header, pot grid with progress bars
- Pot detail page with items, add-to-cart, contributor feed
- Cart drawer with multi-pot allocations, donor form, fee toggle, Razorpay checkout
- Admin dashboard with stats, pot CRUD with items, contributions table + CSV export
- South Indian traditional theme (crimson/gold/ivory), Playfair Display + Great Vibes fonts

### Phase 2 (Feb 8, 2026)
- Fixed Razorpay checkout iOS Safari issue (Sheet overlay blocking touch events)
- Added Razorpay Payment Links API as alternative flow
- Admin username capitalized: Aadishve
- "Goal reached" display for fully funded pots
- Production readiness testing: 100% pass rate

### Phase 3 (Feb 13, 2026) - UPI Payment Mode
- **PAYMENT_PROVIDER env toggle** — switches between "upi" and "razorpay" modes
- **UPI Cart** — Removed donor fields, ceremonial styling, "Proceed to Blessing" button
- **UPI Modal** — QR code (240px, black/white, level M, 4-module margin), "Pay via UPI App" deep link, instruction text
- **Blessing Confirmation Form** — Name*, Phone*, Blessing Message* (required), UTR (optional with tooltip)
- **Post-submit** — Golden confetti (slow fall, ceremonial), toast, redirect to Thank You
- **Backend**: `POST /api/upi/session/create`, `POST /api/upi/blessing/confirm`, `GET /api/config`
- **Admin Status Management** — Mark contributions as Received (→paid) or Failed, cascades to allocations
- **Updated totals** — Pot progress counts paid status (covers both Razorpay and UPI confirmed)
- All tests passing: 20/20 backend, 100% frontend

## DB Schema
- **pots**: id, title, slug, story, cover_image_url, goal_amount, created_at, archived
- **pot_items**: id, pot_id, title, amount, description, image_url, sort_order
- **contribution_sessions**: id, razorpay_order_id, status (created/pending/paid/failed), donor_name, donor_email, donor_phone, donor_message, total_amount_paise, fee_amount_paise, paid_at, created_at
  - Note: `utr` and `payment_method` columns pending (need Supabase dashboard access)
- **allocations**: id, session_id, pot_id, pot_item_id, amount_paise, status (pending/paid/failed)
- **webhook_events**: id, body, headers, created_at

## Key API Endpoints
- `GET /api/config` — Returns payment_provider setting
- `GET /api/pots` / `GET /api/pots/:slug` — Public pot listing
- `POST /api/upi/session/create` — Create UPI session (no donor info)
- `POST /api/upi/blessing/confirm` — Submit blessing after UPI payment
- `POST /api/session/create-or-update` — Razorpay session
- `POST /api/razorpay/order/create` — Razorpay order
- `POST /api/admin/contributions/:id/status` — Mark Received/Failed

## P1 (Next)
- [ ] Add `utr` and `payment_method` columns to Supabase (requires dashboard access)
- [ ] Email confirmation to donors after payment
- [ ] Supabase realtime subscription for live total updates

## P2 (Backlog)
- [ ] Image upload for pot covers (currently URL-based)
- [ ] QR code sharing for individual pots
- [ ] Admin: bulk archive, reorder pots
- [ ] PWA support for mobile home screen

## Current Config
- `PAYMENT_PROVIDER=upi` (both frontend and backend)
- UPI ID: `861805225@ybl`
- Admin: Aadishve / 061097
- Preview URL: https://shvetha-aadi-gifts.preview.emergentagent.com
