import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'patient' | 'doctor' | 'admin' | null

export interface Profile {
  id: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  phone: string | null
}

export interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
