import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple auth guard - get user ID from cookie or create anonymous session
async function getUserId(request: NextRequest): Promise<string> {
  const cookieStore = await cookies()
  let userId = cookieStore.get('forq_user_id')?.value

  if (!userId) {
    // Create anonymous user ID for MVP (UUID format)
    userId = crypto.randomUUID()
  }

  return userId
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, external_user_id, access_token, refresh_token, expires_at } = body

    // Validate required fields
    if (!provider || !external_user_id) {
      return NextResponse.json(
        { error: 'Provider and external_user_id are required' },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders = ['ubereats', 'doordash', 'postmates', 'grubhub']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: ' + validProviders.join(', ') },
        { status: 400 }
      )
    }

    // Get user ID
    const userId = await getUserId(request)

    // Prepare data for upsert
    const accountData = {
      user_id: userId,
      provider,
      external_user_id: external_user_id.trim(),
      access_token: access_token || null,
      refresh_token: refresh_token || null,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null
    }

    // For MVP: First create a user record if it doesn't exist
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: `${userId}@forq-mvp.local`,
      email_confirm: true
    })

    // Use the actual user ID from Supabase
    let actualUserId = userId
    if (userData?.user?.id) {
      actualUserId = userData.user.id
    } else if (userError && userError.message.includes('already registered')) {
      // User exists, try to find them
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const foundUser = existingUser?.users?.find(u => u.email === `${userId}@forq-mvp.local`)
      if (foundUser?.id) {
        actualUserId = foundUser.id
      }
    } else if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Update account data with actual user ID
    accountData.user_id = actualUserId

    // Upsert linked account (insert or update if exists)
    const { data, error } = await supabase
      .from('linked_accounts')
      .upsert(accountData, {
        onConflict: 'user_id,provider',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to link account', details: error.message },
        { status: 500 }
      )
    }

    // Create response with user ID cookie
    const response = NextResponse.json({ success: true, data })

    // Always set the actual user ID cookie (the Supabase user ID)
    response.cookies.set('forq_user_id', actualUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    return response

  } catch (error) {
    console.error('Error linking account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
