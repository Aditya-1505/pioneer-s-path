-- ============================================================
-- Pioneer Tours — Notifications + Read Status + Lead Priority
--
-- HOW TO APPLY:
--   1. Open Lovable Cloud (left sidebar) → Database → SQL Editor
--   2. Paste the contents of this file
--   3. Click Run
--
-- The agent could not apply this migration automatically because the
-- migration tool was not available in this session. The frontend code
-- (notification bell, sidebar badges, activity center) is written to
-- gracefully no-op until this SQL has been applied.
-- ============================================================

-- 1. Add is_read / read_at to source tables
alter table public.inquiries
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz;

alter table public.bookings
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz;

alter table public.custom_trip_requests
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz;

alter table public.surprise_trip_requests
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz;

alter table public.trip_planner_requests
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz;

alter table public.newsletter_subscribers
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz;

-- 2. Notifications table
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
create policy "Staff read notifications" on public.notifications
  for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff update notifications" on public.notifications;
create policy "Staff update notifications" on public.notifications
  for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- 3. Trigger function: create a notification when a new lead arrives
create or replace function public.fn_notify_new_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_title text;
  v_message text;
  v_name text;
begin
  v_name := coalesce(
    nullif(btrim(coalesce(to_jsonb(new) ->> 'name', '')), ''),
    nullif(btrim(coalesce(to_jsonb(new) ->> 'email', '')), ''),
    'Someone'
  );

  if tg_table_name = 'inquiries' then
    v_type := 'new_inquiry';
    v_title := 'New inquiry';
    v_message := v_name || ' is asking about ' || coalesce(to_jsonb(new) ->> 'destination', 'a trip') || '.';
  elsif tg_table_name = 'bookings' then
    v_type := 'new_booking';
    v_title := 'New booking';
    v_message := v_name || ' booked ' || coalesce(to_jsonb(new) ->> 'tour_title', 'a tour') || '.';
  elsif tg_table_name = 'custom_trip_requests' then
    v_type := 'new_custom_trip';
    v_title := 'New custom trip request';
    v_message := v_name || ' wants a custom trip to ' || coalesce(to_jsonb(new) ->> 'destination_preference', 'somewhere') || '.';
  elsif tg_table_name = 'surprise_trip_requests' then
    v_type := 'new_surprise_trip';
    v_title := 'New surprise trip request';
    v_message := v_name || ' is planning a surprise ' || coalesce(to_jsonb(new) ->> 'occasion', 'trip') || '.';
  elsif tg_table_name = 'trip_planner_requests' then
    v_type := 'new_planner_request';
    v_title := 'New planner lead';
    v_message := v_name || ' completed the trip planner.';
  elsif tg_table_name = 'newsletter_subscribers' then
    v_type := 'new_newsletter_subscriber';
    v_title := 'New newsletter subscriber';
    v_message := coalesce(to_jsonb(new) ->> 'email', 'A visitor') || ' subscribed to the newsletter.';
  else
    return new;
  end if;

  insert into public.notifications (title, message, type, related_table, related_record_id)
  values (v_title, v_message, v_type, tg_table_name, new.id);

  return new;
end;
$$;

-- 4. Triggers on every source table
do $$
declare
  t text;
begin
  foreach t in array array[
    'inquiries', 'bookings', 'custom_trip_requests',
    'surprise_trip_requests', 'trip_planner_requests', 'newsletter_subscribers'
  ]
  loop
    execute format('drop trigger if exists trg_notify_new_%s on public.%I', t, t);
    execute format(
      'create trigger trg_notify_new_%s after insert on public.%I for each row execute function public.fn_notify_new_record()',
      t, t
    );
  end loop;
end$$;

-- 5. Lead priority helper (budget stored as text)
create or replace function public.lead_priority(_budget text)
returns text
language sql
immutable
as $$
  with v as (
    select nullif(regexp_replace(coalesce(_budget, ''), '[^0-9]', '', 'g'), '')::numeric as n
  )
  select case
    when (select n from v) is null then 'unknown'
    when (select n from v) > 50000 then 'hot'
    when (select n from v) >= 20000 then 'warm'
    else 'cold'
  end;
$$;

grant execute on function public.lead_priority(text) to anon, authenticated, service_role;

-- 6. Realtime publication for live updates
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end$$;

-- Wrap each ADD TABLE so re-running is idempotent
do $$
declare t text;
begin
  foreach t in array array[
    'notifications', 'inquiries', 'bookings', 'custom_trip_requests',
    'surprise_trip_requests', 'trip_planner_requests', 'newsletter_subscribers'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end$$;
