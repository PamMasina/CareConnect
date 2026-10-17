-- Seed services (run after schema). Staff users are created via the app/admin.
insert into public.services (name, description, duration_minutes, provider_role) values
  ('General Consultation', 'Routine check-up with a doctor', 20, 'doctor'),
  ('Chronic Medication Review', 'Follow-up for chronic conditions', 15, 'doctor'),
  ('Vaccination', 'Immunisation appointment', 10, 'nurse'),
  ('Maternal Health Check', 'Prenatal/postnatal care', 30, 'nurse'),
  ('Emergency Triage', 'Urgent same-day assessment', 15, 'nurse')
on conflict do nothing;

-- update existing services with correct provider roles (idempotent)
update public.services set provider_role = 'doctor' where name in ('General Consultation', 'Chronic Medication Review');
update public.services set provider_role = 'nurse' where name in ('Vaccination', 'Maternal Health Check', 'Emergency Triage');
