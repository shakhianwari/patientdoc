import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthContext, type Profile } from '@/lib/authContext'
import type { Session } from '@supabase/supabase-js'

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (ignore) return
      setSession(session)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        if (!ignore) setProfile(p)
      } else {
        setProfile(null)
      }
      if (event === 'INITIAL_SESSION' && !ignore) setLoading(false)
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
