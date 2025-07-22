'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSentimentColor } from '@/lib/sentiment-utils'

// Mock data for trends with different time periods
const mockTrends = {
  totalEntries: 15,
  commonTags: [
    { tag: 'gratitude', count: 8 },
    { tag: 'work', count: 6 },
    { tag: 'family', count: 5 },
    { tag: 'stress', count: 4 },
    { tag: 'anxiety', count: 3 },
    { tag: 'joy', count: 3 }
  ],
  // Different data for different time periods
  periodData: {
    '7d': {
      averageSentiment: 2.8,
      sentiments: [2.1, -1.5, 3.2, 0.8, 4.1, -0.5, 2.8],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    '30d': {
      averageSentiment: 2.1,
      sentiments: [2.1, -1.5, 3.2, 0.8, 4.1, -0.5, 2.8, 1.9, 3.5, -0.2, 2.3, 1.7, 4.0, -1.1, 2.9, 0.5, 3.1, -0.8, 2.6, 1.3, 3.8, -0.3, 2.4, 1.8, 3.3, -0.6, 2.7, 1.5, 3.6, -0.1],
      labels: Array.from({length: 30}, (_, i) => `${i + 1}`)
    },
    '1y': {
      averageSentiment: 1.9,
      sentiments: [2.1, 1.8, 2.3, 1.5, 2.0, 1.9, 2.2, 1.7, 2.1, 1.6, 2.0, 1.8],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  }
}

type TimePeriod = '7d' | '30d' | '1y'

export function TrendsView() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '1y': return 'Last year'
    }
  }

  const currentData = mockTrends.periodData[selectedPeriod]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mood Trends</h2>
        <Badge variant="secondary">{mockTrends.totalEntries} entries</Badge>
      </div>

      {/* Combined Average Sentiment and Mood Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mood Overview</CardTitle>
            
            {/* Desktop: Tabs */}
            <div className="hidden md:block">
              <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="7d">7D</TabsTrigger>
                  <TabsTrigger value="30d">30D</TabsTrigger>
                  <TabsTrigger value="1y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Mobile: Dropdown */}
            <div className="md:hidden">
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Sentiment */}
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-3xl font-bold ${getSentimentColor(currentData.averageSentiment)}`}>
                {currentData.averageSentiment.toFixed(1)}
              </span>
              <div className="text-sm text-muted-foreground">
                {currentData.averageSentiment > 0 ? 'Overall positive' : 'Overall neutral'} • {getPeriodLabel(selectedPeriod)}
              </div>
            </div>
          </div>

          {/* Mood Trend Chart */}
          <div>
            <div className="flex items-end justify-between h-20 mb-2">
              {currentData.sentiments.map((sentiment, index) => (
                <div
                  key={index}
                  className="flex-1 mx-0.5 bg-muted rounded-t"
                  style={{
                    height: `${((sentiment + 5) / 10) * 100}%`,
                    backgroundColor: sentiment < -1 ? '#3b82f6' : sentiment > 1 ? '#22c55e' : '#6b7280'
                  }}
                  title={`${currentData.labels[index]}: ${sentiment.toFixed(1)}`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {getPeriodLabel(selectedPeriod)}
            </div>
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