# Implementation Plan

This is a large scope (~13 feature areas). I'll group it into 4 phases so each can be verified before moving on. Confirm the phasing — or tell me to do it all in one go — and I'll start.

## Phase 1 — Backend foundation (DB + realtime)
Single migration adding:
- `is_read boolean default false`, `read_at timestamptz` on `inquiries`, `bookings`, `custom_trip_requests`, `surprise_trip_requests`, `planner_requests`, `newsletter_subscribers` (only those that already exist — I'll verify table names first).
- `notifications` table (id, title, message, type, related_record_id, related_table, is_read, created_at) + GRANTs + RLS (staff-only read/update via `has_role`).
- `lead_priority` generated/derived column or view based on budget thresholds (hot >50k red, warm 20–50k orange, cold <20k blue).
- DB triggers on each source table → `INSERT INTO notifications` with the right `type`.
- Enable Supabase Realtime publication on `notifications` + source tables.
- Add tables to `supabase_realtime` publication.

## Phase 2 — Admin dashboard
- Sidebar badges (live unread counts per section, subscribed via realtime).
- Dashboard summary cards: Total Requests, Unread, New Today, Converted Leads.
- Bell icon in admin header → dropdown (unread badge, list, mark one / mark all read, click → open record).
- Activity Center page (chronological feed across all submission types).
- "View Website" button (top-right, opens `/` in new tab).
- Lead priority badges in all CRM tables.
- Marking a record viewed sets `is_read=true, read_at=now()`.

## Phase 3 — Public site fixes
- **Videos**: audit every `<video>` usage, ensure `autoPlay muted loop playsInline`; hero fade transitions; testimonial fullscreen + controls; gallery hover-play / leave-pause.
- **India Map**: replace current `IndiaMap.tsx` with `react-simple-maps` (zoom/pan/hover/click) showing Goa, Kerala, Manali, Spiti, Kashmir, Ladakh, Meghalaya; popup card with name, starting price, duration, seats, "View Trip" button (data from `tours` table).
- **Blog detail**: enhance `/blog/$slug` with author, reading time, related/recent articles, share buttons (WhatsApp/Facebook/LinkedIn/Copy), dynamic OG + JSON-LD Article schema.
- **Cancellation CTA** in "Travel With Total Peace" section linking to `/cancellation`.

## Phase 4 — Legal pages + mobile UX
- Replace `ComingSoon` on `/terms`, `/privacy`, `/cancellation` with full long-form content (generic India tour-operator template — user can edit).
- Mobile sticky CTAs: WhatsApp, Call, Plan My Trip (always visible on mobile).
- Optional bottom nav (Home / Trips / Planner / Contact / WhatsApp) — included unless you'd rather skip it.

## Technical notes
- All notification creation is DB-trigger driven so no app code can forget to fire it.
- Realtime subscriptions live in a single `useNotifications` hook + per-section `useUnreadCount(table)` hook.
- Lead priority is computed in SQL (function) so admin tables and dashboards agree.
- No external services (no email/SMS/push); strictly in-app.

## Open questions
1. Legal copy: should I draft generic templates (and you fill blanks like company address/GST/contact), or do you have existing text to paste in?
2. Bottom mobile nav — include it, or stick to the floating CTAs only?
3. "Converted Leads" — define as bookings with `status='confirmed'`? Or a separate flag?

Reply with any tweaks (or just "go") and I'll start with Phase 1.
