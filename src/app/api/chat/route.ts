import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'anonymous'

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured. Please add your API key to the .env.local file.'
      }, { status: 500 })
    }

    // Create OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are FORQ's AI food assistant named Edith. You help users with:
          - Recipe recommendations and cooking instructions
          - Meal planning and nutrition advice
          - Ingredient substitutions and cooking tips
          - Food safety and storage information
          - EBT/SNAP eligible food suggestions

          Be helpful, friendly, and concise. Focus on practical, actionable advice.
          Keep responses under 200 words unless the user specifically asks for detailed instructions.`
        },
        ...history.slice(-5).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again."

    // Analytics temporarily disabled for deployment
    // TODO: Re-enable analytics after fixing PostHog integration

    return NextResponse.json({
      success: true,
      message: response
    })

  } catch (error) {
    console.error('Error in chat API:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat message'
      },
      { status: 500 }
    )
  }
}


