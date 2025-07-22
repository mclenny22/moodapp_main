'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSentimentColor, getSentimentBackgroundColor, formatSentimentScore } from '@/lib/sentiment-utils'
import { useAuth } from '@/lib/auth-context'
import { getJournalEntries, JournalEntry } from '@/lib/database'

export function JournalView() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user])

  const loadEntries = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const userEntries = await getJournalEntries(user.id)
      setEntries(userEntries)
    } catch (err) {
      console.error('Error loading entries:', err)
      setError('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

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
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card 
              key={entry.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${getSentimentBackgroundColor(entry.sentiment_score)}`}
              onClick={() => setSelectedEntry(entry)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    {entry.memory_weight >= 7 && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        ⭐ Memorable
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getSentimentColor(entry.sentiment_score)} border-current`}
                  >
                    {formatSentimentScore(entry.sentiment_score)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base text-muted-foreground mb-3 line-clamp-2">
                  {entry.summary}
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

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getSentimentColor(selectedEntry.sentiment_score)}`}>
                  {formatSentimentScore(selectedEntry.sentiment_score)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={selectedEntry.memory_weight >= 7 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}>
                    Memory: {selectedEntry.memory_weight}/10
                    {selectedEntry.memory_weight >= 7 && " ⭐"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{selectedEntry.summary}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Entry</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 