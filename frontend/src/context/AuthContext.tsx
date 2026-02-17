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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (ignore) return
      setSession(session)
      if (!session?.user) setProfile(null)
      if (event === 'INITIAL_SESSION' && !session?.user) setLoading(false)
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    let ignore = false

    fetchProfile(session.user.id)
      .then(p => {
        if (!ignore) {
          setProfile(p)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false)
      })

    return () => { ignore = true }
  }, [session?.user?.id])

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
