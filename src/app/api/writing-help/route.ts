import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { currentContent } = await request.json()

    const prompt = `I'm helping someone write a journal entry. ${currentContent ? `They've already written: "${currentContent}"` : 'They haven\'t started writing yet.'}

Please provide a warm, supportive writing prompt or starter that encourages self-reflection and emotional awareness. The response should be:
- Gentle and encouraging
- Open-ended (not too specific)
- Focused on emotional exploration
- 1-2 sentences maximum
- Something they can immediately start writing with

Examples of good starters:
- "Today I noticed..."
- "I'm feeling grateful for..."
- "Something that challenged me today was..."
- "A moment that brought me joy was..."

Please provide just the writing starter, nothing else.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are a supportive writing coach who helps people reflect on their day through journaling. Provide gentle, encouraging prompts that help people explore their thoughts and emotions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    })

    const writingStarter = completion.choices[0]?.message?.content
    if (!writingStarter) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      writingStarter: writingStarter.trim() 
    })

  } catch (error) {
    console.error('Writing help error:', error)
    return NextResponse.json(
      { error: 'Failed to get writing help' },
      { status: 500 }
    )
  }
} 