'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSentimentGradientColor } from '@/lib/sentiment-utils'
import { useAuth } from '@/lib/auth-context'
import { getJournalEntries, getDemoJournalEntries, JournalEntry } from '@/lib/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JournalGrid } from './JournalGrid';

export function JournalView() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
          <h2 className="text-xl font-semibold">Journal Entries</h2>
          <Badge variant="secondary">Loading...</Badge>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading entries...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Journal Entries</h2>
          <Badge variant="secondary">{entries.length} entries</Badge>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadEntries} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Journal Entries</h2>
        <Badge variant="secondary">{entries.length} entries</Badge>
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">No journal entries yet</p>
          <p className="text-xs text-muted-foreground">Start writing in the Today tab to see your entries here</p>
        </div>
      ) : (
        <JournalGrid
          entries={entries}
          onEntryClick={entry => {
            setSelectedEntry(entry);
            setDialogOpen(true);
          }}
        />
      )}
      {/* Dialog logic remains unchanged */}
      {selectedEntry && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              <p className="text-base text-muted-foreground mb-3">
                {selectedEntry.content}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedEntry.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`border-current`}
                style={{
                  background: getSentimentGradientColor(selectedEntry.sentiment_score),
                  color: '#fff',
                }}
              >
                {selectedEntry.sentiment_score}
              </Badge>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 