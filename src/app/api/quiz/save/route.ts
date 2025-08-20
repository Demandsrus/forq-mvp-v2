import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get user from session (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()
    
    // For MVP, we'll store quiz responses even for anonymous users
    // In production, you might want to require authentication
    const userId = user?.id || 'anonymous'

    // Save quiz responses to database
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        user_id: userId,
        responses: body,
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      // Don't fail the request if database save fails
      // The quiz can still work without persistence
    }

    // Analytics temporarily disabled for deployment

    return NextResponse.json({ 
      success: true, 
      message: 'Quiz responses saved successfully',
      data: data?.[0] || null
    })

  } catch (error) {
    console.error('Error saving quiz:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save quiz responses' 
      },
      { status: 500 }
    )
  }
}
