import { createClient } from '@supabase/supabase-js'
import type { Profile, Service, Appointment, QueueEntry, SosAlert, PatientMedicalRecord } from './types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const hasRealConfig = Boolean(
  rawUrl &&
    rawKey &&
    rawUrl.startsWith('http') &&
    !rawUrl.includes('your-project') &&
    !rawKey.includes('your-anon-key')
)

// ---------- IN-MEMORY / LOCALSTORAGE FALLBACK CLIENT ----------

const STORAGE_KEY = 'careconnect_mock_db_v1'

interface MockUser {
  id: string
  email: string
  password?: string
  user_metadata: {
    full_name?: string
    role?: Profile['role']
    clinic?: string
  }
}

interface MockDB {
  users: MockUser[]
  profiles: Profile[]
  services: Service[]
  appointments: Appointment[]
  queue_entries: QueueEntry[]
  sos_alerts: SosAlert[]
  clinic_settings: Record<string, any>[]
  patient_medical_records: PatientMedicalRecord[]
}

export interface QueryResult<T = any> {
  data: T
  error: { message: string } | null
  count?: number | null
}

export interface QueryBuilder {
  select(columns?: string, options?: { count?: string; head?: boolean }): QueryBuilder
  insert(values: any): QueryBuilder
  update(values: any): QueryBuilder
  delete(): QueryBuilder
  eq(column: string, value: any): QueryBuilder
  neq(column: string, value: any): QueryBuilder
  in(column: string, values: any[]): QueryBuilder
  gte(column: string, value: any): QueryBuilder
  lte(column: string, value: any): QueryBuilder
  gt(column: string, value: any): QueryBuilder
  lt(column: string, value: any): QueryBuilder
  order(column: string, options?: { ascending?: boolean }): QueryBuilder
  limit(n: number): QueryBuilder
  single(): QueryBuilder
  maybeSingle(): QueryBuilder
  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>
}

export interface MockSupabase {
  auth: {
    onAuthStateChange(callback: (event: string, session: any) => void): {
      data: { subscription: { unsubscribe: () => void } }
    }
    getSession(): Promise<{ data: { session: any }; error: any }>
    signInWithPassword(credentials: { email: string; password?: string }): Promise<{
      data: { user: any; session: any }
      error: { message: string } | null
    }>
    signUp(params: {
      email: string
      password?: string
      options?: { data?: { full_name?: string; role?: Profile['role']; clinic?: string; phone?: string } }
    }): Promise<{ data: { user: any; session: any }; error: { message: string } | null }>
    signOut(): Promise<{ error: null }>
    resetPasswordForEmail(email: string, options?: any): Promise<{ data: any; error: any }>
    updateUser(params: { data?: Record<string, any> }): Promise<{ data: { user: any }; error: any }>
    refreshSession(): Promise<{ data: { session: any }; error: any }>
  }
  channel(name: string): {
    on(event: string, filter: any, callback: () => void): any
    subscribe(): any
  }
  removeChannel(channel: any): void
  from(tableName: string): QueryBuilder
}

