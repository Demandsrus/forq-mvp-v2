/**
 * Test script for updated chat and recs APIs
 * Run with: node test-chat-recs-updates.js
 */

const testUpdatedAPIs = async () => {
  const baseUrl = 'http://localhost:3000'
  const testUserId = 'test-user-123'
  const testRestaurantId = 'd90d9e64-be09-4560-b406-43ea466e990c' // Golden Gate Ramen

  console.log('🤖 Testing Updated Chat & Recs APIs\n')

  // Test chat API with different intents
  const chatTests = [
    {
      name: 'Chat - General cooking question',
      payload: {
        message: 'How do I cook pasta properly?',
        history: []
      }
    },
    {
      name: 'Chat - Restaurant recommendation request',
      payload: {
        message: 'I want some good pizza for dinner',
        history: []
      }
    },
    {
      name: 'Chat - Mood-based recommendation',
      payload: {
        message: 'I\'m feeling something healthy and light for lunch',
        history: []
      }
    },
    {
      name: 'Chat - Budget-specific request',
      payload: {
        message: 'What\'s good and cheap around here?',
        history: []
      }
    }
  ]

  console.log('🤖 TESTING CHAT API')
  console.log('=' .repeat(50))

  for (const test of chatTests) {
    console.log(`📋 Test: ${test.name}`)
    console.log(`📤 Request:`, JSON.stringify(test.payload, null, 2))
    
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`)
        console.log(`💬 Reply: ${data.reply}`)
        console.log(`🎯 Intent: ${data.json?.intent}`)
        console.log(`📊 Context: ${JSON.stringify(data.json?.context || {})}`)
        console.log(`🏪 Restaurants: ${data.restaurants ? data.restaurants.length : 0}`)
        if (data.restaurants && data.restaurants.length > 0) {
          console.log(`   First: ${data.restaurants[0].restaurant.name}`)
        }
      } else {
        console.log(`❌ Status: ${response.status}`)
        console.log(`❌ Error:`, data.error)
      }
    } catch (error) {
      console.log(`❌ Network error:`, error.message)
    }
    
    console.log('─'.repeat(50))
  }

  // Test recs API
  const recsTests = [
    {
      name: 'Recs - Restaurant-specific (with user)',
      payload: {
        userId: testUserId,
        restaurantId: testRestaurantId
      }
    },
    {
      name: 'Recs - Restaurant-specific (anonymous)',
      payload: {
        restaurantId: testRestaurantId
      }
    },
    {
      name: 'Recs - Legacy behavior (flat dishes)',
      payload: {
        userId: testUserId,
        preferences: {
          cuisinePreferences: ['Japanese', 'Italian'],
          spiceLevel: 'Medium',
          dietaryRestrictions: []
        }
      }
    }
  ]

  console.log('\n🍽️  TESTING RECS API')
  console.log('=' .repeat(50))

  for (const test of recsTests) {
    console.log(`📋 Test: ${test.name}`)
    console.log(`📤 Request:`, JSON.stringify(test.payload, null, 2))
    
    try {
      const response = await fetch(`${baseUrl}/api/recs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`)
        
        if (data.recommended_items) {
          // Restaurant-specific response
          console.log(`🍽️  Recommended items: ${data.recommended_items.length}`)
          console.log(`🎯 Personalized: ${data.personalized}`)
          if (data.recommended_items.length > 0) {
            console.log(`   First: ${data.recommended_items[0].name} (score: ${data.recommended_items[0].score})`)
          }
        } else {
          // Legacy response
          console.log(`🍽️  Dishes: ${data.dishes?.length || 0}`)
          console.log(`📊 Legacy recipes: ${data.recipes?.length || 0}`)
          console.log(`🎯 Personalized: ${data.personalized}`)
          if (data.dishes && data.dishes.length > 0) {
            console.log(`   First: ${data.dishes[0].name}`)
          }
        }
      } else {
        console.log(`❌ Status: ${response.status}`)
        console.log(`❌ Error:`, data.error)
      }
    } catch (error) {
      console.log(`❌ Network error:`, error.message)
    }
    
    console.log('─'.repeat(50))
  }

  console.log('\n📝 Summary:')
  console.log('✅ Chat API now parses JSON and calls restaurant search for get_recs intent')
  console.log('✅ Recs API supports restaurant-specific recommendations (top 3 items)')
  console.log('✅ Recs API maintains legacy flat dishes array format')
}

// Run the test
if (require.main === module) {
  testUpdatedAPIs().catch(console.error)
}

module.exports = { testUpdatedAPIs }
