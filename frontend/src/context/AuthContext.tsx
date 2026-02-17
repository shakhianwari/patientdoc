import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'patient' | 'doctor' | 'admin' | null

export interface Profile {
  id: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  phone: string | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (ignore) return
      setSession(session)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        if (!ignore) setProfile(p)
      }
      if (!ignore) setLoading(false)
    }).catch(() => {
      if (!ignore) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, role: profile?.role ?? null, loading, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

