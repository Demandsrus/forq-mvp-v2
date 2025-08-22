import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const FORQ_MVP_SYSTEM_PROMPT = `You are Edith, FORQ's AI food assistant. You help users with food recommendations, cooking advice, and restaurant suggestions.

When users ask for restaurant recommendations, food suggestions, or anything related to finding places to eat, respond with intent "get_recs" and include relevant context.

Always respond with valid JSON in this format:
{
  "intent": "general" | "get_recs",
  "reply": "Your helpful response to the user",
  "context": {
    "craving": "extracted food/cuisine type if mentioned",
    "mood": "extracted mood/occasion if mentioned",
    "time_of_day": "breakfast|lunch|dinner|late_night if mentioned",
    "budget": "$|$$|$$$" if mentioned
  }
}

Examples:
- "I want pizza" → intent: "get_recs", context: {"craving": "pizza"}
- "What's good for dinner?" → intent: "get_recs", context: {"time_of_day": "dinner"}
- "How do I cook pasta?" → intent: "general", context: {}

Be helpful, friendly, and concise. Focus on practical advice.`

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
          content: FORQ_MVP_SYSTEM_PROMPT
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

    const rawResponse = completion.choices[0]?.message?.content ||
      '{"intent": "general", "reply": "I\'m sorry, I couldn\'t generate a response. Please try again.", "context": {}}'

    // Parse JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(rawResponse)
    } catch (error) {
      // Fallback if JSON parsing fails
      parsedResponse = {
        intent: "general",
        reply: rawResponse,
        context: {}
      }
    }

    let restaurants = undefined

    // If intent is get_recs, call restaurant search API
    if (parsedResponse.intent === 'get_recs') {
      try {
        const searchContext = {
          ...parsedResponse.context,
          topK: 4 // Default to 4, can be overridden by context
        }

        const searchResponse = await fetch(`${request.nextUrl.origin}/api/restaurants/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            context: searchContext
          })
        })

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          restaurants = searchData.results
        }
      } catch (error) {
        console.error('Error calling restaurant search:', error)
        // Continue without restaurants if search fails
      }
    }

    return NextResponse.json({
      success: true,
      reply: parsedResponse.reply,
      json: parsedResponse,
      restaurants: restaurants
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


