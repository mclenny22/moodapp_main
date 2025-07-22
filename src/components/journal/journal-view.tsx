'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSentimentColor, getSentimentBackgroundColor, formatSentimentScore } from '@/lib/sentiment-utils'

// Mock data for now
const mockEntries = [
  {
    id: '1',
    date: '2024-12-15',
    content: 'Feeling optimistic about the new project at work. The team is really coming together and I can see progress being made. Had a great conversation with my manager about career growth.',
    summary: 'Positive reflection on work progress and team dynamics',
    sentiment_score: 4.2,
    tags: ['gratitude', 'work', 'family'],
    memory_weight: 8
  },
  {
    id: '2',
    date: '2024-12-14',
    content: 'Struggling with deadlines and feeling overwhelmed. Need to find better ways to manage stress and prioritize tasks.',
    summary: 'Feeling stressed about work deadlines and time management',
    sentiment_score: -2.1,
    tags: ['stress', 'anxiety', 'deadlines'],
    memory_weight: 6
  },
  {
    id: '3',
    date: '2024-12-13',
    content: 'Had a nice dinner with family. Nothing particularly eventful but feeling content and grateful for these quiet moments.',
    summary: 'Peaceful family time and general contentment',
    sentiment_score: 1.8,
    tags: ['family', 'gratitude', 'contentment'],
    memory_weight: 4
  }
]

export function JournalView() {
  const [selectedEntry, setSelectedEntry] = useState<typeof mockEntries[0] | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Journal Entries</h2>
        <Badge variant="secondary">{mockEntries.length} entries</Badge>
      </div>
      
      <div className="space-y-3">
        {mockEntries.map((entry) => (
          <Card 
            key={entry.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${getSentimentBackgroundColor(entry.sentiment_score)}`}
            onClick={() => setSelectedEntry(entry)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </CardTitle>
                <span className={`text-lg font-bold ${getSentimentColor(entry.sentiment_score)}`}>
                  {formatSentimentScore(entry.sentiment_score)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {entry.summary}
              </p>
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entry Detail Modal - TODO: Implement with Sheet component */}
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
                <Badge variant="outline">
                  Memory: {selectedEntry.memory_weight}/10
                </Badge>
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