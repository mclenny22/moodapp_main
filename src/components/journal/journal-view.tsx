'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getSentimentGradientColor } from '@/lib/sentiment-utils'
import { useAuth } from '@/lib/auth-context'
import { getJournalEntries, getDemoJournalEntries, JournalEntry } from '@/lib/database'

export function JournalView() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  const formatWeekday = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const handleCardClick = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedEntry(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Journal Entries</h2>
          <Badge variant="secondary" className="h-5 min-w-5">Loading...</Badge>
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
          <Badge variant="secondary" className="h-5 min-w-5">{entries.length} entries</Badge>
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
        <h2 className="text-xl font-semibold">Journal Entries</h2>
        <Badge variant="secondary">{entries.length} entries</Badge>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">No journal entries yet</p>
          <p className="text-xs text-muted-foreground">Start writing in the Today tab to see your entries here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.slice().reverse().map((entry) => (
            <Card 
              key={entry.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick(entry)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </p>
                    <CardTitle className="text-lg">
                      {formatWeekday(entry.date)}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant="outline"
                    className="h-5 min-w-5 tabular-nums"
                    style={{ 
                      color: getSentimentGradientColor(entry.sentiment_score),
                      borderColor: getSentimentGradientColor(entry.sentiment_score)
                    }}
                  >
                    {entry.sentiment_score > 0 ? '+' : ''}{entry.sentiment_score.toFixed(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  {entry.summary}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Entry Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          {selectedEntry && (
            <div className="space-y-2">
              {/* Date */}
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedEntry.date)}
              </p>
              
              {/* Headline */}
              <DialogTitle className="text-2xl font-bold">
                {formatWeekday(selectedEntry.date)}&apos;s Journal Entry
              </DialogTitle>
              
              {/* Badges Row */}
              <div className="flex gap-2">
                <Badge 
                  variant="outline"
                  className="h-5 min-w-5 tabular-nums"
                  style={{ 
                    color: getSentimentGradientColor(selectedEntry.sentiment_score),
                    borderColor: getSentimentGradientColor(selectedEntry.sentiment_score)
                  }}
                >
                  {selectedEntry.sentiment_score > 0 ? '+' : ''}{selectedEntry.sentiment_score.toFixed(1)}
                </Badge>
                  {selectedEntry.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="h-5 min-w-5">
                      {tag}
                    </Badge>
                  ))}
              </div>
              
              {/* Content Area */}
              <div className="whitespace-pre-wrap leading-relaxed text-base">
                {selectedEntry.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 