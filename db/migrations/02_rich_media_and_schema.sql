-- Phase 1: Rich media schema expansion + Supabase Storage buckets
-- Run this in Lovable Cloud → Database → SQL Editor.

-- =============================================================
-- 1) TOURS: rich-media columns
-- =============================================================
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS property_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS smart_addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS destination_highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS best_months_label text,
  ADD COLUMN IF NOT EXISTS best_months_description text,
  ADD COLUMN IF NOT EXISTS trip_faqs jsonb NOT NULL DEFAULT '[]'::jsonb;

-- itinerary already exists as jsonb. New per-day shape supports:
--   { day, title, details, image, logistics }
-- Existing rows remain valid; new fields are optional.

-- =============================================================
-- 2) GALLERY: location_tag
-- =============================================================
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS location_tag text;
CREATE INDEX IF NOT EXISTS gallery_location_tag_idx ON public.gallery (location_tag);

-- Backfill: copy destination → location_tag where empty
UPDATE public.gallery SET location_tag = destination WHERE location_tag IS NULL AND destination IS NOT NULL;

-- =============================================================
-- 3) TESTIMONIALS: attached_image
-- =============================================================
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS attached_image text;

-- =============================================================
-- 4) STORAGE BUCKETS (public read)
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('tours', 'tours', true),
  ('gallery', 'gallery', true),
  ('properties', 'properties', true),
  ('blogs', 'blogs', true),
  ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- =============================================================
-- 5) STORAGE POLICIES — public SELECT, auth INSERT/UPDATE/DELETE
-- =============================================================
DO $$
DECLARE b text;
BEGIN
  FOR b IN SELECT unnest(ARRAY['tours','gallery','properties','blogs','testimonials'])
  LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS "%1$s_public_read" ON storage.objects;
      CREATE POLICY "%1$s_public_read" ON storage.objects
        FOR SELECT TO public USING (bucket_id = %1$L);

      DROP POLICY IF EXISTS "%1$s_auth_insert" ON storage.objects;
      CREATE POLICY "%1$s_auth_insert" ON storage.objects
        FOR INSERT TO authenticated WITH CHECK (bucket_id = %1$L);

      DROP POLICY IF EXISTS "%1$s_auth_update" ON storage.objects;
      CREATE POLICY "%1$s_auth_update" ON storage.objects
        FOR UPDATE TO authenticated USING (bucket_id = %1$L);

      DROP POLICY IF EXISTS "%1$s_auth_delete" ON storage.objects;
      CREATE POLICY "%1$s_auth_delete" ON storage.objects
        FOR DELETE TO authenticated USING (bucket_id = %1$L);
    $f$, b);
  END LOOP;
END $$;