function getInitialDB(): MockDB {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const patientId = 'usr-patient-1'
  const doctorId = 'usr-doctor-1'
  const nurseId = 'usr-nurse-1'
  const responderId = 'usr-responder-1'
  const adminId = 'usr-admin-1'

  const services: Service[] = [
    { id: 'svc-1', name: 'General Consultation', description: 'Routine check-up with a doctor', duration_minutes: 20, provider_role: 'doctor', active: true, created_at: now.toISOString() },
    { id: 'svc-2', name: 'Chronic Medication Review', description: 'Follow-up for chronic conditions', duration_minutes: 15, provider_role: 'doctor', active: true, created_at: now.toISOString() },
    { id: 'svc-3', name: 'Vaccination', description: 'Immunisation appointment', duration_minutes: 10, provider_role: 'nurse', active: true, created_at: now.toISOString() },
    { id: 'svc-4', name: 'Maternal Health Check', description: 'Prenatal/postnatal care', duration_minutes: 30, provider_role: 'nurse', active: true, created_at: now.toISOString() },
    { id: 'svc-5', name: 'Emergency Triage', description: 'Urgent same-day assessment', duration_minutes: 15, provider_role: 'nurse', active: true, created_at: now.toISOString() },
  ]

  const users: MockUser[] = [
    { id: patientId, email: 'patient@careconnect.local', password: 'password123', user_metadata: { full_name: 'Thabo Mbeki', role: 'patient', clinic: 'Langa CHC' } },
    { id: doctorId, email: 'doctor@careconnect.local', password: 'password123', user_metadata: { full_name: 'Dr. Sipho Dlamini', role: 'doctor', clinic: 'Langa CHC' } },
    { id: nurseId, email: 'nurse@careconnect.local', password: 'password123', user_metadata: { full_name: 'Sister Nomvula Khumalo', role: 'nurse', clinic: 'Langa CHC' } },
    { id: 'usr-nurse-2', email: 'nurse2@careconnect.local', password: 'password123', user_metadata: { full_name: 'Sister Lindiwe Ntuli', role: 'nurse', clinic: 'Greenpoint Community Clinic' } },
    { id: responderId, email: 'responder@careconnect.local', password: 'password123', user_metadata: { full_name: 'David Hendricks (EMS)', role: 'first_responder', clinic: 'Langa CHC' } },
    { id: adminId, email: 'admin@careconnect.local', password: 'password123', user_metadata: { full_name: 'Admin Pam', role: 'admin', clinic: 'Cape Town Community Clinic' } },
  ]

  const profiles: Profile[] = [
    { id: patientId, full_name: 'Thabo Mbeki', role: 'patient', phone: '+27 71 234 5678', clinic: 'Langa CHC', created_at: now.toISOString() },
    { id: doctorId, full_name: 'Dr. Sipho Dlamini', role: 'doctor', phone: '+27 82 555 1234', clinic: 'Langa CHC', created_at: now.toISOString() },
    { id: nurseId, full_name: 'Sister Nomvula Khumalo', role: 'nurse', phone: '+27 83 444 5678', clinic: 'Langa CHC', created_at: now.toISOString() },
    { id: 'usr-nurse-2', full_name: 'Sister Lindiwe Ntuli', role: 'nurse', phone: '+27 82 444 9876', clinic: 'Greenpoint Community Clinic', created_at: now.toISOString() },
    { id: responderId, full_name: 'David Hendricks (EMS)', role: 'first_responder', phone: '+27 84 999 1122', clinic: 'Langa CHC', created_at: now.toISOString() },
    { id: adminId, full_name: 'Admin Pam', role: 'admin', phone: '+27 21 000 0000', clinic: 'Cape Town Community Clinic', created_at: now.toISOString() },
  ]

  const appt1Id = 'appt-1'
  const appt2Id = 'appt-2'
  const appt3Id = 'appt-3'

  const appointments: Appointment[] = [
    {
      id: appt1Id,
      patient_id: patientId,
      doctor_id: doctorId,
      service_id: 'svc-1',
      scheduled_at: `${todayStr}T10:00:00.000Z`,
      status: 'checked_in',
      queue_number: 1,
      notes: 'Clinic: Langa CHC · Annual medical checkup',
      clinic: 'Langa CHC',
      created_at: now.toISOString(),
    },
    {
      id: appt2Id,
      patient_id: patientId,
      doctor_id: doctorId,
      service_id: 'svc-2',
      scheduled_at: `${todayStr}T14:30:00.000Z`,
      status: 'booked',
      queue_number: 2,
      notes: 'Clinic: Langa CHC · Chronic prescription renewal',
      clinic: 'Langa CHC',
      created_at: now.toISOString(),
    },
    {
      id: appt3Id,
      patient_id: patientId,
      doctor_id: null,
      service_id: 'svc-3',
      scheduled_at: `${todayStr}T11:00:00.000Z`,
      status: 'booked',
      queue_number: 3,
      notes: 'Clinic: Langa CHC · Childhood vaccination with nursing team',
      clinic: 'Langa CHC',
      created_at: now.toISOString(),
    },
  ]

  const queue_entries: QueueEntry[] = [
    {
      id: 'queue-1',
      appointment_id: appt1Id,
      patient_id: patientId,
      checked_in_at: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'waiting',
      position: 1,
    },
  ]

  const sos_alerts: SosAlert[] = [
    {
      id: 'sos-1',
      patient_id: patientId,
      latitude: -33.9475,
      longitude: 18.5240,
      address_text: 'GPS -33.9475, 18.5240 · nearest Langa CHC',
      clinic: 'Langa CHC',
      message: 'Emergency type: Breathing difficult. Patient feeling faint.',
      status: 'active',
      responder_id: null,
      acknowledged_at: null,
      resolved_at: null,
      responder_notes: null,
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ]

  const clinic_settings = [
    {
      key: 'clinic',
      value: {
        name: 'Cape Town Community Clinic',
        address: '123 Long Street, Cape Town',
        phone: '+27 21 000 0000',
        hours: 'Mon-Fri 08:00-17:00',
      },
      updated_at: now.toISOString(),
    },
  ]

  const patient_medical_records: PatientMedicalRecord[] = [
    {
      id: 'mr-patient-1',
      patient_id: patientId,
      allergies: ['Penicillin'],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once daily',
          instructions: 'Take in the morning with food',
          prescribed_by: 'Dr. Sipho Dlamini',
          prescribed_at: now.toISOString(),
        },
      ],
      chronic_conditions: ['Hypertension'],
      medical_notes: 'Monitored for hypertension. Review at next chronic medication visit.',
      updated_by: doctorId,
      updated_at: now.toISOString(),
      created_at: now.toISOString(),
    },
  ]

  return {
    users,
    profiles,
    services,
    appointments,
    queue_entries,
    sos_alerts,
    clinic_settings,
    patient_medical_records,
  }
}

