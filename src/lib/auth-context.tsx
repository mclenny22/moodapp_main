'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
// import { createClient } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // const supabase = createClient()

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser === 'true') {
      setUser({ 
        id: 'demo-user', 
        email: 'demo@example.com',
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString()
      } as User)
      setLoading(false)
      return
    }

    // For deployment without Supabase, just set loading to false
    // TODO: Uncomment when Supabase is connected
    setLoading(false)
    
    // Get initial session
    // const getSession = async () => {
    //   const { data: { session } } = await supabase.auth.getSession()
    //   setUser(session?.user ?? null)
    //   setLoading(false)
    // }

    // getSession()

    // Listen for auth changes
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     setUser(session?.user ?? null)
    //     setLoading(false)
    //   }
    // )

    // return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    // Check if it's a demo user
    if (user?.id === 'demo-user') {
      localStorage.removeItem('demo-user')
      setUser(null)
      return
    }
    
    // TODO: Uncomment when Supabase is connected
    // await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 