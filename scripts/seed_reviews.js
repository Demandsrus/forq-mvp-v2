const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample review templates
const reviewTemplates = [
  // 5-star reviews
  {
    stars: 5,
    texts: [
      "Absolutely amazing! The food was incredible and the service was top-notch. Will definitely be back!",
      "Best meal I've had in ages. Everything was perfect from start to finish. Highly recommend!",
      "Outstanding quality and flavors. The atmosphere was perfect for a special dinner. 5 stars!",
      "Exceeded all expectations! Fresh ingredients, creative dishes, and friendly staff.",
      "Phenomenal experience! Every dish was a masterpiece. Can't wait to return!"
    ]
  },
  // 4-star reviews
  {
    stars: 4,
    texts: [
      "Really good food and nice atmosphere. Service was a bit slow but worth the wait.",
      "Great flavors and generous portions. Would come back for sure!",
      "Solid choice for dinner. Food was tasty and well-prepared. Recommended!",
      "Very good experience overall. A few minor issues but nothing major.",
      "Enjoyed our meal here. Good value for money and friendly service."
    ]
  },
  // 3-star reviews
  {
    stars: 3,
    texts: [
      "Decent food but nothing special. Service was okay. Might try again.",
      "Average experience. Food was fine but not memorable.",
      "It's alright. Some dishes were better than others. Mixed experience.",
      "Okay place for a quick meal. Nothing to write home about.",
      "Fair quality for the price. Could be better but not terrible."
    ]
  },
  // 2-star reviews
  {
    stars: 2,
    texts: [
      "Food was cold when it arrived. Service needs improvement.",
      "Disappointed with the quality. Expected much better for the price.",
      "Long wait times and mediocre food. Not impressed.",
      "Several issues with our order. Food was just okay.",
      "Below average experience. Probably won't return."
    ]
  },
  // 1-star reviews
  {
    stars: 1,
    texts: [
      "Terrible experience. Food was awful and service was worse.",
      "Completely disappointed. Would not recommend to anyone.",
      "Worst meal I've had in a long time. Avoid this place.",
      "Poor quality food and rude staff. Very unsatisfied.",
      "Waste of money. Everything was wrong with this order."
    ]
  }
]

// Generate random review based on restaurant rating
function generateReview(restaurantId, restaurantRating) {
  // Weight review distribution based on restaurant rating
  let starDistribution
  
  if (restaurantRating >= 4.5) {
    starDistribution = [0.02, 0.03, 0.05, 0.25, 0.65] // Mostly 4-5 stars
  } else if (restaurantRating >= 4.0) {
    starDistribution = [0.05, 0.05, 0.10, 0.35, 0.45] // Good mix, leaning positive
  } else if (restaurantRating >= 3.5) {
    starDistribution = [0.10, 0.10, 0.20, 0.35, 0.25] // More balanced
  } else {
    starDistribution = [0.20, 0.20, 0.25, 0.25, 0.10] // More negative reviews
  }
  
  // Select star rating based on distribution
  const random = Math.random()
  let cumulative = 0
  let selectedStars = 5
  
  for (let i = 0; i < starDistribution.length; i++) {
    cumulative += starDistribution[i]
    if (random <= cumulative) {
      selectedStars = i + 1
      break
    }
  }
  
  // Find matching template and select random text
  const template = reviewTemplates.find(t => t.stars === selectedStars)
  const randomText = template.texts[Math.floor(Math.random() * template.texts.length)]
  
  return {
    restaurant_id: restaurantId,
    stars: selectedStars,
    text: randomText
  }
}

async function seedReviews() {
  try {
    console.log('Starting to seed reviews...')
    
    // Get all restaurants
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, rating')
    
    if (restaurantError) {
      console.error('Error fetching restaurants:', restaurantError)
      throw restaurantError
    }
    
    if (!restaurants || restaurants.length === 0) {
      console.log('No restaurants found. Please seed restaurants first.')
      return
    }
    
    console.log(`Found ${restaurants.length} restaurants. Creating reviews...`)
    
    // Check if reviews already exist
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('restaurant_id')
    
    const restaurantsWithReviews = new Set(existingReviews?.map(r => r.restaurant_id) || [])
    
    const reviewsToInsert = []
    
    // Create 3-5 reviews for each restaurant that doesn't have reviews yet
    for (const restaurant of restaurants) {
      if (restaurantsWithReviews.has(restaurant.id)) {
        console.log(`Skipping ${restaurant.name} - already has reviews`)
        continue
      }
      
      const numReviews = 3 + Math.floor(Math.random() * 3) // 3-5 reviews
      
      for (let i = 0; i < numReviews; i++) {
        const review = generateReview(restaurant.id, restaurant.rating || 4.0)
        reviewsToInsert.push(review)
      }
    }
    
    if (reviewsToInsert.length === 0) {
      console.log('All restaurants already have reviews. Skipping review seed.')
      return
    }
    
    console.log(`Inserting ${reviewsToInsert.length} reviews...`)
    
    // Insert reviews in batches
    const batchSize = 100
    let insertedCount = 0
    
    for (let i = 0; i < reviewsToInsert.length; i += batchSize) {
      const batch = reviewsToInsert.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('reviews')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting review batch ${i / batchSize + 1}:`, error)
        throw error
      }
      
      insertedCount += batch.length
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(reviewsToInsert.length / batchSize)} (${insertedCount}/${reviewsToInsert.length} reviews)`)
    }
    
    console.log(`✅ Successfully seeded ${insertedCount} reviews!`)
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🌱 Starting review seeding...')
  
  await seedReviews()
  
  console.log('🎉 Review seeding completed successfully!')
  process.exit(0)
}

if (require.main === module) {
  main()
}

module.exports = { seedReviews }
