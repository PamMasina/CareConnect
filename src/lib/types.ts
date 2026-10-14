export type Role = 'patient' | 'doctor' | 'nurse' | 'first_responder' | 'admin'

export interface Profile {
  id: string
  full_name: string
  role: Role
  phone?: string | null
  avatar_url?: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description?: string | null
  duration_minutes: number
  active: boolean
  created_at: string
}

export type AppointmentStatus = 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string | null
  service_id: string | null
  scheduled_at: string
  status: AppointmentStatus
  queue_number: number | null
  notes: string | null
  created_at: string
  // joined
  service?: Service | null
  doctor?: Profile | null
  patient?: Profile | null
}

export type QueueStatus = 'waiting' | 'called' | 'in_service' | 'done' | 'skipped'

export interface QueueEntry {
  id: string
  appointment_id: string | null
  patient_id: string
  checked_in_at: string
  status: QueueStatus
  position: number | null
  patient?: Profile | null
  appointment?: Appointment | null
}

export type SosStatus = 'active' | 'acknowledged' | 'resolved' | 'cancelled'

export interface SosAlert {
  id: string
  patient_id: string
  latitude: number | null
  longitude: number | null
  address_text: string | null
  message: string | null
  status: SosStatus
  responder_id: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  responder_notes: string | null
  created_at: string
  patient?: Profile | null
}

export interface ClinicSettings {
  name: string
  address: string
  phone: string
  hours: string
}