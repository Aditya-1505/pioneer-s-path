
CREATE POLICY "Public read pioneer-media" ON storage.objects FOR SELECT USING (bucket_id = 'pioneer-media');
CREATE POLICY "Staff upload pioneer-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pioneer-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update pioneer-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pioneer-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete pioneer-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pioneer-media' AND public.is_staff(auth.uid()));
