'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { createJournalEntry } from '@/lib/database'

export function TodayView() {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingHelp, setIsGettingHelp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null)
  const [showSuccessState, setShowSuccessState] = useState(false)

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
        const { reflectionPrompt: prompt } = await reflectionResponse.json()
        setReflectionPrompt(prompt)
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

  const resetForm = () => {
    setContent('')
    setError(null)
    setReflectionPrompt(null)
    setShowSuccessState(false)
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
      
      {showSuccessState ? (
        <div className="space-y-6">
          <Alert>
            <AlertDescription className="text-lg font-medium">
              ✨ Your journal entry has been saved!
            </AlertDescription>
          </Alert>
          
          {reflectionPrompt && (
            <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
              <h3 className="font-medium text-lg mb-3">💭 Reflection for today</h3>
              <p className="text-muted-foreground leading-relaxed">
                {reflectionPrompt}
              </p>
            </div>
          )}
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can view your entry and see your mood trends in the Journal and Trends tabs.
            </p>
            <Button 
              variant="outline" 
              onClick={resetForm}
              className="w-full max-w-xs"
            >
              Write another entry
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
    </div>
  )
} 