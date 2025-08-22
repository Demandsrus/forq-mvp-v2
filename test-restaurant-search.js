/**
 * Test script for the restaurant search API
 * Run with: node test-restaurant-search.js
 */

const testRestaurantSearch = async () => {
  const baseUrl = 'http://localhost:3000'
  
  const testCases = [
    {
      name: 'Basic search with craving',
      payload: {
        userId: 'test-user-123',
        context: {
          craving: 'pizza',
          budget: '$$',
          time_of_day: 'dinner',
          platform_pref: 'ubereats',
          topK: 5
        }
      }
    },
    {
      name: 'Search without context (defaults)',
      payload: {
        userId: 'test-user-456'
      }
    },
    {
      name: 'Search with mood and specific platform',
      payload: {
        userId: 'test-user-789',
        context: {
          craving: 'sushi',
          mood: 'healthy',
          platform_pref: 'doordash',
          topK: 4
        }
      }
    }
  ]

  console.log('🍕 Testing Restaurant Search API\n')

  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`)
    console.log(`📤 Request:`, JSON.stringify(testCase.payload, null, 2))
    
    try {
      const response = await fetch(`${baseUrl}/api/restaurants/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Status: ${response.status}`)
        console.log(`📊 Results: ${data.results?.length || 0} restaurants`)
        console.log(`🎯 Context used:`, data.context_used)
        
        if (data.results && data.results.length > 0) {
          console.log(`🏪 First restaurant: ${data.results[0].restaurant.name}`)
          console.log(`🍽️  Recommended items: ${data.results[0].recommended_items?.length || 0}`)
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
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRestaurantSearch().catch(console.error)
}

module.exports = { testRestaurantSearch }