function loadDB(): MockDB {
  if (typeof window === 'undefined') return getInitialDB()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Tables added after a user's data was first written are backfilled in place so
      // existing local accounts are never discarded.
      if (!Array.isArray(parsed.patient_medical_records)) parsed.patient_medical_records = []
      return parsed as MockDB
    }
  } catch (e) {
    console.warn('Failed to parse mock db from localStorage', e)
  }
  const init = getInitialDB()
  saveDB(init)
  return init
}

function saveDB(db: MockDB) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (e) {
    console.warn('Failed to save mock db to localStorage', e)
  }
}

let activeChannelListeners: Array<() => void> = []

function notifyListeners() {
  activeChannelListeners.forEach(fn => {
    try {
      fn()
    } catch (e) {
      console.warn('Mock channel listener error', e)
    }
  })
}

// Session management
const SESSION_KEY = 'careconnect_mock_session'

function getSavedSession() {
  if (typeof window === 'undefined') return null
  try {
    const s = localStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

function setSavedSession(session: any) {
  if (typeof window === 'undefined') return
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

const authListeners: Array<(event: string, session: any) => void> = []

function createMockSupabaseClient(): MockSupabase {
  console.info('[CareConnect] Running with in-memory / local mock database. All features are fully functional.')

  return {
    auth: {
      onAuthStateChange(callback: (event: string, session: any) => void) {
        authListeners.push(callback)
        const currentSession = getSavedSession()
        setTimeout(() => callback(currentSession ? 'SIGNED_IN' : 'INITIAL_SESSION', currentSession), 0)
        return {
          data: {
            subscription: {
              unsubscribe() {
                const idx = authListeners.indexOf(callback)
                if (idx !== -1) authListeners.splice(idx, 1)
              },
            },
          },
        }
      },
      async getSession() {
        const session = getSavedSession()
        return { data: { session }, error: null }
      },
      async signInWithPassword({ email, password }: { email: string; password?: string }) {
        const db = loadDB()
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (!user) {
          return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } }
        }
        if (password && user.password && user.password !== password) {
          return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } }
        }
        const session = {
          access_token: 'mock-access-token-' + user.id,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata || {},
          },
        }
        setSavedSession(session)
        authListeners.forEach(cb => cb('SIGNED_IN', session))
        return { data: { user: session.user, session }, error: null }
      },
      async signUp({
        email,
        password,
        options,
      }: {
        email: string
        password?: string
        options?: { data?: { full_name?: string; role?: Profile['role']; clinic?: string; phone?: string } }
      }) {
        const db = loadDB()
        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (existing) {
          return { data: { user: null, session: null }, error: { message: 'User already registered' } }
        }
        const userId = 'usr-' + Math.random().toString(36).substring(2, 9)
        const role = options?.data?.role || 'patient'
        const fullName = options?.data?.full_name || email.split('@')[0]
        const clinic = options?.data?.clinic || null
        const phone = options?.data?.phone || null

        const newUser: MockUser = {
          id: userId,
          email,
          password: password || 'password123',
          user_metadata: { full_name: fullName, role, clinic: clinic || undefined },
        }
        const newProfile: Profile = {
          id: userId,
          full_name: fullName,
          role,
          phone,
          clinic,
          avatar_url: null,
          created_at: new Date().toISOString(),
        }

        db.users.push(newUser)
        db.profiles.push(newProfile)
        saveDB(db)

        const session = {
          access_token: 'mock-access-token-' + userId,
          user: { id: userId, email, user_metadata: newUser.user_metadata },
        }
        setSavedSession(session)
        authListeners.forEach(cb => cb('SIGNED_IN', session))

        return { data: { user: session.user, session }, error: null }
      },
      async signOut() {
        setSavedSession(null)
        authListeners.forEach(cb => cb('SIGNED_OUT', null))
        return { error: null }
      },
      async resetPasswordForEmail(_email: string, _options?: any) {
        return { data: {}, error: null }
      },
      async updateUser({ data }: { data?: Record<string, any> }) {
        const session = getSavedSession()
        if (!session?.user) return { data: { user: null }, error: { message: 'Not authenticated' } }
        const db = loadDB()
        const u = db.users.find(usr => usr.id === session.user.id)
        if (u) {
          u.user_metadata = { ...u.user_metadata, ...data }
          session.user.user_metadata = u.user_metadata
          setSavedSession(session)
          saveDB(db)
        }
        return { data: { user: session.user }, error: null }
      },
      async refreshSession() {
        const session = getSavedSession()
        return { data: { session }, error: null }
      },
    },

    channel(_name: string) {
      return {
        on(_event: string, _filter: any, callback: () => void) {
          activeChannelListeners.push(callback)
          return this
        },
        subscribe() {
          return this
        },
      }
    },

    removeChannel(_channel: any) {
      activeChannelListeners = []
    },

    from(tableName: keyof MockDB | string) {
      return createQueryBuilder(tableName as keyof MockDB)
    },
  }
}

