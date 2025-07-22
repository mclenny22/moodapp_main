'use client'

import { useState } from 'react'
// import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // TODO: Uncomment when Supabase is connected
    setError('Authentication not yet connected. Use Demo Login for testing.')
    setLoading(false)
    
    // try {
    //   const { error } = await supabase.auth.signInWithPassword({
    //     email,
    //     password,
    //   })

    //   if (error) {
    //     setError(error.message)
    //   } else {
    //     setMessage('Signed in successfully!')
    //     // Redirect or refresh to update auth state
    //     window.location.reload()
    //   }
    // } catch {
    //   setError('An unexpected error occurred')
    // } finally {
    //   setLoading(false)
    // }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // TODO: Uncomment when Supabase is connected
    setError('Authentication not yet connected. Use Demo Login for testing.')
    setLoading(false)
    
    // try {
    //   const { error } = await supabase.auth.signUp({
    //     email,
    //     password,
    //   })

    //   if (error) {
    //     setError(error.message)
    //   } else {
    //     setMessage('Check your email for the confirmation link!')
    //     // For sign up, we don't auto-refresh since they need to confirm email
    //   }
    // } catch {
    //   setError('An unexpected error occurred')
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 