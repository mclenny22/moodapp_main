'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { getSentimentGradientColor } from '@/lib/sentiment-utils'
import { useAuth } from '@/lib/auth-context'
import { getJournalEntries, getDemoJournalEntries, JournalEntry } from '@/lib/database'
import { Button } from '@/components/ui/button'

interface ChartDataPoint {
  date: string
  mood: number
  entries: number
}

interface LifeAreaAnalysis {
  tag: string
  avgMood: number
  count: number
  percentageOfEntries: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export function TrendsView() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [averageSentiment, setAverageSentiment] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const [trendDirection, setTrendDirection] = useState<'up' | 'down' | 'stable'>('stable')
  const [trendPercentage, setTrendPercentage] = useState(0)
  const [volatility, setVolatility] = useState(0)
  const [volatilityTrend, setVolatilityTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const [volatilityTrendPercentage, setVolatilityTrendPercentage] = useState(0)
  const [lifeAreaAnalysis, setLifeAreaAnalysis] = useState<LifeAreaAnalysis[]>([])

  const loadTrendsData = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      let entries: JournalEntry[]
      if (user.id === 'demo-user') {
        entries = getDemoJournalEntries()
      } else {
        entries = await getJournalEntries(user.id)
      }

      // Always use 90 days
      const days = 90
      let endDate: Date
      let startDate: Date
      
      if (user.id === 'demo-user') {
        // For demo user, use a fixed date range that includes the demo data
        endDate = new Date('2025-09-23')
        startDate = new Date('2025-04-15')
      } else {
        endDate = new Date()
        startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
      }

      // Filter entries for the selected period
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= startDate && entryDate <= endDate
      })

      console.log('Filtered entries count:', filteredEntries.length)
      console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString())
      
      // Debug: Log all entries and their tags
      console.log('All filtered entries with tags:')
      filteredEntries.forEach(entry => {
        console.log(`Entry ${entry.date}: tags=${JSON.stringify(entry.tags)}, sentiment=${entry.sentiment_score}`)
      })

      // Group entries by date and calculate average mood per day
      const entriesByDate = new Map<string, { total: number; count: number }>()
      
      filteredEntries.forEach(entry => {
        const date = entry.date
        const current = entriesByDate.get(date) || { total: 0, count: 0 }
        entriesByDate.set(date, {
          total: current.total + entry.sentiment_score,
          count: current.count + 1
        })
      })

      // Create chart data - only include days with actual entries
      const data: ChartDataPoint[] = []
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dayData = entriesByDate.get(dateStr)
        
        if (dayData) {
          data.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            mood: Math.round((dayData.total / dayData.count) * 10) / 10,
            entries: dayData.count
          })
        }
      }

      // Calculate overall stats
      const moods = filteredEntries.map(entry => entry.sentiment_score)
      const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0

      // Calculate volatility (standard deviation)
      const volatilityValue = moods.length > 1 ? 
        Math.sqrt(moods.reduce((sum, mood) => sum + Math.pow(mood - avgMood, 2), 0) / (moods.length - 1)) : 0

      // Calculate trend (compare first half vs second half of the period)
      const sortedFilteredEntries = filteredEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const midPoint = Math.floor(sortedFilteredEntries.length / 2)
      const firstHalf = sortedFilteredEntries.slice(0, midPoint)
      const secondHalf = sortedFilteredEntries.slice(midPoint)
      
      const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, entry) => sum + entry.sentiment_score, 0) / firstHalf.length : 0
      const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, entry) => sum + entry.sentiment_score, 0) / secondHalf.length : 0
      
      const trendDiff = secondHalfAvg - firstHalfAvg
      const trendPercent = firstHalfAvg !== 0 ? (trendDiff / Math.abs(firstHalfAvg)) * 100 : 0
      
      setTrendDirection(trendDiff > 0.5 ? 'up' : trendDiff < -0.5 ? 'down' : 'stable')
      setTrendPercentage(Math.abs(trendPercent))

      // Calculate volatility trend
      const firstHalfMoods = firstHalf.map(entry => entry.sentiment_score)
      const secondHalfMoods = secondHalf.map(entry => entry.sentiment_score)
      
      const firstHalfAvgMood = firstHalfMoods.length > 0 ? firstHalfMoods.reduce((a, b) => a + b, 0) / firstHalfMoods.length : 0
      const secondHalfAvgMood = secondHalfMoods.length > 0 ? secondHalfMoods.reduce((a, b) => a + b, 0) / secondHalfMoods.length : 0
      
      const firstHalfVolatility = firstHalfMoods.length > 1 ? 
        Math.sqrt(firstHalfMoods.reduce((sum, mood) => sum + Math.pow(mood - firstHalfAvgMood, 2), 0) / (firstHalfMoods.length - 1)) : 0
      const secondHalfVolatility = secondHalfMoods.length > 1 ? 
        Math.sqrt(secondHalfMoods.reduce((sum, mood) => sum + Math.pow(mood - secondHalfAvgMood, 2), 0) / (secondHalfMoods.length - 1)) : 0
      
      const volatilityDiff = secondHalfVolatility - firstHalfVolatility
      const volatilityTrendPercent = firstHalfVolatility !== 0 ? (volatilityDiff / Math.abs(firstHalfVolatility)) * 100 : 0
      
      setVolatilityTrend(volatilityDiff > 0.1 ? 'up' : volatilityDiff < -0.1 ? 'down' : 'stable')
      setVolatilityTrendPercentage(Math.abs(volatilityTrendPercent))

      // Calculate life area analysis
      const lifeAreaData: { [key: string]: { total: number; count: number; entries: JournalEntry[] } } = {}
      
      filteredEntries.forEach(entry => {
        if (entry.tags && entry.tags.length > 0) {
          entry.tags.forEach(tag => {
            if (!lifeAreaData[tag]) {
              lifeAreaData[tag] = { total: 0, count: 0, entries: [] }
            }
            lifeAreaData[tag].total += entry.sentiment_score
            lifeAreaData[tag].count += 1
            lifeAreaData[tag].entries.push(entry)
          })
        }
      })

      console.log('Life area data before processing:', lifeAreaData)

      const lifeAreaAnalysisData: LifeAreaAnalysis[] = Object.entries(lifeAreaData)
        .map(([tag, data]) => {
          const avgMood = Math.round((data.total / data.count) * 10) / 10
          const percentageOfEntries = Math.round((data.count / filteredEntries.length) * 100)
          
          // Calculate trend for this life area using actual entry dates
          const sortedEntries = data.entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          const midPoint = Math.floor(sortedEntries.length / 2)
          const firstHalf = sortedEntries.slice(0, midPoint)
          const secondHalf = sortedEntries.slice(midPoint)
          
          const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, entry) => sum + entry.sentiment_score, 0) / firstHalf.length : 0
          const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, entry) => sum + entry.sentiment_score, 0) / secondHalf.length : 0
          
          const trendDiff = secondHalfAvg - firstHalfAvg
          const trendPercent = firstHalfAvg !== 0 ? (trendDiff / Math.abs(firstHalfAvg)) * 100 : 0
          
          const trend: 'up' | 'down' | 'stable' = trendDiff > 0.3 ? 'up' : trendDiff < -0.3 ? 'down' : 'stable'
          
          console.log(`Life area ${tag}: avg=${avgMood}, count=${data.count}, percentage=${percentageOfEntries}%, trend=${trend}`)
          
          return {
            tag,
            avgMood,
            count: data.count,
            percentageOfEntries,
            trend,
            trendPercentage: Math.abs(trendPercent)
          }
        })
        .filter(item => item.count >= 1) // Show life areas that appear at least once
        .sort((a, b) => b.count - a.count) // Sort by frequency

      setAverageSentiment(Math.round(avgMood * 10) / 10)
      setVolatility(Math.round(volatilityValue * 10) / 10)
      setLifeAreaAnalysis(lifeAreaAnalysisData)
      setTotalEntries(filteredEntries.length)
      
    } catch (err) {
      console.error('Error loading trends data:', err)
      setError('Failed to load trends data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadTrendsData()
    }
  }, [user, loadTrendsData])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Mood Insights</h2>
          <Badge variant="secondary" className="h-5 min-w-5">Loading...</Badge>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Mood Insights</h2>
          <Badge variant="secondary" className="h-5 min-w-5">{totalEntries} entries</Badge>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={loadTrendsData} variant="outline" size="sm">
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
        <h2 className="text-xl font-semibold">Your Mood Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Average Sentiment Card */}
        <div className="box-border content-stretch flex flex-col items-start justify-between p-[25px] relative rounded-[25px] w-full font-sans min-h-[200px]">
          {/* Card Border */}
          <div
            aria-hidden="true"
            className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
          />
          
          {/* Header Section */}
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
            <div className="box-border content-stretch flex flex-row gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
              <div className="basis-0 font-sans font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left">
                <p className="block leading-[normal]">Average Sentiment</p>
              </div>
              <div className="relative rounded-[23px] shrink-0">
                <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                  <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--high-score)] text-[12px] text-center text-nowrap">
                    <p className="block leading-[normal] whitespace-pre">
                      {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}{trendPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute border border-[var(--high-score)] border-solid inset-0 pointer-events-none rounded-[23px]"
                />
              </div>
            </div>
            
            {/* Sentiment Score */}
            <div 
              className="font-sans font-medium leading-[0] not-italic relative shrink-0 text-[60px] text-left w-full"
              style={{ color: getSentimentGradientColor(averageSentiment) }}
            >
              <p className="block leading-[60px]">{averageSentiment < 0 ? '-' : ''}{Math.abs(averageSentiment).toFixed(1)}</p>
            </div>
          </div>
          
          {/* Encouraging Text */}
          <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--base-text)] text-[14px] text-left w-full">
            <p className="block leading-[normal]">
              {trendDirection === 'up' 
                ? "Your average mood is up this week. Good on ya! " 
                : trendDirection === 'down' 
                ? "Looks like you're a bit down lately. Sorry bud!" 
                : "You seem to be in a good place. Keep it up!"
              }
            </p>
          </div>
        </div>

        {/* Mood Volatility Card */}
        <div className="box-border content-stretch flex flex-col items-start justify-between p-[25px] relative rounded-[25px] w-full font-sans min-h-[200px]">
          {/* Card Border */}
          <div
            aria-hidden="true"
            className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
          />
          
          {/* Header Section */}
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
            <div className="box-border content-stretch flex flex-row gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
              <div className="basis-0 font-sans font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left">
                <p className="block leading-[normal]">Mood Volatility</p>
              </div>
              {volatilityTrend !== 'stable' && (
                <div className="relative rounded-[14px] shrink-0">
                  <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                    <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                      <p className="block leading-[normal] whitespace-pre">
                        {volatilityTrend === 'up' ? '+' : '-'}{volatilityTrendPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[14px]"
                  />
                </div>
              )}
            </div>
            
            {/* Volatility Score */}
            <div className="font-sans font-medium leading-[0] not-italic relative shrink-0 text-[var(--high-score)] text-[60px] text-left w-full">
              <p className="block leading-[60px]">{volatility.toFixed(1)}</p>
            </div>
          </div>
          
          {/* Encouraging Text */}
          <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--base-text)] text-[14px] text-left w-full">
            <p className="block leading-[normal]">
              {volatilityTrend === 'up' 
                ? "Looks like you had quite an emotional rollercoaster this week."
                : volatilityTrend === 'down' 
                ? "Your mood's been pretty steady lately. Nice work!"
                : volatility < 1.0
                ? "Your emotions are pretty stable. You're doing great!"
                : volatility < 2.0
                ? "You've got some ups and downs, but that's totally normal."
                : "You've been on quite the emotional journey. Hang in there!"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Emotional Balance Sheet Card */}
      <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-[25px] relative rounded-[25px] w-full font-sans">
        {/* Card Border */}
        <div
          aria-hidden="true"
          className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
        />
        
        {/* Header Section */}
        <div className="box-border content-stretch flex flex-col font-sans font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
          <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[18px]">
            <p className="block leading-[normal]">Emotional Balance Sheet</p>
          </div>
          <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
            <p className="block leading-[normal] whitespace-pre">
              How do you feel about the parts of my life that matter most?
            </p>
          </div>
        </div>
        
        {/* Life Areas */}
        <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full">
          {lifeAreaAnalysis.length > 0 ? (
            lifeAreaAnalysis.map((item, index) => (
              <div key={item.tag} className="w-full">
                {/* Life Area Row */}
                <div className="box-border content-stretch flex flex-row items-center justify-between py-[15px] px-0 relative shrink-0 w-full">
                  {/* Life Area Name */}
                  <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--base-text)] text-[16px] text-left text-nowrap">
                    <p className="block leading-[normal] whitespace-pre">{item.tag}</p>
                  </div>
                  
                  {/* Metrics */}
                  <div className="box-border content-stretch flex flex-row gap-[9px] items-center justify-end p-0 relative shrink-0">
                    {/* Percentage of entries */}
                    <div className="relative rounded-[14px] shrink-0">
                      <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                        <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                          <p className="block leading-[normal] whitespace-pre">
                            {item.percentageOfEntries}% of entries
                          </p>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[14px]"
                      />
                    </div>
                    
                    {/* Trend percentage */}
                    <div className="relative rounded-[14px] shrink-0">
                      <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                        <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                          <p className="block leading-[normal] whitespace-pre">
                            {item.trend === 'up' ? '+' : item.trend === 'down' ? '-' : ''}{item.trendPercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[14px]"
                      />
                    </div>
                    
                    {/* Average mood */}
                    <div className="relative rounded-[23px] shrink-0">
                      <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                        <div 
                          className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap"
                          style={{ color: getSentimentGradientColor(item.avgMood) }}
                        >
                          <p className="block leading-[normal] whitespace-pre">{item.avgMood < 0 ? '-' : ''}{Math.abs(item.avgMood).toFixed(1)}</p>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute border-solid inset-0 pointer-events-none rounded-[23px]"
                        style={{ borderColor: getSentimentGradientColor(item.avgMood) }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Separator - only show if not the last item */}
                {index < lifeAreaAnalysis.length - 1 && (
                  <div className="h-[15px] relative shrink-0 w-full flex items-center">
                    <div className="w-full border-b border-[var(--card-border)]"></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Loading skeletons
            <>
              <div className="w-full">
                <div className="box-border content-stretch flex flex-row items-center justify-between py-[15px] px-0 relative shrink-0 w-full">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex items-center gap-[9px]">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
              <div className="h-[15px] relative shrink-0 w-full flex items-center">
                <div className="w-full border-b border-[var(--card-border)]"></div>
              </div>
              <div className="w-full">
                <div className="box-border content-stretch flex flex-row items-center justify-between py-[15px] px-0 relative shrink-0 w-full">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex items-center gap-[9px]">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-10" />
                  </div>
                </div>
              </div>
              <div className="h-[15px] relative shrink-0 w-full flex items-center">
                <div className="w-full border-b border-[var(--card-border)]"></div>
              </div>
              <div className="w-full">
                <div className="box-border content-stretch flex flex-row items-center justify-between py-[15px] px-0 relative shrink-0 w-full">
                  <Skeleton className="h-6 w-28" />
                  <div className="flex items-center gap-[9px]">
                    <Skeleton className="h-5 w-18" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-11" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>


    </div>
  )
} 