import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthValue {
  session: any
  user: any
  profile: Profile | null
  role: Profile['role'] | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string, role?: Profile['role'], staffNumber?: string) => Promise<{ error?: string; signedIn?: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (uid: string) => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    if (error) console.error('loadProfile error:', error.message)
    setProfile((data as Profile) ?? null)
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (!nextSession) setProfile(null)
      else loadProfile(nextSession.user.id)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
      setLoading(false)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (session?.user?.id) await loadProfile(session.user.id)
  }

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading,
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error && data.user) await loadProfile(data.user.id)
        return { error: error?.message }
      },
      async signUp(email, password, fullName, role = 'patient', staffNumber?: string) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              staff_number: staffNumber || undefined,
            },
          } as { data?: Record<string, unknown> },
        })
        if (!error && data.user && data.session) await loadProfile(data.user.id)
        return { error: error?.message, signedIn: Boolean(data.session) }
      },
      async signOut() {
        await supabase.auth.signOut()
        setProfile(null)
      },
      refreshProfile,
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
