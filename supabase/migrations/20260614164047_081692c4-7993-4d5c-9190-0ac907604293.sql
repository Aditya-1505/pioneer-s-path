
-- ROLES
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin','manager'))
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- TOURS
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  destination TEXT,
  vibe TEXT,
  group_type TEXT,
  short_description TEXT,
  description TEXT,
  itinerary JSONB DEFAULT '[]'::jsonb,
  duration TEXT,
  price NUMERIC DEFAULT 0,
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  group_size INT,
  seats_available INT DEFAULT 0,
  best_season TEXT,
  difficulty TEXT,
  hero_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  departure_dates DATE[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tours TO authenticated;
GRANT ALL ON public.tours TO service_role;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published tours" ON public.tours FOR SELECT USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage tours" ON public.tours FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX idx_tours_slug ON public.tours(slug);
CREATE INDEX idx_tours_status ON public.tours(status);
CREATE TRIGGER trg_tours_updated BEFORE UPDATE ON public.tours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LEAD TABLES (public insert, staff read/manage)
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, destination TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'new', notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.custom_trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, budget TEXT, travelers TEXT,
  travel_dates TEXT, destination_preference TEXT, requirements TEXT,
  status TEXT NOT NULL DEFAULT 'new', notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.custom_trip_requests TO authenticated;
GRANT INSERT ON public.custom_trip_requests TO anon, authenticated;
GRANT ALL ON public.custom_trip_requests TO service_role;
ALTER TABLE public.custom_trip_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit custom" ON public.custom_trip_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read custom" ON public.custom_trip_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update custom" ON public.custom_trip_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete custom" ON public.custom_trip_requests FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.surprise_trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, occasion TEXT, budget TEXT,
  destination TEXT, requirements TEXT,
  status TEXT NOT NULL DEFAULT 'new', notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.surprise_trip_requests TO authenticated;
GRANT INSERT ON public.surprise_trip_requests TO anon, authenticated;
GRANT ALL ON public.surprise_trip_requests TO service_role;
ALTER TABLE public.surprise_trip_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit surprise" ON public.surprise_trip_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read surprise" ON public.surprise_trip_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update surprise" ON public.surprise_trip_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete surprise" ON public.surprise_trip_requests FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.trip_planner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, email TEXT, phone TEXT,
  budget TEXT, travelers TEXT, month TEXT, trip_type TEXT, group_type TEXT,
  recommendation TEXT, status TEXT NOT NULL DEFAULT 'new', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.trip_planner_requests TO authenticated;
GRANT INSERT ON public.trip_planner_requests TO anon, authenticated;
GRANT ALL ON public.trip_planner_requests TO service_role;
ALTER TABLE public.trip_planner_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit planner" ON public.trip_planner_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read planner" ON public.trip_planner_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update planner" ON public.trip_planner_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete planner" ON public.trip_planner_requests FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- PUBLIC CONTENT TABLES
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL, rating INT DEFAULT 5, review TEXT,
  photo_url TEXT, video_url TEXT, trip_name TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Staff manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, destination TEXT, image_url TEXT, video_url TEXT, category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Staff manage gallery" ON public.gallery FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, meta_title TEXT, meta_description TEXT,
  cover_image TEXT, content TEXT, category TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blogs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blogs TO authenticated;
GRANT ALL ON public.blogs TO service_role;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Staff manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX idx_blogs_slug ON public.blogs(slug);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, description TEXT, active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Staff manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL, answer TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT ALL ON public.faq TO service_role;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faq" ON public.faq FOR SELECT USING (true);
CREATE POLICY "Staff manage faq" ON public.faq FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, role TEXT, image_url TEXT, description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read team" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Staff manage team" ON public.team_members FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email) VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
