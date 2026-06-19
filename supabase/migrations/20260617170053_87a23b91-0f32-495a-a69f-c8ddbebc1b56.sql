CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  tour_title TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  travelers INT NOT NULL DEFAULT 1,
  departure_date DATE,
  addons TEXT[] DEFAULT '{}',
  total_amount NUMERIC DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone create booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();