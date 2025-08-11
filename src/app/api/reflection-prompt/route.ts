import OpenAI from 'openai'
import { validateEnv } from '@/lib/env'

// Validate environment variables
try {
  validateEnv()
} catch (error) {
  console.error('Environment validation failed:', error)
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string') {
      return Response.json({ error: 'Content is required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano-2025-08-07',
      messages: [
        {
          role: 'system',
          content: `You are a thoughtful journaling companion who creates interconnected, pithy reflection prompts. Based on the user's journal entry, generate a reflection prompt that:

          - Is 1 sentence maximum (pithy and memorable)
          - Connects multiple themes or emotions from their entry
          - Uses "you" language (second person)
          - Encourages deeper self-reflection
          - Is specific to their unique situation
          - Could spark insights throughout their day
          - Avoids generic questions - make it personal to their entry
          
          Examples of good prompts:
          - "How does your energy level connect to your sense of purpose today?"
          - "What would it look like to bring this same confidence to your career challenges?"
          - "How might this family dynamic be influencing your self-perception?"
          
          Examples of bad prompts:
          - "How are you feeling?" (too generic)
          - "What could you do differently?" (too vague)
          - "The user should consider..." (third person)`
        },
        {
          role: 'user',
          content: `Generate a reflection prompt based on this journal entry: ${content}`
        }
      ],
      max_completion_tokens: 100,
      temperature: 0.7,
    })

    const reflectionPrompt = completion.choices[0]?.message?.content?.trim()

    if (!reflectionPrompt) {
      throw new Error('No reflection prompt generated')
    }

    return Response.json({ reflectionPrompt })
  } catch (error) {
    console.error('Error generating reflection prompt:', error)
    
    // Provide more specific error information
    let errorMessage = 'Failed to generate reflection prompt'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key not configured'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'OpenAI rate limit exceeded'
      } else if (error.message.includes('quota')) {
        errorMessage = 'OpenAI quota exceeded'
      } else {
        errorMessage = error.message
      }
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 