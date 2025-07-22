'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TestSupabase() {
  const [status, setStatus] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  const testConnection = async () => {
    try {
      setStatus('Testing connection...')
      
      // Test basic connection
      const { data, error } = await supabase.from('entries').select('count').limit(1)
      
      if (error) {
        setStatus(`Connection error: ${error.message}`)
        return
      }
      
      setStatus('✅ Supabase connection successful!')
    } catch (err) {
      setStatus(`❌ Connection failed: ${err}`)
    }
  }

  const testAuth = async () => {
    try {
      setStatus('Testing authentication...')
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setStatus(`Auth error: ${error.message}`)
        return
      }
      
      if (user) {
        setUser(user)
        setStatus('✅ User authenticated!')
      } else {
        setStatus('ℹ️ No user logged in')
      }
    } catch (err) {
      setStatus(`❌ Auth failed: ${err}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={testConnection} variant="outline">
            Test Database Connection
          </Button>
          <Button onClick={testAuth} variant="outline">
            Test Authentication
          </Button>
        </div>
        
        {status && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{status}</p>
          </div>
        )}
        
        {user && (
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm font-medium">Logged in as:</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 