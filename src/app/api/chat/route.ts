import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'
import { FORQ_MVP_SYSTEM_PROMPT } from '@/lib/prompts/forq'
import { sanitizeAssistantReply, stripCookingLanguage } from '@/lib/guardrails'
import { applySafetyFilter } from '@/lib/recs_safety'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Server-side guard: Filter out recipe-style content and focus on JSON intent
 * Removes lines that look like generated recipes while preserving JSON structure
 */
function filterRecipeContent(content: string): string {
  const lines = content.split('\n')
  const filteredLines: string[] = []
  let inJsonBlock = false
  let braceCount = 0

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip obvious recipe content patterns
    if (
      trimmedLine.match(/^(ingredients?|instructions?|directions?|steps?|recipe|cooking|preparation):/i) ||
      trimmedLine.match(/^\d+\.\s/) || // Numbered steps
      trimmedLine.match(/^-\s/) || // Bullet points
      trimmedLine.match(/^(add|mix|cook|bake|fry|boil|simmer|heat|stir|combine)/i) ||
      trimmedLine.match(/^\*\s/) // Asterisk bullets
    ) {
      continue
    }

    // Track JSON blocks
    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length

    if (openBraces > 0) {
      inJsonBlock = true
    }

    braceCount += openBraces - closeBraces

    // Include line if it's part of JSON or looks like valid response content
    if (inJsonBlock || trimmedLine.includes('"intent"') || trimmedLine.includes('"reply"')) {
      filteredLines.push(line)
    }

    if (braceCount <= 0 && inJsonBlock) {
      inJsonBlock = false
    }
  }

  return filteredLines.join('\n').trim() || content
}

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

    // Server-side guard: Filter out recipe-style content and extract JSON
    const cleanedResponse = filterRecipeContent(rawResponse)

    // Parse JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (error) {
      // Try to extract JSON from mixed content
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0])
        } catch {
          // Final fallback
          parsedResponse = {
            intent: "general",
            reply: cleanedResponse,
            context: {}
          }
        }
      } else {
        // Fallback if JSON parsing fails
        parsedResponse = {
          intent: "general",
          reply: cleanedResponse,
          context: {}
        }
      }
    }

    // Apply guardrails to sanitize the response
    let sanitized = false
    const sanitizeResult = sanitizeAssistantReply(parsedResponse.reply || '')

    if (!sanitizeResult.ok) {
      // Override with safe message
      parsedResponse.reply = sanitizeResult.cleaned
      sanitized = true

      // If intent was not get_recs, force it to get_recs for safety
      if (parsedResponse.intent !== 'get_recs') {
        parsedResponse.intent = 'get_recs'
        parsedResponse.context = { topK: 3 }
      }
    } else {
      // Strip any residual cooking language
      parsedResponse.reply = stripCookingLanguage(parsedResponse.reply || '')
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
          // Apply safety filter to remove any cooking/recipe content
          const safeData = applySafetyFilter(searchData)
          restaurants = safeData.results
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
      restaurants: restaurants,
      sanitized: sanitized
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


