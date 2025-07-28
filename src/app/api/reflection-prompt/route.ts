import OpenAI from 'openai'

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
      model: 'gpt-4.1-nano-2025-04-14',
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
      max_tokens: 100,
      temperature: 0.7,
    })

    const reflectionPrompt = completion.choices[0]?.message?.content?.trim()

    if (!reflectionPrompt) {
      throw new Error('No reflection prompt generated')
    }

    return Response.json({ reflectionPrompt })
  } catch (error) {
    console.error('Error generating reflection prompt:', error)
    return Response.json(
      { error: 'Failed to generate reflection prompt' },
      { status: 500 }
    )
  }
} 