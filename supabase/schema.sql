-- Cape Town Clinic: schema
-- Run this in the Supabase SQL editor (or via supabase CLI) against a fresh project.

create extension if not exists "uuid-ossp";
create extension if not exists "postgis" with schema extensions;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'patient'
    check (role in ('patient','doctor','nurse','first_responder','admin')),
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- auto-create profile on signup; role taken from user_metadata.role (defaults to patient)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- services ----------
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration_minutes int not null default 15,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- appointments ----------
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid references public.profiles (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'booked'
    check (status in ('booked','checked_in','in_progress','completed','cancelled','no_show')),
  queue_number int,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_patient_idx on public.appointments (patient_id);
create index if not exists appointments_doctor_idx on public.appointments (doctor_id);
create index if not exists appointments_scheduled_idx on public.appointments (scheduled_at);

-- ---------- queue_entries ----------
create table if not exists public.queue_entries (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references public.appointments (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  status text not null default 'waiting'
    check (status in ('waiting','called','in_service','done','skipped')),
  position int,
  created_at timestamptz not null default now()
);

-- ---------- sos_alerts ----------
create table if not exists public.sos_alerts (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  latitude double precision,
  longitude double precision,
  address_text text,
  message text,
  status text not null default 'active'
    check (status in ('active','acknowledged','resolved','cancelled')),
  responder_id uuid references public.profiles (id) on delete set null,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  responder_notes text,
  created_at timestamptz not null default now()
);

create index if not exists sos_alerts_status_idx on public.sos_alerts (status);
create index if not exists sos_alerts_created_idx on public.sos_alerts (created_at desc);

-- ---------- clinic_settings ----------
create table if not exists public.clinic_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.clinic_settings (key, value)
values ('clinic', '{"name":"Cape Town Community Clinic","address":"123 Long Street, Cape Town","phone":"+27 21 000 0000","hours":"Mon-Fri 08:00-17:00"}'::jsonb)
on conflict (key) do nothing;
