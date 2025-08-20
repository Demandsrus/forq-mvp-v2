import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { recipeId, action } = await request.json()
    
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required to favorite recipes' 
        },
        { status: 401 }
      )
    }

    if (!recipeId || !action || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request. Recipe ID and action (add/remove) are required.' 
        },
        { status: 400 }
      )
    }

    let result
    
    if (action === 'add') {
      // Add to favorites
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
        })
        .select()

      if (error) {
        // Handle duplicate favorite (user already favorited this recipe)
        if (error.code === '23505') {
          return NextResponse.json({
            success: true,
            message: 'Recipe already in favorites',
            action: 'add'
          })
        }
        throw error
      }

      result = data?.[0]

      // Analytics temporarily disabled for deployment

    } else {
      // Remove from favorites
      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .select()

      if (error) throw error

      result = data?.[0]

      // Analytics temporarily disabled for deployment
    }

    return NextResponse.json({
      success: true,
      message: `Recipe ${action === 'add' ? 'added to' : 'removed from'} favorites`,
      action,
      data: result
    })

  } catch (error) {
    console.error('Error managing favorite:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update favorites' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required to view favorites' 
        },
        { status: 401 }
      )
    }

    // Get user's favorites
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      favorites: data || []
    })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch favorites' 
      },
      { status: 500 }
    )
  }
}
