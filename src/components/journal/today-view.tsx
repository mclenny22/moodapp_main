'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2Icon } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { createJournalEntry, getTodaysEntry, updateJournalEntry, JournalEntry } from '@/lib/database'

export function TodayView() {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingHelp, setIsGettingHelp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null)
  const [showSuccessState, setShowSuccessState] = useState(false)
  const [todaysEntry, setTodaysEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      checkTodaysEntry()
    }
  }, [user])

  const checkTodaysEntry = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const entry = await getTodaysEntry(user.id)
      setTodaysEntry(entry)
      
      if (entry) {
        // If there's already an entry for today, show success state
        setShowSuccessState(true)
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
  }

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
        throw new Error('Failed to analyze sentiment')
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
        console.error('Reflection API failed:', reflectionResponse.status, reflectionResponse.statusText)
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
      setError('Failed to update entry. Please try again.')
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
        body: JSON.stringify({ content }),
      })

      if (!sentimentResponse.ok) {
        throw new Error('Failed to analyze sentiment')
      }

      const analysis = await sentimentResponse.json()
      
      // Save to database with analysis
      const savedEntry = await createJournalEntry(user.id, content, analysis)
      
      if (!savedEntry) {
        throw new Error('Failed to save entry to database')
      }
      
      // Generate reflection prompt
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
        console.error('Reflection API failed for new entry:', reflectionResponse.status, reflectionResponse.statusText)
      }
      
      // Show success state
      setShowSuccessState(true)
      
    } catch (error) {
      console.error('Error submitting entry:', error)
      setError('Failed to submit entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHelpWrite = async () => {
    setIsGettingHelp(true)
    setError(null)
    
    try {
      const response = await fetch('/api/writing-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentContent: content }),
      })

      if (!response.ok) {
        throw new Error('Failed to get writing help')
      }

      const { writingStarter } = await response.json()
      
      // Add the writing starter to the current content
      if (content.trim()) {
        setContent(content + '\n\n' + writingStarter)
      } else {
        setContent(writingStarter)
      }
      
    } catch (error) {
      console.error('Error getting writing help:', error)
      setError('Failed to get writing help. Please try again.')
    } finally {
      setIsGettingHelp(false)
    }
  }



  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{today}</h2>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : showSuccessState ? (
        <div className="space-y-6">
          <Alert className="border-green-500 bg-green-50 text-green-900">
            <CheckCircle2Icon className="h-4 w-4 text-green-600" />
            <AlertTitle>Success! Here&apos;s something to think about:</AlertTitle>
            <AlertDescription>
              {reflectionPrompt}
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can view your entry and see your mood trends in the Journal and Trends tabs.
            </p>
            <Button 
              variant="outline" 
              onClick={handleEditClick}
              className="w-full max-w-xs"
            >
              Edit Entry
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Textarea
            placeholder="How are you feeling today? Write freely about your thoughts, emotions, and experiences..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || isGettingHelp}
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
            
            <Button 
              variant="outline"
              onClick={handleHelpWrite}
              disabled={isSubmitting || isGettingHelp}
              className="flex-1"
            >
              {isGettingHelp ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Getting help...
                </>
              ) : (
                'Help me write'
              )}
            </Button>
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
            
            <Textarea
              placeholder="Edit your journal entry..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] resize-none mb-4"
            />
            
            <div className="flex gap-2">
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
      )}
    </div>
  )
} 