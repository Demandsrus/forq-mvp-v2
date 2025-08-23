'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { analytics } from '@/lib/analytics'

interface RestaurantCardProps {
  restaurant: {
    restaurant: {
      id: string
      name: string
      platform: string
      image_url: string
      address: string
      city: string
      state: string
      postal_code: string
      hours: any
      atmosphere: string
      rating: number
      review_count: number
      platform_badge: string
    }
    overview: {
      summary: string
      hours: any
      atmosphere: string
    }
    recommended_items: Array<{
      id: string
      name: string
      macros: any
      spice: number
      price_cents: number
      url: string
      reason: string
      score: number
    }>
    reviews_preview: Array<{
      stars: number
      text: string
    }>
    reservation: {
      available: boolean
      url: string | null
    }
    checkout: {
      platform: string
      deeplink: string
    }
  }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { restaurant: info, overview, recommended_items, reviews_preview, reservation, checkout } = restaurant

  const handleCardOpen = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      analytics.track('restaurant_card_open', {
        restaurant_id: info.id,
        restaurant_name: info.name,
        platform: info.platform
      })
    }
  }

  const handleCheckout = async () => {
    try {
      analytics.track('restaurant_checkout_click', {
        restaurant_id: info.id,
        restaurant_name: info.name,
        platform: info.platform
      })

      const response = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: info.id,
          userId: 'anonymous' // TODO: Get from auth
        })
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.deeplink, '_blank')
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  const handleReservation = () => {
    if (reservation.available && reservation.url) {
      analytics.track('restaurant_reserve_click', {
        restaurant_id: info.id,
        restaurant_name: info.name,
        platform: info.platform
      })
      window.open(reservation.url, '_blank')
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getSpiceLevel = (spice: number) => {
    const levels = ['None', 'Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme']
    return levels[spice] || 'Mild'
  }

  const formatHours = (hours: any) => {
    if (!hours) return 'Hours not available'
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    return days.map((day, index) => {
      const dayHours = hours[day]
      if (!dayHours || dayHours.length === 0) {
        return `${dayNames[index]}: Closed`
      }
      
      const timeRanges = dayHours.map((range: string[]) => `${range[0]} - ${range[1]}`).join(', ')
      return `${dayNames[index]}: ${timeRanges}`
    }).join('\n')
  }

  return (
    <Card className="bg-[#121212] border-gray-800 text-white overflow-hidden w-full">
      <div className="flex flex-col md:flex-row">
        {/* Restaurant Image */}
        <div className="relative h-48 md:h-40 md:w-64 flex-shrink-0">
          <Image
            src={info.image_url || '/placeholder-restaurant.svg'}
            alt={info.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-restaurant.svg'
            }}
          />

          {/* Platform Badge */}
          <div className="absolute top-3 right-3">
            <Image
              src={info.platform_badge}
              alt={info.platform}
              width={24}
              height={24}
              className="bg-white rounded p-1"
            />
          </div>
        </div>

        {/* Restaurant Content */}
        <div className="flex-1 p-4">
          {/* Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{info.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{info.atmosphere}</p>
              <p className="text-gray-400 text-xs">
                {info.address}, {info.city}, {info.state}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm">{info.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                {info.platform}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              onClick={handleCardOpen}
              className="flex-1 border-gray-700 text-white hover:bg-gray-800 text-sm"
            >
              {isExpanded ? 'Show Less' : 'View Details'}
            </Button>
            <Button
              onClick={handleCheckout}
              className="flex-1 bg-white text-black hover:bg-gray-100 text-sm font-semibold"
            >
              Order Now
            </Button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="recommended" className="text-xs">Recommended</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
              <TabsTrigger value="reserve" className="text-xs">Reserve</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Hours</h4>
                  <pre className="text-xs text-gray-400 whitespace-pre-line">
                    {formatHours(overview.hours)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Atmosphere</h4>
                  <p className="text-sm text-gray-400">{overview.atmosphere}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommended" className="mt-4">
              <div className="space-y-3">
                {recommended_items.map((item) => (
                  <div key={item.id} className="border border-gray-700 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className="text-sm font-medium">{formatPrice(item.price_cents)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{item.reason}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Spice: {getSpiceLevel(item.spice)}</span>
                      <span>{item.macros?.kcal || 0} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-3">
                {reviews_preview.map((review, index) => (
                  <div key={index} className="border border-gray-700 rounded p-3">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.stars ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">"{review.text}"</p>
                  </div>
                ))}
                <Button variant="link" className="text-blue-400 p-0 h-auto">
                  See more reviews
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reserve" className="mt-4">
              <div className="text-center">
                <Button
                  onClick={handleReservation}
                  disabled={!reservation.available}
                  className="w-full"
                  variant={reservation.available ? "default" : "secondary"}
                >
                  {reservation.available ? 'Open Reservations' : 'Reservations Not Available'}
                </Button>
                {reservation.available && (
                  <p className="text-xs text-gray-400 mt-2">
                    Opens in new tab
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </Card>
  )
}
