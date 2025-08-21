import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple auth guard - get user ID from cookie
async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('forq_user_id')?.value || null
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = await getUserId()

    if (!userId) {
      // Return empty array for users without accounts
      return NextResponse.json([])
    }

    console.log('Looking for accounts for user:', userId)

    // Fetch linked accounts for the user
    const { data, error } = await supabase
      .from('linked_accounts')
      .select('provider, external_user_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch linked accounts' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error('Error fetching linked accounts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
