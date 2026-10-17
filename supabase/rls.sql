-- Row Level Security
-- Helper functions avoid recursive policy evaluation on public.profiles.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_user_role() to authenticated, anon;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.queue_entries enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.clinic_settings enable row level security;

-- profiles
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- services
drop policy if exists "services_select" on public.services;
drop policy if exists "services_staff_write" on public.services;
create policy "services_select" on public.services for select to authenticated using (true);
create policy "services_staff_write" on public.services for all to authenticated
  using (public.current_user_role() in ('doctor','nurse','admin'))
  with check (public.current_user_role() in ('doctor','nurse','admin'));

-- appointments
drop policy if exists "appointments_select" on public.appointments;
drop policy if exists "appointments_insert_patient" on public.appointments;
drop policy if exists "appointments_update" on public.appointments;
create policy "appointments_select" on public.appointments for select to authenticated
  using (
    patient_id = auth.uid() or
    doctor_id = auth.uid() or
    public.current_user_role() in ('doctor','nurse','admin','first_responder')
  );
create policy "appointments_insert_patient" on public.appointments for insert to authenticated
  with check (patient_id = auth.uid());
create policy "appointments_update" on public.appointments for update to authenticated
  using (
    patient_id = auth.uid() or
    doctor_id = auth.uid() or
    public.current_user_role() in ('doctor','nurse','admin')
  );

-- queue entries
drop policy if exists "queue_select" on public.queue_entries;
drop policy if exists "queue_insert" on public.queue_entries;
drop policy if exists "queue_update" on public.queue_entries;
create policy "queue_select" on public.queue_entries for select to authenticated
  using (
    patient_id = auth.uid() or
    public.current_user_role() in ('doctor','nurse','admin')
  );
create policy "queue_insert" on public.queue_entries for insert to authenticated
  with check (patient_id = auth.uid() or public.current_user_role() in ('doctor','nurse','admin'));
create policy "queue_update" on public.queue_entries for update to authenticated
  using (public.current_user_role() in ('doctor','nurse','admin'));

-- sos_alerts
drop policy if exists "sos_select" on public.sos_alerts;
drop policy if exists "sos_insert_patient" on public.sos_alerts;
drop policy if exists "sos_update" on public.sos_alerts;
create policy "sos_select" on public.sos_alerts for select to authenticated
  using (
    patient_id = auth.uid() or
    public.current_user_role() in ('doctor','nurse','admin','first_responder')
  );
create policy "sos_insert_patient" on public.sos_alerts for insert to authenticated
  with check (patient_id = auth.uid());
create policy "sos_update" on public.sos_alerts for update to authenticated
  using (
    patient_id = auth.uid() or
    public.current_user_role() in ('first_responder','admin')
  );

-- patient_medical_records
alter table public.patient_medical_records enable row level security;

drop policy if exists "medical_records_select" on public.patient_medical_records;
drop policy if exists "medical_records_insert" on public.patient_medical_records;
drop policy if exists "medical_records_update" on public.patient_medical_records;
drop policy if exists "medical_records_delete" on public.patient_medical_records;

create policy "medical_records_select" on public.patient_medical_records for select to authenticated
  using (
    patient_id = auth.uid() or
    public.current_user_role() in ('doctor','nurse','admin')
  );

create policy "medical_records_insert" on public.patient_medical_records for insert to authenticated
  with check (
    patient_id = auth.uid() or
    public.current_user_role() in ('doctor','nurse','admin')
  );

create policy "medical_records_update" on public.patient_medical_records for update to authenticated
  using (public.current_user_role() in ('doctor','nurse','admin'))
  with check (public.current_user_role() in ('doctor','nurse','admin'));

create policy "medical_records_delete" on public.patient_medical_records for delete to authenticated
  using (public.current_user_role() = 'admin');

-- clinic settings
drop policy if exists "settings_select" on public.clinic_settings;
drop policy if exists "settings_admin_write" on public.clinic_settings;
create policy "settings_select" on public.clinic_settings for select to authenticated using (true);
create policy "settings_admin_write" on public.clinic_settings for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- realtime publication (idempotent)
do $$ begin
  alter publication supabase_realtime add table public.sos_alerts;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.appointments;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.queue_entries;
exception when duplicate_object then null;
end $$;
