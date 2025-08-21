const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkNewDishes() {
  try {
    const { data: dishesWithPrices } = await supabase
      .from('dishes')
      .select('name, cuisine, price_cents, restaurant_id')
      .not('price_cents', 'is', null)
      .order('name')
      .limit(10)
    
    const { data: dishesWithoutPrices } = await supabase
      .from('dishes')
      .select('name, cuisine, price_cents')
      .is('price_cents', null)
      .limit(5)
    
    console.log('🍽️ Dishes WITH prices:')
    dishesWithPrices?.forEach(d => {
      console.log(`- ${d.name} (${d.cuisine}) - $${(d.price_cents/100).toFixed(2)}`)
    })
    
    console.log('\n🍽️ Dishes WITHOUT prices:')
    dishesWithoutPrices?.forEach(d => {
      console.log(`- ${d.name} (${d.cuisine}) - No price`)
    })
    
    console.log(`\nTotal dishes with prices: ${dishesWithPrices?.length || 0}`)
    console.log(`Total dishes without prices: ${dishesWithoutPrices?.length || 0}`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkNewDishes()
