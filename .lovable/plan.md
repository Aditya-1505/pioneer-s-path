# Pioneer Tours — Architectural Upgrade Plan

Large scope. I'll ship it in 5 focused phases so each phase is reviewable and the app stays working between phases.

---

## Phase 1 — Database & Storage Foundation

**Migration `db/migrations/02_rich_media_and_schema.sql`:**
- `tours`: add `property_images jsonb default '[]'`, `smart_addons jsonb default '[]'`, `destination_highlights jsonb default '[]'`, `best_months_label text`, `best_months_description text`, `trip_faqs jsonb default '[]'`. Keep existing `itinerary jsonb` but document new per-day shape: `{ day, title, details, image, logistics }`.
- `gallery`: add `location_tag text`, index on it.
- `testimonials`: add `attached_image text`.
- Create Supabase Storage buckets via tool: `tours`, `gallery`, `properties`, `blogs`, `testimonials` (public read).
- RLS policies on `storage.objects`: public SELECT, authenticated INSERT/UPDATE/DELETE (admins only via has_role check).

**Shared uploader component `src/components/admin/ImageUploader.tsx`:**
- Drag-and-drop + click-to-select, supports single or multi.
- Uploads to chosen bucket, returns public URL(s), shows previews with remove buttons.
- Used by every admin form.

## Phase 2 — Admin Panel Upgrades

- `ToursAdmin.tsx`: replace `hero_image`, `gallery_images`, `property_images` text inputs with `ImageUploader`. Add new editors:
  - Per-itinerary-day: image upload + logistics text input.
  - Smart Add-ons repeater (label, price, description).
  - Destination Highlights repeater (place, fact, must-try food, activities, photo).
  - Best Months (label + description textarea).
  - Trip FAQs repeater (question, answer).
- `GalleryAdmin` / `SimpleCrud` gallery section: ImageUploader + `location_tag` field.
- Blogs & Properties admin: ImageUploader for cover/featured images.
- Testimonials admin: ImageUploader for `attached_image`.

## Phase 3 — Homepage Rearrangement

`src/routes/index.tsx` new section order:
1. Hero
2. **Side-by-side planners**: `PlanWizard` + Surprise (new wrapper `ConversionPlanners.tsx`, `md:grid-cols-2`)
3. Featured Tours
4. **Testimonials / Wall of Love** (moved up)
5. **Unified Tour Explorer** `JourneyExplorer.tsx` with tabs: Featured | Trending | In Season (merges featured + seasonal)
6. India Map
7. FAQ Preview
8. Safety/Trust + Floating Photos
9. Footer

Remove standalone `SeasonalTours` placement (it becomes a tab inside JourneyExplorer).

## Phase 4 — Tour Detail Page Overhaul

`src/routes/tours.$slug.tsx`:
- **Accommodation Showcase** grid from `property_images`.
- **Enhanced Itinerary**: each day card shows `image` + logistics badge `🚗 A → B | km | hrs`.
- **Destination Deep-Dive** card grid from `destination_highlights`.
- **When to Go** banner from `best_months_*`.
- **Smart Add-ons** checkboxes near pricing (replaces generic `tour_addons` fetch).
- **Trip FAQs** accordion at bottom from `trip_faqs`.
- **Connect CTAs** (WhatsApp / Call) after pricing and after itinerary.

## Phase 5 — Forms, Nav & Gallery

- Forms (`contact`, `custom-planner`, `surprise-planner`, `BookingModal`): only Name + Phone required; email optional; remove any auth gate. Keep prefill if signed in.
- Inline Connect CTAs in `custom-planner` and after pricing blocks.
- Navbar: collapse Gallery + Blog into "Travel Diaries" dropdown.
- Gallery page: fetch distinct `location_tag` values → filter chips; filter masonry grid by selected tag.
- Testimonials component: render `attached_image` when present.

---

## Technical Notes

- All new `jsonb` columns default `'[]'` / NULL so existing rows keep working.
- Storage uploads use the browser `supabase` client; admin route is already auth-gated.
- The Activity Center, NotificationBell, and pre-existing systems remain untouched.
- I'll keep changes additive — no destructive renames of existing columns.

After you approve, I'll begin with Phase 1 (migration + uploader). Each phase is a separate response so you can review and test.
