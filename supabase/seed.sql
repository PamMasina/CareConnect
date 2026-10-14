-- Seed services (run after schema). Staff users are created via the app/admin.
insert into public.services (name, description, duration_minutes) values
  ('General Consultation', 'Routine check-up with a doctor', 20),
  ('Chronic Medication Review', 'Follow-up for chronic conditions', 15),
  ('Vaccination', 'Immunisation appointment', 10),
  ('Maternal Health Check', 'Prenatal/postnatal care', 30),
  ('Emergency Triage', 'Urgent same-day assessment', 15)
on conflict do nothing;
