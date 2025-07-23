'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSentimentColor, getSentimentGradientColor } from '@/lib/sentiment-utils'
import { useAuth } from '@/lib/auth-context'
import { 
  getAverageSentiment, 
  getCommonTags, 
  getJournalEntriesByDateRange,
  JournalEntry 
} from '@/lib/database'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type TimePeriod = '7d' | '30d' | '1y'

interface DayData {
  date: string
  sentiment: number | null
  hasEntry: boolean
}

export function TrendsView() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    averageSentiment: number
    totalEntries: number
    commonTags: { tag: string; count: number }[]
    dayData: DayData[]
  }>({
    averageSentiment: 0,
    totalEntries: 0,
    commonTags: [],
    dayData: []
  })

  const loadTrendsData = useCallback(async () => {
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
      
      // Create a map of entries by date
      const entriesByDate = new Map<string, JournalEntry>()
      entries.forEach(entry => {
        entriesByDate.set(entry.date, entry)
      })
      
      // Generate day data for the entire period
      const dayData: DayData[] = []
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const entry = entriesByDate.get(dateStr)
        
        dayData.push({
          date: dateStr,
          sentiment: entry ? entry.sentiment_score : null,
          hasEntry: !!entry
        })
      }
      
      setData({
        averageSentiment,
        totalEntries: entries.length,
        commonTags,
        dayData
      })
      
    } catch (err) {
      console.error('Error loading trends data:', err)
      setError('Failed to load trends data')
    } finally {
      setLoading(false)
    }
  }, [user, selectedPeriod])

  useEffect(() => {
    if (user) {
      if (user.id === 'demo-user') {
        // Demo/test data for trends
        let demoDayData: DayData[]
        
        if (selectedPeriod === '7d') {
          demoDayData = [
            { date: '2024-01-01', sentiment: 3, hasEntry: true },
            { date: '2024-01-02', sentiment: 5, hasEntry: true },
            { date: '2024-01-03', sentiment: 2, hasEntry: true },
            { date: '2024-01-04', sentiment: 4, hasEntry: true },
            { date: '2024-01-05', sentiment: 1, hasEntry: true },
            { date: '2024-01-06', sentiment: null, hasEntry: false },
            { date: '2024-01-07', sentiment: 5, hasEntry: true },
          ]
        } else if (selectedPeriod === '30d') {
          demoDayData = Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            const dateStr = date.toISOString().split('T')[0]
            const hasEntry = Math.random() > 0.3 // 70% chance of having an entry
            return {
              date: dateStr,
              sentiment: hasEntry ? Math.floor(Math.random() * 11) - 5 : null,
              hasEntry
            }
          })
        } else {
          // 1y - generate data for the past year
          demoDayData = []
          const today = new Date()
          for (let i = 364; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const hasEntry = Math.random() > 0.4 // 60% chance of having an entry
            demoDayData.push({
              date: dateStr,
              sentiment: hasEntry ? Math.floor(Math.random() * 11) - 5 : null,
              hasEntry
            })
          }
        }
        
        const sentiments = demoDayData.filter(day => day.hasEntry).map(day => day.sentiment!)
        
        setData({
          averageSentiment: sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0,
          totalEntries: sentiments.length,
          commonTags: [
            { tag: 'work', count: 12 },
            { tag: 'family', count: 8 },
            { tag: 'health', count: 5 },
            { tag: 'gratitude', count: 4 },
            { tag: 'stress', count: 3 },
          ],
          dayData: demoDayData,
        })
        setLoading(false)
        setError(null)
        return
      }
      loadTrendsData()
    }
  }, [user, selectedPeriod, loadTrendsData])

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '1y': return 'Last year'
    }
  }

  const renderContributionGrid = () => {
    // Always 7 columns for days of the week, fill card width
    const cols = 7;
    const total = data.dayData.length;
    const rows = Math.ceil(total / cols);
    // Fill grid with empty cells if needed
    const filledDayData = Array(rows * cols - total).fill(null).concat(data.dayData);
    // Split into rows
    const gridRows: (typeof data.dayData)[] = [];
    for (let i = 0; i < rows; i++) {
      gridRows.push(filledDayData.slice(i * cols, (i + 1) * cols));
    }
    // Render from bottom to top
    return (
      <div className="grid grid-cols-7 gap-5 w-full">
        {gridRows.reverse().flat().map((day, idx) => (
          day ? (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={`aspect-square w-full rounded-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer`}
                  style={{ background: day.hasEntry ? getSentimentGradientColor(day.sentiment!) : '#ededed' }}
                >
                  {day.hasEntry && (
                    <span className="text-xs font-medium text-foreground">
                      {day.sentiment}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div key={idx} />
          )
        ))}
      </div>
    )
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

      {/* Combined Average Sentiment and Contribution Grid */}
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

          {/* Contribution Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Mood Activity</h3>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              {renderContributionGrid()}
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              {getPeriodLabel(selectedPeriod)}
            </div>
          </div>
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
    </div>
  )
} 