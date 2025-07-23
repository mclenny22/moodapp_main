'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSentimentColor } from '@/lib/sentiment-utils'
import { useAuth } from '@/lib/auth-context'
import { 
  getAverageSentiment, 
  getCommonTags, 
  getJournalEntriesByDateRange,
  JournalEntry 
} from '@/lib/database'
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

type TimePeriod = '7d' | '30d' | '1y'

export function TrendsView() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    averageSentiment: number
    totalEntries: number
    commonTags: { tag: string; count: number }[]
    recentSentiments: number[]
    labels: string[]
  }>({
    averageSentiment: 0,
    totalEntries: 0,
    commonTags: [],
    recentSentiments: [],
    labels: []
  })

  useEffect(() => {
    if (user) {
      loadTrendsData()
    }
  }, [user, selectedPeriod])

  const loadTrendsData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 365
      const averageSentiment = await getAverageSentiment(user.id, days)
      const commonTags = await getCommonTags(user.id)
      
      // Get entries for the selected period
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const entries = await getJournalEntriesByDateRange(user.id, startDate, endDate)
      
      // Prepare chart data
      let recentSentiments: number[] = []
      let labels: string[] = []
      
      if (selectedPeriod === '7d') {
        // Last 7 days
        recentSentiments = entries.slice(-7).map(entry => entry.sentiment_score)
        labels = entries.slice(-7).map(entry => 
          new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })
        )
      } else if (selectedPeriod === '30d') {
        // Last 30 days
        recentSentiments = entries.slice(-30).map(entry => entry.sentiment_score)
        labels = entries.slice(-30).map(entry => 
          new Date(entry.date).getDate().toString()
        )
      } else {
        // Last year - group by month
        const monthlyData = new Map<string, number[]>()
        entries.forEach(entry => {
          const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })
          if (!monthlyData.has(month)) {
            monthlyData.set(month, [])
          }
          monthlyData.get(month)!.push(entry.sentiment_score)
        })
        
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        recentSentiments = monthOrder
          .filter(month => monthlyData.has(month))
          .map(month => {
            const scores = monthlyData.get(month)!
            return scores.reduce((sum, score) => sum + score, 0) / scores.length
          })
        labels = monthOrder.filter(month => monthlyData.has(month))
      }
      
      setData({
        averageSentiment,
        totalEntries: entries.length,
        commonTags,
        recentSentiments,
        labels
      })
      
    } catch (err) {
      console.error('Error loading trends data:', err)
      setError('Failed to load trends data')
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '1y': return 'Last year'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mood Trends</h2>
          <Badge variant="secondary">Loading...</Badge>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading trends...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mood Trends</h2>
          <Badge variant="secondary">{data.totalEntries} entries</Badge>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button onClick={loadTrendsData} className="text-sm text-primary hover:underline">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mood Trends</h2>
        <Badge variant="secondary">{data.totalEntries} entries</Badge>
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
              <span className={`text-3xl font-bold ${getSentimentColor(data.averageSentiment)}`}>
                {data.averageSentiment.toFixed(1)}
              </span>
              <div className="text-sm text-muted-foreground">
                {data.averageSentiment > 0 ? 'Overall positive' : 'Overall neutral'} • {getPeriodLabel(selectedPeriod)}
              </div>
            </div>
          </div>

          {/* Mood Trend Chart */}
          {data.recentSentiments.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={data.labels.map((label, i) => ({ label, sentiment: data.recentSentiments[i] }))}
                  margin={{ top: 20, left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={false}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="rounded-md border bg-background p-2 text-xs shadow-md">
                          <div className="font-medium">{payload[0].payload.label}</div>
                          <div>Sentiment: <span className="font-bold">{payload[0].payload.sentiment.toFixed(1)}</span></div>
                        </div>
                      ) : null
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#222"
                    strokeWidth={2}
                    dot={{ r: 5, fill: '#000' }}
                    activeDot={{ r: 7, fill: '#000' }}
                  >
                    <LabelList
                      dataKey="sentiment"
                      position="top"
                      className="fill-foreground"
                      fontSize={12}
                      formatter={(value) =>
                        typeof value === 'number' ? value.toFixed(1) : value
                      }
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
              <div className="text-xs text-muted-foreground text-center">
                {getPeriodLabel(selectedPeriod)}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No data available for this period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Themes */}
      {data.commonTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.commonTags.map(({ tag, count }) => (
                <div key={tag} className="flex items-center justify-between">
                  <Badge variant="outline">{tag}</Badge>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(count / data.commonTags[0].count) * 100} 
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
      )}

      {/* Sentiment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 