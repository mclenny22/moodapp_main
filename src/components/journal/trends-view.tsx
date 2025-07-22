'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getSentimentColor } from '@/lib/sentiment-utils'

// Mock data for trends
const mockTrends = {
  averageSentiment: 2.1,
  totalEntries: 15,
  commonTags: [
    { tag: 'gratitude', count: 8 },
    { tag: 'work', count: 6 },
    { tag: 'family', count: 5 },
    { tag: 'stress', count: 4 },
    { tag: 'anxiety', count: 3 },
    { tag: 'joy', count: 3 }
  ],
  recentSentiments: [2.1, -1.5, 3.2, 0.8, 4.1, -0.5, 2.8]
}

export function TrendsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mood Trends</h2>
        <Badge variant="secondary">{mockTrends.totalEntries} entries</Badge>
      </div>

      {/* Average Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle>Average Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-3xl font-bold ${getSentimentColor(mockTrends.averageSentiment)}`}>
              {mockTrends.averageSentiment.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              Last 30 days
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {mockTrends.averageSentiment > 0 ? 'Overall positive' : 'Overall neutral'}
          </div>
        </CardContent>
      </Card>

      {/* Recent Mood Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-20 mb-2">
            {mockTrends.recentSentiments.map((sentiment, index) => (
              <div
                key={index}
                className="flex-1 mx-1 bg-muted rounded-t"
                style={{
                  height: `${((sentiment + 5) / 10) * 100}%`,
                  backgroundColor: sentiment < -1 ? '#3b82f6' : sentiment > 1 ? '#22c55e' : '#6b7280'
                }}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Last 7 days
          </div>
        </CardContent>
      </Card>

      {/* Common Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Common Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTrends.commonTags.map(({ tag, count }) => (
              <div key={tag} className="flex items-center justify-between">
                <Badge variant="outline">{tag}</Badge>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(count / mockTrends.commonTags[0].count) * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very Negative (-5 to -3)</span>
              <Badge variant="outline" className="text-blue-600">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Negative (-3 to -1)</span>
              <Badge variant="outline" className="text-blue-600">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Neutral (-1 to +1)</span>
              <Badge variant="outline" className="text-gray-600">4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Positive (+1 to +3)</span>
              <Badge variant="outline" className="text-green-600">4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Very Positive (+3 to +5)</span>
              <Badge variant="outline" className="text-green-600">2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 