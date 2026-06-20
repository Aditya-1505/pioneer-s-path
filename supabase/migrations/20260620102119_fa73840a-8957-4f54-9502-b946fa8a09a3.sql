-- ============================================================
-- PART 1: Notifications + read status (from db/migrations/01)
-- ============================================================
alter table public.inquiries add column if not exists is_read boolean not null default false, add column if not exists read_at timestamptz;
alter table public.bookings add column if not exists is_read boolean not null default false, add column if not exists read_at timestamptz;
alter table public.custom_trip_requests add column if not exists is_read boolean not null default false, add column if not exists read_at timestamptz;
alter table public.surprise_trip_requests add column if not exists is_read boolean not null default false, add column if not exists read_at timestamptz;
alter table public.trip_planner_requests add column if not exists is_read boolean not null default false, add column if not exists read_at timestamptz;
alter table public.newsletter_subscribers add column if not exists is_read boolean not null default false, add column if not exists read_at timestamptz;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  type text not null,
  related_table text,
  related_record_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);
create index if not exists notifications_is_read_idx on public.notifications (is_read);

grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

drop policy if exists "Staff read notifications" on public.notifications;
create policy "Staff read notifications" on public.notifications for select to authenticated using (public.is_staff(auth.uid()));
drop policy if exists "Staff update notifications" on public.notifications;
create policy "Staff update notifications" on public.notifications for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create or replace function public.fn_notify_new_record()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_type text; v_title text; v_message text; v_name text;
begin
  v_name := coalesce(nullif(btrim(coalesce(to_jsonb(new) ->> 'name', '')), ''), nullif(btrim(coalesce(to_jsonb(new) ->> 'email', '')), ''), 'Someone');
  if tg_table_name = 'inquiries' then v_type := 'new_inquiry'; v_title := 'New inquiry'; v_message := v_name || ' is asking about ' || coalesce(to_jsonb(new) ->> 'destination', 'a trip') || '.';
  elsif tg_table_name = 'bookings' then v_type := 'new_booking'; v_title := 'New booking'; v_message := v_name || ' booked ' || coalesce(to_jsonb(new) ->> 'tour_title', 'a tour') || '.';
  elsif tg_table_name = 'custom_trip_requests' then v_type := 'new_custom_trip'; v_title := 'New custom trip request'; v_message := v_name || ' wants a custom trip to ' || coalesce(to_jsonb(new) ->> 'destination_preference', 'somewhere') || '.';
  elsif tg_table_name = 'surprise_trip_requests' then v_type := 'new_surprise_trip'; v_title := 'New surprise trip request'; v_message := v_name || ' is planning a surprise ' || coalesce(to_jsonb(new) ->> 'occasion', 'trip') || '.';
  elsif tg_table_name = 'trip_planner_requests' then v_type := 'new_planner_request'; v_title := 'New planner lead'; v_message := v_name || ' completed the trip planner.';
  elsif tg_table_name = 'newsletter_subscribers' then v_type := 'new_newsletter_subscriber'; v_title := 'New newsletter subscriber'; v_message := coalesce(to_jsonb(new) ->> 'email', 'A visitor') || ' subscribed to the newsletter.';
  else return new; end if;
  insert into public.notifications (title, message, type, related_table, related_record_id) values (v_title, v_message, v_type, tg_table_name, new.id);
  return new;
end; $$;

do $$ declare t text; begin
  foreach t in array array['inquiries','bookings','custom_trip_requests','surprise_trip_requests','trip_planner_requests','newsletter_subscribers'] loop
    execute format('drop trigger if exists trg_notify_new_%s on public.%I', t, t);
    execute format('create trigger trg_notify_new_%s after insert on public.%I for each row execute function public.fn_notify_new_record()', t, t);
  end loop;
end$$;

do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then create publication supabase_realtime; end if;
end$$;
do $$ declare t text; begin
  foreach t in array array['notifications','inquiries','bookings','custom_trip_requests','surprise_trip_requests','trip_planner_requests','newsletter_subscribers'] loop
    begin execute format('alter publication supabase_realtime add table public.%I', t); exception when duplicate_object then null; end;
  end loop;
end$$;

-- ============================================================
-- PART 2: Map destinations
-- ============================================================
create table if not exists public.map_destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  latitude numeric not null,
  longitude numeric not null,
  image_url text,
  description text,
  tour_id uuid references public.tours(id) on delete set null,
  tour_slug text,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.map_destinations to anon;
grant select, insert, update, delete on public.map_destinations to authenticated;
grant all on public.map_destinations to service_role;
alter table public.map_destinations enable row level security;
create policy "Public view visible destinations" on public.map_destinations for select using (is_visible = true or public.is_staff(auth.uid()));
create policy "Staff manage destinations" on public.map_destinations for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger trg_map_destinations_updated before update on public.map_destinations for each row execute function public.update_updated_at_column();

-- ============================================================
-- PART 3: Tour add-ons
-- ============================================================
create table if not exists public.tour_addons (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null default 0,
  required boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.tour_addons to anon;
grant select, insert, update, delete on public.tour_addons to authenticated;
grant all on public.tour_addons to service_role;
alter table public.tour_addons enable row level security;
create policy "Public view addons" on public.tour_addons for select using (true);
create policy "Staff manage addons" on public.tour_addons for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger trg_tour_addons_updated before update on public.tour_addons for each row execute function public.update_updated_at_column();

-- ============================================================
-- PART 4: Seasonal collections
-- ============================================================
create table if not exists public.seasonal_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  season text,
  subtitle text,
  banner_image text,
  display_start date,
  display_end date,
  tour_id uuid references public.tours(id) on delete set null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.seasonal_collections to anon;
grant select, insert, update, delete on public.seasonal_collections to authenticated;
grant all on public.seasonal_collections to service_role;
alter table public.seasonal_collections enable row level security;
create policy "Public view active seasonal" on public.seasonal_collections for select using (is_active = true or public.is_staff(auth.uid()));
create policy "Staff manage seasonal" on public.seasonal_collections for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger trg_seasonal_updated before update on public.seasonal_collections for each row execute function public.update_updated_at_column();

-- ============================================================
-- PART 5: Premium tour fields + trip-specific FAQ
-- ============================================================
alter table public.tours
  add column if not exists highlights text[] default '{}',
  add column if not exists weather_info text,
  add column if not exists packing_guide text[] default '{}',
  add column if not exists accommodation text,
  add column if not exists transport text,
  add column if not exists network_info text,
  add column if not exists video_urls text[] default '{}';

alter table public.faq
  add column if not exists tour_id uuid references public.tours(id) on delete cascade,
  add column if not exists category text,
  add column if not exists display_order integer not null default 0;

-- ============================================================
-- PART 6: Integration settings
-- ============================================================
create table if not exists public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  status text not null default 'not_configured',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.integration_settings to authenticated;
grant all on public.integration_settings to service_role;
alter table public.integration_settings enable row level security;
create policy "Staff view integrations" on public.integration_settings for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff manage integrations" on public.integration_settings for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger trg_integration_settings_updated before update on public.integration_settings for each row execute function public.update_updated_at_column();