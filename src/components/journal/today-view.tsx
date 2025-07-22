'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function TodayView() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    setIsSubmitting(true)
    // TODO: Implement journal submission with AI analysis
    console.log('Submitting entry:', content)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setContent('')
      // TODO: Show success message and redirect to journal view
    }, 2000)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{today}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="How are you feeling today? Write freely about your thoughts, emotions, and experiences..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="w-full"
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
      </CardContent>
    </Card>
  )
} 