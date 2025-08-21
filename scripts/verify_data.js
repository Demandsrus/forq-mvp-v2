const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkData() {
  try {
    const { data: restaurants } = await supabase.from('restaurants').select('*')
    const { data: dishes } = await supabase.from('dishes').select('*')
    const { data: reviews } = await supabase.from('reviews').select('*')
    
    console.log('📊 Database Summary:')
    console.log(`Restaurants: ${restaurants?.length || 0}`)
    console.log(`Dishes: ${dishes?.length || 0}`)
    console.log(`Reviews: ${reviews?.length || 0}`)
    
    if (restaurants?.length > 0) {
      console.log('\n🏪 Sample Restaurants:')
      restaurants.slice(0, 5).forEach(r => {
        console.log(`- ${r.name} (${r.cuisine}) on ${r.platform} - ${r.city}`)
      })
      
      // Platform distribution
      const platformCounts = restaurants.reduce((acc, r) => {
        acc[r.platform] = (acc[r.platform] || 0) + 1
        return acc
      }, {})
      console.log('\n📱 Platform Distribution:')
      Object.entries(platformCounts).forEach(([platform, count]) => {
        console.log(`- ${platform}: ${count} restaurants`)
      })
    }
    
    if (dishes?.length > 0) {
      console.log('\n🍽️ Sample Dishes:')
      dishes.slice(0, 5).forEach(d => {
        console.log(`- ${d.name} (${d.cuisine}) - $${(d.price_cents/100).toFixed(2)}`)
      })
    }
    
    if (reviews?.length > 0) {
      console.log('\n⭐ Review Stats:')
      const avgStars = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
      console.log(`- Average rating: ${avgStars.toFixed(1)} stars`)
      console.log(`- Total reviews: ${reviews.length}`)
    }
    
  } catch (error) {
    console.error('Error checking data:', error)
  }
}

checkData()
