import OpenAI from 'openai'
import { FORQ_MVP_SYSTEM_PROMPT } from './prompts/forq'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  message: string
  intent?: 'get_recs' | 'general' | 'greeting'
  sanitized?: boolean
  error?: string
}

export interface RestaurantRecommendation {
  restaurant_name: string
  cuisine_type: string
  description: string
  price_range: string
  rating: number
  delivery_time: string
  platform: string
  reason: string
}

// Chat with OpenAI using FORQ system prompt
export async function chatWithOpenAI(
  messages: ChatMessage[],
  userId: string,
  context?: any
): Promise<ChatResponse> {
  try {
    // Prepare messages with system prompt
    const systemMessage: ChatMessage = {
      role: 'system',
      content: FORQ_MVP_SYSTEM_PROMPT
    }

    const fullMessages = [systemMessage, ...messages]

    // Add context if provided
    if (context) {
      const contextMessage: ChatMessage = {
        role: 'system',
        content: `User Context: ${JSON.stringify(context)}`
      }
      fullMessages.splice(1, 0, contextMessage)
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    // Determine intent based on response content
    let intent: 'get_recs' | 'general' | 'greeting' = 'general'
    
    if (assistantMessage.toLowerCase().includes('restaurant') || 
        assistantMessage.toLowerCase().includes('food') ||
        assistantMessage.toLowerCase().includes('delivery')) {
      intent = 'get_recs'
    } else if (assistantMessage.toLowerCase().includes('hello') ||
               assistantMessage.toLowerCase().includes('hi') ||
               assistantMessage.toLowerCase().includes('welcome')) {
      intent = 'greeting'
    }

    return {
      message: assistantMessage,
      intent,
      sanitized: false
    }

  } catch (error: any) {
    console.error('OpenAI chat error:', error)
    
    return {
      message: "I'm having trouble connecting right now. Let me help you find some great restaurants instead!",
      intent: 'get_recs',
      error: error.message
    }
  }
}

// Generate restaurant recommendations using OpenAI
export async function generateRestaurantRecommendations(
  userPreferences: any,
  context: any,
  count: number = 5
): Promise<RestaurantRecommendation[]> {
  try {
    const prompt = `
Based on the following user preferences and context, recommend ${count} restaurants for food delivery:

User Preferences: ${JSON.stringify(userPreferences)}
Context: ${JSON.stringify(context)}

Please provide recommendations in the following JSON format:
[
  {
    "restaurant_name": "Restaurant Name",
    "cuisine_type": "Cuisine Type",
    "description": "Brief description",
    "price_range": "$" | "$$" | "$$$",
    "rating": 4.5,
    "delivery_time": "25-35 mins",
    "platform": "ubereats" | "doordash" | "grubhub",
    "reason": "Why this matches their preferences"
  }
]

Focus on delivery options, not cooking. Provide diverse options across different cuisines and price points.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: FORQ_MVP_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No recommendations generated')
    }

    // Try to parse JSON response
    try {
      const recommendations = JSON.parse(response)
      return Array.isArray(recommendations) ? recommendations : []
    } catch (parseError) {
      console.error('Failed to parse recommendations JSON:', parseError)
      return []
    }

  } catch (error: any) {
    console.error('OpenAI recommendations error:', error)
    return []
  }
}

// Extract user intent from message
export async function extractUserIntent(message: string): Promise<{
  intent: string
  entities: Record<string, any>
  confidence: number
}> {
  try {
    const prompt = `
Analyze this user message and extract the intent and entities:
"${message}"

Return JSON in this format:
{
  "intent": "search_restaurants" | "ask_question" | "get_recommendations" | "greeting" | "other",
  "entities": {
    "cuisine": "string or null",
    "price_range": "$ | $$ | $$$ or null",
    "dietary_restrictions": "array of strings or null",
    "location": "string or null",
    "mood": "string or null"
  },
  "confidence": 0.0-1.0
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an intent extraction system for a food delivery app. Extract user intents and entities accurately.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No intent extracted')
    }

    try {
      return JSON.parse(response)
    } catch (parseError) {
      return {
        intent: 'other',
        entities: {},
        confidence: 0.5
      }
    }

  } catch (error: any) {
    console.error('Intent extraction error:', error)
    return {
      intent: 'other',
      entities: {},
      confidence: 0.0
    }
  }
}

// Generate personalized food suggestions
export async function generateFoodSuggestions(
  userProfile: any,
  timeOfDay: string,
  weather?: string
): Promise<string[]> {
  try {
    const prompt = `
Based on this user profile, suggest 5 specific food items they might want to order for ${timeOfDay}:

User Profile: ${JSON.stringify(userProfile)}
Time: ${timeOfDay}
${weather ? `Weather: ${weather}` : ''}

Return a simple array of food item names, like:
["Spicy Thai Basil Chicken", "Margherita Pizza", "Caesar Salad", "Beef Tacos", "Chocolate Brownie"]

Focus on specific dishes, not just restaurant types.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return []
    }

    try {
      return JSON.parse(response)
    } catch (parseError) {
      // Fallback: extract items from text
      const items = response.split('\n')
        .map(item => item.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(item => item.length > 0)
        .slice(0, 5)
      
      return items
    }

  } catch (error: any) {
    console.error('Food suggestions error:', error)
    return []
  }
}
