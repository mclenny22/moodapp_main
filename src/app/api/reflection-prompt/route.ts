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
          content: `You are a supportive and thoughtful journaling companion. Based on the user's journal entry, provide a gentle, open-ended reflection prompt that encourages deeper thinking. The prompt should be:
          - 1-2 sentences maximum
          - Warm and supportive in tone
          - Open-ended (not yes/no questions)
          - Related to the themes or emotions mentioned in their entry
          - Something they could ponder throughout the day
          
          Examples:
          - "What would it look like to bring more of that sense of accomplishment into your daily routine?"
          - "How might you approach tomorrow with the same patience you showed today?"
          - "What small step could you take this week to build on this positive momentum?"`
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