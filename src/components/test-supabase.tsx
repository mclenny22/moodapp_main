'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TestResult {
  success: boolean
  error?: string
  data?: unknown
  user?: unknown
  count?: number
}

interface TestResults {
  connection?: TestResult
  auth?: TestResult
  tableAccess?: TestResult
}

export function TestSupabase() {
  const [status, setStatus] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [testResults, setTestResults] = useState<TestResults>({})
  const supabase = createClient()

  const testConnection = async () => {
    try {
      setStatus('Testing database connection...')
      
      // Test basic connection
      const { data, error } = await supabase.from('entries').select('count').limit(1)
      
      if (error) {
        setTestResults(prev => ({ ...prev, connection: { success: false, error: error.message } }))
        setStatus(`❌ Database connection failed: ${error.message}`)
        return
      }
      
      setTestResults(prev => ({ ...prev, connection: { success: true, data } }))
      setStatus('✅ Database connection successful!')
    } catch (err) {
      setTestResults(prev => ({ ...prev, connection: { success: false, error: String(err) } }))
      setStatus(`❌ Connection failed: ${err}`)
    }
  }

  const testAuth = async () => {
    try {
      setStatus('Testing authentication...')
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setTestResults(prev => ({ ...prev, auth: { success: false, error: error.message } }))
        setStatus(`❌ Auth error: ${error.message}`)
        return
      }
      
      if (user) {
        setUser(user)
        setTestResults(prev => ({ ...prev, auth: { success: true, user } }))
        setStatus('✅ User authenticated!')
      } else {
        setTestResults(prev => ({ ...prev, auth: { success: false, error: 'No user logged in' } }))
        setStatus('ℹ️ No user logged in')
      }
    } catch (err) {
      setTestResults(prev => ({ ...prev, auth: { success: false, error: String(err) } }))
      setStatus(`❌ Auth failed: ${err}`)
    }
  }

  const testTableAccess = async () => {
    try {
      setStatus('Testing table access...')
      
      // Test if we can query the entries table
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .limit(1)
      
      if (error) {
        setTestResults(prev => ({ ...prev, tableAccess: { success: false, error: error.message } }))
        setStatus(`❌ Table access failed: ${error.message}`)
        return
      }
      
      setTestResults(prev => ({ ...prev, tableAccess: { success: true, count: data?.length || 0 } }))
      setStatus('✅ Table access successful!')
    } catch (err) {
      setTestResults(prev => ({ ...prev, tableAccess: { success: false, error: String(err) } }))
      setStatus(`❌ Table access failed: ${err}`)
    }
  }

  const clearResults = () => {
    setStatus('')
    setTestResults({})
    setUser(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Database
          </Button>
          <Button onClick={testAuth} variant="outline" size="sm">
            Test Auth
          </Button>
          <Button onClick={testTableAccess} variant="outline" size="sm">
            Test Table Access
          </Button>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
        </div>
        
        {status && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{status}</p>
          </div>
        )}
        
        {user && (
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm font-medium text-green-800">Logged in as:</p>
            <p className="text-sm text-green-700">{user.email}</p>
            <p className="text-xs text-green-600">ID: {user.id}</p>
          </div>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="text-sm font-medium">Test Results:</h4>
            
            {testResults.connection && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <Badge variant={testResults.connection.success ? "default" : "destructive"}>
                  {testResults.connection.success ? "✅ Success" : "❌ Failed"}
                </Badge>
              </div>
            )}
            
            {testResults.auth && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant={testResults.auth.success ? "default" : "secondary"}>
                  {testResults.auth.success ? "✅ Authenticated" : "❌ Not Authenticated"}
                </Badge>
              </div>
            )}
            
            {testResults.tableAccess && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Table Access</span>
                <Badge variant={testResults.tableAccess.success ? "default" : "destructive"}>
                  {testResults.tableAccess.success ? "✅ Success" : "❌ Failed"}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 