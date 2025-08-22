/**
 * Test script for checkout and reservation APIs
 * Run with: node test-checkout-reservation.js
 */

const testCheckoutAndReservation = async () => {
  const baseUrl = 'http://localhost:3000'
  
  // Real IDs from the database
  const testRestaurantId = 'd90d9e64-be09-4560-b406-43ea466e990c' // Golden Gate Ramen
  const testDishId = 'e99ec524-1557-485b-bb91-7fc21d3d8148' // California Roll
  const testUserId = 'test-user-123'

  console.log('🛒 Testing Checkout & Reservation APIs\n')

  // Test cases for checkout API
  const checkoutTests = [
    {
      name: 'Checkout with specific dish',
      payload: {
        restaurantId: testRestaurantId,
        dishId: testDishId,
        userId: testUserId
      }
    },
    {
      name: 'Checkout without dish (find top dish for user)',
      payload: {
        restaurantId: testRestaurantId,
        userId: testUserId
      }
    },
    {
      name: 'Checkout without user (anonymous)',
      payload: {
        restaurantId: testRestaurantId
      }
    }
  ]

  // Test checkout API
  console.log('🛒 TESTING CHECKOUT API')
  console.log('=' .repeat(50))

  for (const test of checkoutTests) {
    console.log(`📋 Test: ${test.name}`)
    console.log(`📤 Request:`, JSON.stringify(test.payload, null, 2))
    
    try {
      const response = await fetch(`${baseUrl}/api/checkout/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`)
        console.log(`🏪 Restaurant: ${data.restaurant?.name}`)
        console.log(`🍽️  Dish: ${data.dish?.name}`)
        console.log(`📱 Platform: ${data.platform}`)
        console.log(`🔗 Deeplink: ${data.deeplink}`)
      } else {
        console.log(`❌ Status: ${response.status}`)
        console.log(`❌ Error:`, data.error)
      }
    } catch (error) {
      console.log(`❌ Network error:`, error.message)
    }
    
    console.log('─'.repeat(50))
  }

  // Test reservation API
  console.log('\n🍽️  TESTING RESERVATION API')
  console.log('=' .repeat(50))

  const reservationTests = [
    {
      name: 'Reservation with user',
      payload: {
        restaurantId: testRestaurantId,
        userId: testUserId
      }
    },
    {
      name: 'Reservation without user (anonymous)',
      payload: {
        restaurantId: testRestaurantId
      }
    }
  ]

  for (const test of reservationTests) {
    console.log(`📋 Test: ${test.name}`)
    console.log(`📤 Request:`, JSON.stringify(test.payload, null, 2))
    
    try {
      const response = await fetch(`${baseUrl}/api/reservation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`)
        console.log(`🏪 Restaurant: ${data.restaurant?.name}`)
        console.log(`📅 Available: ${data.available}`)
        console.log(`🔗 URL: ${data.url || 'Not available'}`)
      } else {
        console.log(`❌ Status: ${response.status}`)
        console.log(`❌ Error:`, data.error)
      }
    } catch (error) {
      console.log(`❌ Network error:`, error.message)
    }
    
    console.log('─'.repeat(50))
  }

  console.log('\n📝 NOTE: Update testRestaurantId and testDishId with real IDs from your database')
}

// Helper function to get real IDs from database (for manual testing)
const getTestIds = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 Getting real restaurant and dish IDs for testing...\n')
  
  try {
    // Use the restaurant search API to get real IDs
    const response = await fetch(`${baseUrl}/api/restaurants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user',
        context: { topK: 1 }
      })
    })

    const data = await response.json()
    
    if (response.ok && data.results && data.results.length > 0) {
      const restaurant = data.results[0].restaurant
      const dish = data.results[0].recommended_items?.[0]
      
      console.log('📋 Found test IDs:')
      console.log(`🏪 Restaurant ID: ${restaurant.id}`)
      console.log(`🏪 Restaurant Name: ${restaurant.name}`)
      if (dish) {
        console.log(`🍽️  Dish ID: ${dish.id}`)
        console.log(`🍽️  Dish Name: ${dish.name}`)
      }
      console.log('\n📝 Copy these IDs into the test script for real testing')
      
      return {
        restaurantId: restaurant.id,
        dishId: dish?.id
      }
    } else {
      console.log('❌ No restaurants found. Make sure your database has restaurant data.')
    }
  } catch (error) {
    console.log(`❌ Error getting test IDs:`, error.message)
  }
  
  return null
}

// Run the appropriate function based on command line argument
if (process.argv.includes('--get-ids')) {
  getTestIds().catch(console.error)
} else {
  testCheckoutAndReservation().catch(console.error)
}

module.exports = { testCheckoutAndReservation, getTestIds }
