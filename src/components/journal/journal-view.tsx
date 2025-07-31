'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getJournalEntries, getDemoJournalEntries, JournalEntry } from '@/lib/database'
import { JournalCard } from './JournalCard'

export function JournalView() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      let userEntries: JournalEntry[]
      if (user.id === 'demo-user') {
        userEntries = getDemoJournalEntries()
      } else {
        userEntries = await getJournalEntries(user.id)
      }
      setEntries(userEntries)
    } catch (err) {
      console.error('Error loading entries:', err)
      setError('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user, loadEntries])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--base-text)] font-sans">Journal Entries</h2>
          <div className="relative rounded-xl shrink-0">
            <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Loading...</p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--high-score)] mx-auto mb-4"></div>
            <p className="text-sm text-[var(--annotation)]">Loading entries...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--base-text)] font-sans">Journal Entries</h2>
          <div className="relative rounded-xl shrink-0">
            <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                <p className="block leading-[normal] whitespace-pre">{entries.length} entries</p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-xl"
            />
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={loadEntries} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--base-text)] font-sans">Journal Entries</h2>
        <div className="relative rounded-xl shrink-0">
          <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
            <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
              <p className="block leading-[normal] whitespace-pre">{entries.length} entries</p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--annotation)] mb-4">No journal entries yet</p>
          <p className="text-xs text-[var(--annotation)]">Start writing in the Today tab to see your entries here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
            <JournalCard 
              key={entry.id} 
              entry={entry}
            />
          ))}
        </div>
      )}
    </div>
  )
} 