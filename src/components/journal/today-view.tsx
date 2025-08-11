'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2Icon } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { createJournalEntry, getTodaysEntry, updateJournalEntry, JournalEntry } from '@/lib/database'
import { getSentimentGradientColor } from '@/lib/sentiment-utils'
import { toast } from "sonner"

import { Skeleton } from '@/components/ui/skeleton'

export function TodayView({ userName }: { userName?: string }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null)
  const [showSuccessState, setShowSuccessState] = useState(false)
  const [todaysEntry, setTodaysEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const checkTodaysEntry = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const entry = await getTodaysEntry(user.id)
      setTodaysEntry(entry)
      
      if (entry) {
        console.log('Today\'s entry:', entry)
        console.log('Reflection prompt from DB:', entry.reflection_prompt)
        console.log('Summary from DB:', entry.summary)
        setReflectionPrompt(entry.reflection_prompt || entry.summary) // Use stored reflection prompt or fallback to summary
      }
    } catch (error) {
      console.error('Error checking today\'s entry:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      checkTodaysEntry()
    }
  }, [user, checkTodaysEntry])

  // Show toast on success
  useEffect(() => {
    if (showSuccessState) {
      toast.success("Success! Your entry was analyzed.", {
        description: "Head over to the Trends page to learn more.",
        icon: <CheckCircle2Icon className="text-green-600" />,
        duration: 6000,
      })
      setShowSuccessState(false)
    }
  }, [showSuccessState])

  const handleEditClick = () => {
    if (todaysEntry) {
      setEditContent(todaysEntry.content)
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !user || !todaysEntry) return
    
    setIsUpdating(true)
    setError(null)
    
    try {
      // Analyze sentiment with OpenAI
      const sentimentResponse = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (!sentimentResponse.ok) {
        const errorData = await sentimentResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${sentimentResponse.status}: Failed to analyze sentiment`)
      }

      const analysis = await sentimentResponse.json()
      
      // Generate new reflection prompt first
      const reflectionResponse = await fetch('/api/reflection-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (reflectionResponse.ok) {
        const responseData = await reflectionResponse.json()
        console.log('Reflection API response:', responseData)
        const { reflectionPrompt: prompt } = responseData
        setReflectionPrompt(prompt)
        analysis.reflection_prompt = prompt
        console.log('Generated reflection prompt for edit:', prompt)
        console.log('Analysis object with reflection prompt:', analysis)
      } else {
        const errorData = await reflectionResponse.json().catch(() => ({}))
        console.error('Reflection API failed:', reflectionResponse.status, reflectionResponse.statusText, errorData.error)
        // Continue without reflection prompt rather than failing completely
      }
      
      // Update the entry in database with complete analysis
      const updatedEntry = await updateJournalEntry(todaysEntry.id, user.id, editContent, analysis)
      
      if (!updatedEntry) {
        throw new Error('Failed to update entry')
      }
      
      // Update local state
      setTodaysEntry(updatedEntry)
      setShowEditModal(false)
      setShowSuccessState(true)
      
    } catch (error) {
      console.error('Error updating entry:', error)
      let errorMessage = 'Failed to update entry. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('User not found')) {
          errorMessage = 'Authentication error. Please sign in again.'
        } else if (error.message.includes('Database table not found')) {
          errorMessage = 'Database setup error. Please contact support.'
        } else if (error.message.includes('OpenAI')) {
          errorMessage = 'AI analysis service error. Please try again later.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() || !user) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Analyze sentiment with OpenAI
      const sentimentResponse = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        },
        body: JSON.stringify({ content }),
      })

      if (!sentimentResponse.ok) {
        const errorData = await sentimentResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${sentimentResponse.status}: Failed to analyze sentiment`)
      }

      const analysis = await sentimentResponse.json()

      // Fetch reflection prompt BEFORE saving to database
      const reflectionResponse = await fetch('/api/reflection-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (reflectionResponse.ok) {
        const responseData = await reflectionResponse.json()
        console.log('Reflection API response for new entry:', responseData)
        const { reflectionPrompt: prompt } = responseData
        setReflectionPrompt(prompt)
        analysis.reflection_prompt = prompt
        console.log('Generated reflection prompt for new entry:', prompt)
        console.log('Analysis object with reflection prompt:', analysis)
      } else {
        const errorData = await reflectionResponse.json().catch(() => ({}))
        console.error('Reflection API failed for new entry:', reflectionResponse.status, reflectionResponse.statusText, errorData.error)
        // Continue without reflection prompt rather than failing completely
      }
      
      // Save to database with analysis (now includes reflection_prompt)
      const savedEntry = await createJournalEntry(user.id, content, analysis)
      
      if (!savedEntry) {
        throw new Error('Failed to save entry to database')
      }
      
      // After saving, re-fetch the latest entry from the DB for robust state
      setIsLoading(true)
      await checkTodaysEntry()
      setShowSuccessState(true)
      
    } catch (error) {
      console.error('Error submitting entry:', error)
      let errorMessage = 'Failed to submit entry. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = 'You already have an entry for today. You can edit it instead.'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Authentication error. Please sign in again.'
        } else if (error.message.includes('Database table not found')) {
          errorMessage = 'Database setup error. Please contact support.'
        } else if (error.message.includes('OpenAI')) {
          errorMessage = 'AI analysis service error. Please try again later.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }







  return (
    <div className="space-y-4 relative">
      {/* Processing overlay */}
      {(isSubmitting || (isLoading && showSuccessState)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4 p-6 bg-background/80 rounded-xl shadow-lg">
            <Spinner className="h-8 w-8 text-primary animate-spin" />
            <span className="text-base font-medium text-primary">Analyzing your entry...</span>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold">Welcome back, {userName || 'there'}!</h2>
      </div>
      
      {(isLoading || isSubmitting || todaysEntry) ? (
        <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-[25px] relative rounded-[25px] w-full font-sans">
          {/* Card Border */}
          <div
            aria-hidden="true"
            className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
          />
          
          {/* Header Section */}
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
            {/* Date */}
            <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
              <p className="block leading-[normal] whitespace-pre">
                {todaysEntry ? new Date(todaysEntry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
              </p>
            </div>
            
            {/* Title */}
            <div className="font-inter font-medium leading-[0] min-w-full not-italic relative shrink-0 text-[var(--base-text)] text-[18px] text-left">
              <p className="block leading-[normal]">Today&apos;s Recap</p>
            </div>
            
            {/* Badges */}
            <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative shrink-0">
              {todaysEntry ? (
                <>
                  {/* Sentiment Score Badge */}
                  <div className="relative rounded-xl shrink-0">
                    <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                      <div 
                        className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap"
                        style={{ color: getSentimentGradientColor(todaysEntry.sentiment_score) }}
                      >
                        <p className="block leading-[normal] whitespace-pre">
                          {todaysEntry.sentiment_score < 0 ? '-' : ''}{Math.abs(todaysEntry.sentiment_score).toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div
                      aria-hidden="true"
                      className="absolute border border-solid inset-0 pointer-events-none rounded-xl"
                      style={{ borderColor: getSentimentGradientColor(todaysEntry.sentiment_score) }}
                    />
                  </div>
                  
                  {/* Tags */}
                  {todaysEntry.tags && todaysEntry.tags.map((tag, index) => (
                    <div key={index} className="relative rounded-xl shrink-0">
                      <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                        <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                          <p className="block leading-[normal] whitespace-pre">{tag}</p>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-xl"
                      />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </>
              )}
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="box-border content-stretch flex flex-col font-sans font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
            <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
              <p className="block leading-[normal] whitespace-pre">Summary</p>
            </div>
            {todaysEntry ? (
              <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[16px]">
                <p className="block leading-[normal]">
                  {todaysEntry.summary}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
          </div>
          
          {/* Reflection Prompt Section */}
          {(reflectionPrompt || todaysEntry?.reflection_prompt) && (
            <div className="box-border content-stretch flex flex-col font-sans font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
              <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Reflection Prompt</p>
              </div>
              {todaysEntry?.reflection_prompt || reflectionPrompt ? (
                <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[16px]">
                  <p className="block leading-[normal]">
                    {todaysEntry?.reflection_prompt || reflectionPrompt}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              )}
            </div>
          )}
          
          {/* Edit Entry Button */}
          {todaysEntry && (
            <div className="box-border content-stretch flex flex-row gap-2.5 h-[50px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-full cursor-pointer border border-[var(--button-text-secondary)] hover:bg-[var(--button-text-secondary)]/10 transition-all duration-200" onClick={handleEditClick}>
              <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[14px] text-center text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Edit Entry</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="relative rounded-[25px] border border-[var(--card-border)] p-[25px] min-h-[300px] flex flex-col justify-between">
            <Textarea
              placeholder="How are you feeling today? Write freely about your thoughts, emotions, and experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none border-0 p-0 bg-transparent text-[var(--base-text)] placeholder:text-[var(--annotation)] font-sans text-[14px] focus-visible:ring-0 focus-visible:outline-none rounded-none"
            />
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  'Submit Entry'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Today&apos;s Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="relative rounded-[25px] border border-[var(--card-border)] p-[25px] min-h-[300px] flex flex-col justify-between mb-4">
              <Textarea
                placeholder="Edit your journal entry..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] resize-none border-0 p-0 bg-transparent text-[var(--base-text)] placeholder:text-[var(--annotation)] font-sans text-[14px] focus-visible:ring-0 focus-visible:outline-none rounded-none"
              />
              
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    'Save Edits'
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 