function expandRelations(table: string, row: any, db: MockDB) {
  const cloned = { ...row }
  if (table === 'appointments') {
    if (cloned.service_id) {
      cloned.service = db.services.find(s => s.id === cloned.service_id) || null
    }
    if (cloned.patient_id) {
      cloned.patient = db.profiles.find(p => p.id === cloned.patient_id) || null
    }
    if (cloned.doctor_id) {
      cloned.doctor = db.profiles.find(p => p.id === cloned.doctor_id) || null
      cloned.clinic = cloned.doctor // For components reading clinic:profiles!doctor
    }
  } else if (table === 'queue_entries') {
    if (cloned.patient_id) {
      cloned.patient = db.profiles.find(p => p.id === cloned.patient_id) || null
    }
    if (cloned.appointment_id) {
      const appt = db.appointments.find(a => a.id === cloned.appointment_id)
      cloned.appointment = appt ? expandRelations('appointments', appt, db) : null
    }
  } else if (table === 'sos_alerts') {
    if (cloned.patient_id) {
      cloned.patient = db.profiles.find(p => p.id === cloned.patient_id) || null
    }
  }
  return cloned
}

function createQueryBuilder(tableName: keyof MockDB): QueryBuilder {
  let countOptions: { count?: string; head?: boolean } | null = null
  let isSingle = false
  let isMaybeSingle = false
  const filters: Array<(row: any) => boolean> = []
  let orderColumn: string | null = null
  let orderAscending = true
  let limitCount: number | null = null

  let insertData: any = null
  let updateData: any = null
  let isDelete = false

  const builder: QueryBuilder = {
    select(_columns = '*', options?: { count?: string; head?: boolean }) {
      if (options) countOptions = options
      return builder
    },

    insert(values: any) {
      insertData = values
      return builder
    },

    update(values: any) {
      updateData = values
      return builder
    },

    delete() {
      isDelete = true
      return builder
    },

    eq(column: string, value: any) {
      filters.push(row => row[column] === value)
      return builder
    },

    neq(column: string, value: any) {
      filters.push(row => row[column] !== value)
      return builder
    },

    in(column: string, values: any[]) {
      filters.push(row => values.includes(row[column]))
      return builder
    },

    gte(column: string, value: any) {
      filters.push(row => row[column] >= value)
      return builder
    },

    lte(column: string, value: any) {
      filters.push(row => row[column] <= value)
      return builder
    },

    gt(column: string, value: any) {
      filters.push(row => row[column] > value)
      return builder
    },

    lt(column: string, value: any) {
      filters.push(row => row[column] < value)
      return builder
    },

    order(column: string, options?: { ascending?: boolean }) {
      orderColumn = column
      orderAscending = options?.ascending !== false
      return builder
    },

    limit(n: number) {
      limitCount = n
      return builder
    },

    single() {
      isSingle = true
      return builder
    },

    maybeSingle() {
      isMaybeSingle = true
      return builder
    },

    async then<TResult1 = QueryResult, TResult2 = never>(
      onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
      try {
        const db = loadDB()
        let tableArray = (db[tableName] as any[]) || []
        if (!db[tableName]) (db as any)[tableName] = tableArray

        // Handle insert
        if (insertData) {
          const items = Array.isArray(insertData) ? insertData : [insertData]
          const createdItems = items.map(item => ({
            id: item.id || 'id-' + Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            ...item,
          }))

          tableArray.push(...createdItems)
          saveDB(db)
          notifyListeners()

          const resultData = Array.isArray(insertData) ? createdItems : createdItems[0]
          const res: QueryResult = { data: isSingle ? resultData : resultData, error: null }
          return onfulfilled ? onfulfilled(res) : (res as any)
        }

        // Handle update
        if (updateData) {
          let updatedCount = 0
          tableArray.forEach(row => {
            if (filters.every(f => f(row))) {
              Object.assign(row, updateData)
              updatedCount++
            }
          })
          if (updatedCount > 0) {
            saveDB(db)
            notifyListeners()
          }
          const res: QueryResult = { data: null, error: null }
          return onfulfilled ? onfulfilled(res) : (res as any)
        }

        // Handle delete
        if (isDelete) {
          const initialLen = tableArray.length
          tableArray = tableArray.filter(row => !filters.every(f => f(row)))
          ;(db as any)[tableName] = tableArray
          if (tableArray.length !== initialLen) {
            saveDB(db)
            notifyListeners()
          }
          const res: QueryResult = { data: null, error: null }
          return onfulfilled ? onfulfilled(res) : (res as any)
        }

        // Handle select / queries
        let result = tableArray.filter(row => filters.every(f => f(row)))
        const totalCount = result.length

        if (orderColumn) {
          result.sort((a, b) => {
            const valA = a[orderColumn!]
            const valB = b[orderColumn!]
            if (valA == null && valB == null) return 0
            if (valA == null) return orderAscending ? -1 : 1
            if (valB == null) return orderAscending ? 1 : -1
            if (valA < valB) return orderAscending ? -1 : 1
            if (valA > valB) return orderAscending ? 1 : -1
            return 0
          })
        }

        if (limitCount != null) {
          result = result.slice(0, limitCount)
        }

        // Expand joins/relations
        result = result.map(row => expandRelations(tableName as string, row, db))

        if (countOptions?.head) {
          const res: QueryResult = { data: null, count: totalCount, error: null }
          return onfulfilled ? onfulfilled(res) : (res as any)
        }

        if (isSingle) {
          const item = result[0]
          if (!item) {
            const res: QueryResult = { data: null, error: { message: 'Row not found' }, count: 0 }
            return onfulfilled ? onfulfilled(res) : (res as any)
          }
          const res: QueryResult = { data: item, error: null, count: 1 }
          return onfulfilled ? onfulfilled(res) : (res as any)
        }

        if (isMaybeSingle) {
          const item = result[0] || null
          const res: QueryResult = { data: item, error: null, count: item ? 1 : 0 }
          return onfulfilled ? onfulfilled(res) : (res as any)
        }

        const res: QueryResult = { data: result, count: totalCount, error: null }
        return onfulfilled ? onfulfilled(res) : (res as any)
      } catch (err: any) {
        const errorRes: QueryResult = { data: null, error: { message: err?.message || 'Database query error' }, count: 0 }
        return onrejected ? onrejected(errorRes) : (onfulfilled ? onfulfilled(errorRes) : (errorRes as any))
      }
    },
  }

  return builder
}

