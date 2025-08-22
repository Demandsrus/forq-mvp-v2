import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { analytics } from '@/lib/analytics'

interface ReservationStartRequest {
  restaurantId: string
  userId?: string // Optional for analytics
}

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, userId }: ReservationStartRequest = await request.json()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId is required' },
        { status: 400 }
      )
    }

    // Get restaurant details
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, platform, reservation_url')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Check if reservation URL exists
    const hasReservation = !!restaurant.reservation_url
    const reservationUrl = restaurant.reservation_url || null

    // Track analytics
    analytics.track('reservation_attempted', {
      restaurantId,
      restaurant_name: restaurant.name,
      platform: restaurant.platform,
      userId: userId || 'anonymous',
      has_reservation_url: hasReservation,
      reservation_available: hasReservation
    })

    return NextResponse.json({
      url: reservationUrl,
      available: hasReservation,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        platform: restaurant.platform
      }
    })

  } catch (error) {
    console.error('Reservation start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
