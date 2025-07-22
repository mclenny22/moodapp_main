import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }

    const prompt = `Analyze the following journal entry and provide:
1. A sentiment score from -5 (very negative) to +5 (very positive)
2. A brief summary (1-2 sentences)
3. 3-5 relevant emotional tags
4. A memory weight from 1-10 indicating how memorable/significant this entry is

Memory weight guidelines:
- 1-3: Routine daily activities, minor annoyances, normal work days
- 4-6: Notable events, moderate emotions, personal insights
- 7-8: Significant life events, strong emotions, important decisions
- 9-10: Major life changes, intense emotions, breakthrough moments, major achievements/failures

Consider emotional intensity, life significance, personal breakthroughs, relationship milestones, and writing style.

Journal entry: "${content}"

Please respond in this exact JSON format:
{
  "sentiment_score": number,
  "summary": "string",
  "tags": ["string", "string", "string"],
  "memory_weight": number
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes journal entries for emotional content. Provide accurate sentiment analysis, concise summaries, and relevant emotional tags."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const analysis = JSON.parse(responseText)

    // Validate the response structure
    if (typeof analysis.sentiment_score !== 'number' || 
        typeof analysis.summary !== 'string' || 
        !Array.isArray(analysis.tags) ||
        typeof analysis.memory_weight !== 'number') {
      throw new Error('Invalid response format from OpenAI')
    }

    // Clamp sentiment score to -5 to +5 range
    analysis.sentiment_score = Math.max(-5, Math.min(5, analysis.sentiment_score))
    
    // Clamp memory weight to 1-10 range
    analysis.memory_weight = Math.max(1, Math.min(10, Math.round(analysis.memory_weight)))

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
} 