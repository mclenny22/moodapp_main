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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.slice().reverse().map(entry => (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="border-current"
                  style={{
                    background: getSentimentGradientColor(entry.sentiment_score),
                    color: '#fff',
                  }}
                >
                  {entry.sentiment_score}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground mb-3">
                  {entry.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 