export const supabase: MockSupabase = hasRealConfig
  ? (createClient(rawUrl!, rawKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }) as any)
  : createMockSupabaseClient()

export type SupabaseClient = typeof supabase

// ---------- ADMIN USER PROVISIONING ----------
// Works against the local mock database and against a real Supabase project.

export interface StaffAccountInput {
  email: string
  password: string
  full_name: string
  role: Profile['role']
  clinic?: string | null
  phone?: string | null
}

export async function createStaffAccount(
  input: StaffAccountInput,
): Promise<{ error: { message: string } | null }> {
  const { email, password, full_name, role, clinic, phone } = input

  if (hasRealConfig) {
    // Use a throwaway client so provisioning a staff account does not disturb the admin session.
    const signupClient = createClient(rawUrl!, rawKey!, {
      auth: { persistSession: false, autoRefreshToken: false, storageKey: 'cc-admin-signup' },
    })
    const { error } = await signupClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role, clinic: clinic || undefined, phone: phone || undefined },
      },
    })
    return { error: error ? { message: error.message } : null }
  }

  const db = loadDB()
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: { message: 'An account with this email already exists.' } }
  }
  const id = 'usr-' + Math.random().toString(36).substring(2, 9)
  db.users.push({
    id,
    email,
    password,
    user_metadata: { full_name, role, clinic: clinic || undefined },
  })
  db.profiles.push({
    id,
    full_name,
    role,
    phone: phone || null,
    clinic: clinic || null,
    avatar_url: null,
    created_at: new Date().toISOString(),
  })
  saveDB(db)
  notifyListeners()
  return { error: null }
}

export async function deleteUserAccount(id: string): Promise<{ error: { message: string } | null }> {
  if (hasRealConfig) {
    // RLS "profiles_admin_all" permits an admin to remove the profile row.
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    return { error: error ? { message: error.message } : null }
  }
  const db = loadDB()
  db.users = db.users.filter(u => u.id !== id)
  db.profiles = db.profiles.filter(p => p.id !== id)
  saveDB(db)
  notifyListeners()
  return { error: null }
}