const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Standard hours format for most restaurants
const standardHours = {
  "mon": [["11:00", "22:00"]],
  "tue": [["11:00", "22:00"]],
  "wed": [["11:00", "22:00"]],
  "thu": [["11:00", "22:00"]],
  "fri": [["11:00", "23:00"]],
  "sat": [["10:00", "23:00"]],
  "sun": [["10:00", "21:00"]]
}

const brunchHours = {
  "mon": [["08:00", "15:00"]],
  "tue": [["08:00", "15:00"]],
  "wed": [["08:00", "15:00"]],
  "thu": [["08:00", "15:00"]],
  "fri": [["08:00", "15:00"]],
  "sat": [["08:00", "16:00"]],
  "sun": [["08:00", "16:00"]]
}

const lateNightHours = {
  "mon": [["17:00", "02:00"]],
  "tue": [["17:00", "02:00"]],
  "wed": [["17:00", "02:00"]],
  "thu": [["17:00", "02:00"]],
  "fri": [["17:00", "03:00"]],
  "sat": [["17:00", "03:00"]],
  "sun": [["17:00", "01:00"]]
}

// Generate random rating between 4.0-4.8
const randomRating = () => Math.round((4.0 + Math.random() * 0.8) * 10) / 10

// Generate random review count between 200-2200
const randomReviewCount = () => Math.floor(200 + Math.random() * 2000)

// Generate platform restaurant ID
const generatePlatformId = (platform, index) => 
  `${platform}_${Date.now()}_${index}`

const restaurants = [
  // San Francisco Restaurants (15)
  {
    name: "Golden Gate Ramen",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 1),
    cuisine: "Japanese",
    address: "1234 Mission St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94103",
    lat: 37.7749,
    lng: -122.4194,
    hours: standardHours,
    atmosphere: "Cozy neighborhood ramen shop with authentic Japanese vibes",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/golden-gate-ramen",
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"
  },
  {
    name: "Sourdough & Co",
    platform: "doordash",
    platform_restaurant_id: generatePlatformId("doordash", 2),
    cuisine: "American",
    address: "567 Castro St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94114",
    lat: 37.7849,
    lng: -122.4294,
    hours: brunchHours,
    atmosphere: "Artisanal bakery with fresh sourdough and farm-to-table ingredients",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
  },
  {
    name: "Taco Libre",
    platform: "postmates",
    platform_restaurant_id: generatePlatformId("postmates", 3),
    cuisine: "Mexican",
    address: "890 Valencia St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94110",
    lat: 37.7649,
    lng: -122.4094,
    hours: standardHours,
    atmosphere: "Vibrant taqueria with authentic Mexican street food",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
  },
  {
    name: "Nonna's Kitchen",
    platform: "grubhub",
    platform_restaurant_id: generatePlatformId("grubhub", 4),
    cuisine: "Italian",
    address: "123 North Beach St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94133",
    lat: 37.8049,
    lng: -122.4094,
    hours: standardHours,
    atmosphere: "Family-owned Italian restaurant with traditional recipes",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/nonnas-kitchen-sf",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
  },
  {
    name: "Pho Saigon",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 5),
    cuisine: "Vietnamese",
    address: "456 Geary Blvd",
    city: "San Francisco",
    state: "CA",
    postal_code: "94118",
    lat: 37.7849,
    lng: -122.4594,
    hours: standardHours,
    atmosphere: "Authentic Vietnamese pho house with rich, flavorful broths",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400"
  },
  // Add more SF restaurants
  {
    name: "Dim Sum Palace",
    platform: "doordash",
    platform_restaurant_id: generatePlatformId("doordash", 6),
    cuisine: "Chinese",
    address: "789 Grant Ave",
    city: "San Francisco",
    state: "CA",
    postal_code: "94108",
    lat: 37.7949,
    lng: -122.4094,
    hours: {
      "mon": [["10:00", "15:00"], ["17:00", "22:00"]],
      "tue": [["10:00", "15:00"], ["17:00", "22:00"]],
      "wed": [["10:00", "15:00"], ["17:00", "22:00"]],
      "thu": [["10:00", "15:00"], ["17:00", "22:00"]],
      "fri": [["10:00", "15:00"], ["17:00", "23:00"]],
      "sat": [["09:00", "15:00"], ["17:00", "23:00"]],
      "sun": [["09:00", "15:00"], ["17:00", "22:00"]]
    },
    atmosphere: "Traditional dim sum restaurant in the heart of Chinatown",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/dim-sum-palace",
    image_url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400"
  },
  {
    name: "Green Bowl",
    platform: "postmates",
    platform_restaurant_id: generatePlatformId("postmates", 7),
    cuisine: "Healthy",
    address: "321 Fillmore St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94117",
    lat: 37.7749,
    lng: -122.4394,
    hours: brunchHours,
    atmosphere: "Fresh, organic bowls and smoothies for health-conscious diners",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"
  },
  {
    name: "Midnight Diner",
    platform: "grubhub",
    platform_restaurant_id: generatePlatformId("grubhub", 8),
    cuisine: "American",
    address: "654 Polk St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94102",
    lat: 37.7849,
    lng: -122.4194,
    hours: lateNightHours,
    atmosphere: "Classic late-night diner with comfort food and 24/7 service",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"
  },
  {
    name: "Spice Route",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 9),
    cuisine: "Indian",
    address: "987 Irving St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94122",
    lat: 37.7649,
    lng: -122.4694,
    hours: standardHours,
    atmosphere: "Aromatic Indian cuisine with traditional spices and modern presentation",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/spice-route-sf",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400"
  },
  {
    name: "Fisherman's Catch",
    platform: "doordash",
    platform_restaurant_id: generatePlatformId("doordash", 10),
    cuisine: "Seafood",
    address: "159 Jefferson St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94133",
    lat: 37.8079,
    lng: -122.4177,
    hours: standardHours,
    atmosphere: "Fresh seafood with stunning bay views at Fisherman's Wharf",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/fishermans-catch",
    image_url: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400"
  },
  // Los Angeles Restaurants
  {
    name: "Venice Beach Tacos",
    platform: "grubhub",
    platform_restaurant_id: generatePlatformId("grubhub", 16),
    cuisine: "Mexican",
    address: "1234 Abbot Kinney Blvd",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90291",
    lat: 34.0522,
    lng: -118.2437,
    hours: standardHours,
    atmosphere: "Beachside taco stand with fresh fish and California vibes",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400"
  },
  {
    name: "Hollywood Hills Bistro",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 17),
    cuisine: "American",
    address: "5678 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90028",
    lat: 34.0928,
    lng: -118.3287,
    hours: standardHours,
    atmosphere: "Upscale bistro with city views and celebrity spotting",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/hollywood-hills-bistro",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
  },
  {
    name: "K-Town BBQ",
    platform: "doordash",
    platform_restaurant_id: generatePlatformId("doordash", 18),
    cuisine: "Korean",
    address: "9012 Wilshire Blvd",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90010",
    lat: 34.0622,
    lng: -118.3037,
    hours: lateNightHours,
    atmosphere: "Authentic Korean BBQ in the heart of Koreatown",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400"
  },
  {
    name: "Little Tokyo Ramen",
    platform: "postmates",
    platform_restaurant_id: generatePlatformId("postmates", 19),
    cuisine: "Japanese",
    address: "345 E 2nd St",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90012",
    lat: 34.0522,
    lng: -118.2437,
    hours: standardHours,
    atmosphere: "Traditional ramen shop in historic Little Tokyo district",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400"
  },
  {
    name: "Beverly Hills Steakhouse",
    platform: "grubhub",
    platform_restaurant_id: generatePlatformId("grubhub", 20),
    cuisine: "American",
    address: "678 N Canon Dr",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90210",
    lat: 34.0736,
    lng: -118.4004,
    hours: {
      "mon": [["17:00", "22:00"]],
      "tue": [["17:00", "22:00"]],
      "wed": [["17:00", "22:00"]],
      "thu": [["17:00", "22:00"]],
      "fri": [["17:00", "23:00"]],
      "sat": [["17:00", "23:00"]],
      "sun": [["16:00", "21:00"]]
    },
    atmosphere: "Luxury steakhouse with premium cuts and extensive wine list",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/beverly-hills-steakhouse",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"
  },
  // Add more LA restaurants to reach 25 total
  {
    name: "Santa Monica Seafood",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 21),
    cuisine: "Seafood",
    address: "901 Santa Monica Pier",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90401",
    lat: 34.0195,
    lng: -118.4912,
    hours: standardHours,
    atmosphere: "Fresh seafood with ocean views on the iconic pier",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400"
  },
  {
    name: "Melrose Vegan Kitchen",
    platform: "doordash",
    platform_restaurant_id: generatePlatformId("doordash", 22),
    cuisine: "Healthy",
    address: "234 Melrose Ave",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90046",
    lat: 34.0836,
    lng: -118.3614,
    hours: brunchHours,
    atmosphere: "Plant-based cuisine with Instagram-worthy presentations",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"
  },
  {
    name: "Downtown Pizza Co",
    platform: "postmates",
    platform_restaurant_id: generatePlatformId("postmates", 23),
    cuisine: "Italian",
    address: "567 S Spring St",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90013",
    lat: 34.0522,
    lng: -118.2437,
    hours: lateNightHours,
    atmosphere: "New York-style pizza in the heart of downtown LA",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"
  },
  {
    name: "Thai Spice Garden",
    platform: "grubhub",
    platform_restaurant_id: generatePlatformId("grubhub", 24),
    cuisine: "Thai",
    address: "890 N Highland Ave",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90038",
    lat: 34.0928,
    lng: -118.3387,
    hours: standardHours,
    atmosphere: "Authentic Thai flavors with customizable spice levels",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400"
  },
  {
    name: "Malibu Farm Table",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 25),
    cuisine: "American",
    address: "123 Pacific Coast Hwy",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90265",
    lat: 34.0259,
    lng: -118.7798,
    hours: brunchHours,
    atmosphere: "Farm-to-table dining with stunning ocean views in Malibu",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/malibu-farm-table",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"
  },
  // Add more SF restaurants to balance
  {
    name: "Seoul Kitchen",
    platform: "postmates",
    platform_restaurant_id: generatePlatformId("postmates", 26),
    cuisine: "Korean",
    address: "753 Clement St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94118",
    lat: 37.7829,
    lng: -122.4644,
    hours: standardHours,
    atmosphere: "Authentic Korean BBQ and comfort food in a modern setting",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400"
  },
  {
    name: "The Burger Joint",
    platform: "grubhub",
    platform_restaurant_id: generatePlatformId("grubhub", 27),
    cuisine: "American",
    address: "852 Divisadero St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94117",
    lat: 37.7749,
    lng: -122.4394,
    hours: standardHours,
    atmosphere: "Gourmet burgers with locally sourced ingredients and craft beer",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
  },
  {
    name: "Mediterranean Breeze",
    platform: "ubereats",
    platform_restaurant_id: generatePlatformId("ubereats", 28),
    cuisine: "Mediterranean",
    address: "741 Union St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94133",
    lat: 37.7999,
    lng: -122.4144,
    hours: standardHours,
    atmosphere: "Fresh Mediterranean flavors with olive oils and herbs",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/mediterranean-breeze",
    image_url: "https://images.unsplash.com/photo-1544510808-5c4ac4d5ac9d?w=400"
  },
  {
    name: "Sushi Zen",
    platform: "doordash",
    platform_restaurant_id: generatePlatformId("doordash", 29),
    cuisine: "Japanese",
    address: "963 Lombard St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94133",
    lat: 37.8019,
    lng: -122.4194,
    hours: {
      "mon": [["17:00", "22:00"]],
      "tue": [["17:00", "22:00"]],
      "wed": [["17:00", "22:00"]],
      "thu": [["17:00", "22:00"]],
      "fri": [["17:00", "23:00"]],
      "sat": [["17:00", "23:00"]],
      "sun": [["17:00", "21:00"]]
    },
    atmosphere: "Intimate sushi bar with omakase and premium sake selection",
    rating: randomRating(),
    review_count: randomReviewCount(),
    reservation_url: "https://www.opentable.com/sushi-zen-sf",
    image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"
  },
  {
    name: "Café Bohème",
    platform: "postmates",
    platform_restaurant_id: generatePlatformId("postmates", 30),
    cuisine: "French",
    address: "147 Columbus Ave",
    city: "San Francisco",
    state: "CA",
    postal_code: "94133",
    lat: 37.7979,
    lng: -122.4074,
    hours: brunchHours,
    atmosphere: "Charming French café with pastries and artisanal coffee",
    rating: randomRating(),
    review_count: randomReviewCount(),
    image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"
  }
]

// Sample dishes for each restaurant (4-6 dishes per restaurant)
const dishTemplates = [
  // Japanese dishes
  {
    names: ["Chicken Teriyaki Bowl", "Salmon Sashimi", "Miso Ramen", "California Roll", "Beef Udon", "Tempura Platter"],
    cuisine: "Japanese",
    diet_tags: [["gluten_free"], ["keto"], [], ["vegetarian"], [], ["vegetarian"]],
    allergens: [["soy"], ["fish"], ["soy", "gluten"], ["fish"], ["soy", "gluten"], ["gluten"]],
    spice: [1, 0, 2, 0, 1, 0],
    macros: [
      { kcal: 420, protein: 35, carbs: 45, fat: 12 },
      { kcal: 180, protein: 25, carbs: 0, fat: 8 },
      { kcal: 380, protein: 18, carbs: 42, fat: 14 },
      { kcal: 250, protein: 8, carbs: 38, fat: 7 },
      { kcal: 450, protein: 28, carbs: 52, fat: 16 },
      { kcal: 320, protein: 12, carbs: 35, fat: 18 }
    ],
    taste: [
      { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.3 },
      { sweet_savory: 0.2, herby_umami: 0.9, crunchy_soft: 0.8 },
      { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.4 },
      { sweet_savory: 0.4, herby_umami: 0.6, crunchy_soft: 0.5 },
      { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.3 },
      { sweet_savory: 0.3, herby_umami: 0.5, crunchy_soft: 0.8 }
    ],
    prices: [1299, 1899, 1599, 899, 1699, 1499]
  },
  // American dishes
  {
    names: ["Classic Cheeseburger", "BBQ Ribs", "Caesar Salad", "Fish & Chips", "Buffalo Wings", "Apple Pie"],
    cuisine: "American",
    diet_tags: [[], [], ["vegetarian"], [], [], ["vegetarian"]],
    allergens: [["dairy", "gluten"], [], ["dairy"], ["fish", "gluten"], [], ["dairy", "gluten"]],
    spice: [0, 2, 0, 0, 3, 0],
    macros: [
      { kcal: 650, protein: 35, carbs: 45, fat: 38 },
      { kcal: 720, protein: 45, carbs: 25, fat: 48 },
      { kcal: 280, protein: 12, carbs: 15, fat: 22 },
      { kcal: 580, protein: 32, carbs: 55, fat: 28 },
      { kcal: 420, protein: 28, carbs: 8, fat: 32 },
      { kcal: 350, protein: 4, carbs: 58, fat: 14 }
    ],
    taste: [
      { sweet_savory: 0.6, herby_umami: 0.7, crunchy_soft: 0.4 },
      { sweet_savory: 0.8, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.2, herby_umami: 0.6, crunchy_soft: 0.7 },
      { sweet_savory: 0.3, herby_umami: 0.5, crunchy_soft: 0.8 },
      { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.6 },
      { sweet_savory: 0.9, herby_umami: 0.2, crunchy_soft: 0.3 }
    ],
    prices: [1599, 2299, 1299, 1799, 1399, 899]
  },
  // Mexican dishes
  {
    names: ["Carne Asada Tacos", "Chicken Quesadilla", "Guacamole & Chips", "Beef Burrito", "Elote", "Churros"],
    cuisine: "Mexican",
    diet_tags: [[], [], ["vegan"], [], ["vegetarian"], ["vegetarian"]],
    allergens: [[], ["dairy"], [], ["dairy"], ["dairy"], ["gluten"]],
    spice: [2, 1, 1, 2, 1, 0],
    macros: [
      { kcal: 480, protein: 32, carbs: 35, fat: 24 },
      { kcal: 520, protein: 28, carbs: 42, fat: 28 },
      { kcal: 320, protein: 6, carbs: 28, fat: 22 },
      { kcal: 680, protein: 35, carbs: 65, fat: 32 },
      { kcal: 180, protein: 4, carbs: 22, fat: 9 },
      { kcal: 280, protein: 4, carbs: 38, fat: 12 }
    ],
    taste: [
      { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.4 },
      { sweet_savory: 0.5, herby_umami: 0.7, crunchy_soft: 0.3 },
      { sweet_savory: 0.2, herby_umami: 0.6, crunchy_soft: 0.8 },
      { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.6, herby_umami: 0.5, crunchy_soft: 0.7 },
      { sweet_savory: 0.9, herby_umami: 0.1, crunchy_soft: 0.6 }
    ],
    prices: [1199, 1399, 899, 1599, 699, 599]
  },
  // Italian dishes
  {
    names: ["Margherita Pizza", "Spaghetti Carbonara", "Caesar Salad", "Tiramisu", "Lasagna", "Bruschetta"],
    cuisine: "Italian",
    diet_tags: [["vegetarian"], [], ["vegetarian"], ["vegetarian"], [], ["vegetarian"]],
    allergens: [["dairy", "gluten"], ["dairy", "gluten"], ["dairy"], ["dairy"], ["dairy", "gluten"], ["gluten"]],
    spice: [0, 0, 0, 0, 1, 0],
    macros: [
      { kcal: 520, protein: 22, carbs: 65, fat: 18 },
      { kcal: 580, protein: 25, carbs: 68, fat: 24 },
      { kcal: 280, protein: 12, carbs: 15, fat: 22 },
      { kcal: 320, protein: 6, carbs: 35, fat: 18 },
      { kcal: 650, protein: 35, carbs: 45, fat: 38 },
      { kcal: 180, protein: 6, carbs: 22, fat: 8 }
    ],
    taste: [
      { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.3 },
      { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.2, herby_umami: 0.6, crunchy_soft: 0.7 },
      { sweet_savory: 0.8, herby_umami: 0.3, crunchy_soft: 0.4 },
      { sweet_savory: 0.5, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.8 }
    ],
    prices: [1899, 1699, 1299, 899, 2199, 799]
  },
  // Vietnamese dishes
  {
    names: ["Pho Bo", "Banh Mi", "Spring Rolls", "Vermicelli Bowl", "Vietnamese Coffee", "Lemongrass Chicken"],
    cuisine: "Vietnamese",
    diet_tags: [[], [], ["vegan"], [], ["vegetarian"], []],
    allergens: [[], ["gluten"], [], [], [], []],
    spice: [1, 0, 0, 1, 0, 2],
    macros: [
      { kcal: 350, protein: 25, carbs: 45, fat: 8 },
      { kcal: 420, protein: 18, carbs: 55, fat: 12 },
      { kcal: 180, protein: 4, carbs: 25, fat: 6 },
      { kcal: 380, protein: 22, carbs: 48, fat: 10 },
      { kcal: 120, protein: 2, carbs: 18, fat: 4 },
      { kcal: 320, protein: 28, carbs: 15, fat: 18 }
    ],
    taste: [
      { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.2 },
      { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.6 },
      { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.7 },
      { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.3 },
      { sweet_savory: 0.8, herby_umami: 0.2, crunchy_soft: 0.1 },
      { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.4 }
    ],
    prices: [1399, 1199, 899, 1499, 599, 1699]
  },
  // Chinese dishes
  {
    names: ["Kung Pao Chicken", "Fried Rice", "Dumplings", "Sweet & Sour Pork", "Hot Pot", "Peking Duck"],
    cuisine: "Chinese",
    diet_tags: [[], [], [], [], [], []],
    allergens: [["peanuts"], [], [], [], [], []],
    spice: [3, 0, 0, 1, 2, 0],
    macros: [
      { kcal: 480, protein: 32, carbs: 35, fat: 24 },
      { kcal: 420, protein: 12, carbs: 65, fat: 14 },
      { kcal: 280, protein: 14, carbs: 32, fat: 12 },
      { kcal: 520, protein: 28, carbs: 58, fat: 18 },
      { kcal: 380, protein: 25, carbs: 20, fat: 22 },
      { kcal: 450, protein: 35, carbs: 15, fat: 28 }
    ],
    taste: [
      { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.6 },
      { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.2 },
      { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.4 },
      { sweet_savory: 0.8, herby_umami: 0.6, crunchy_soft: 0.3 },
      { sweet_savory: 0.2, herby_umami: 0.9, crunchy_soft: 0.3 },
      { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.5 }
    ],
    prices: [1599, 1299, 1199, 1699, 2499, 2899]
  },
  // Healthy dishes
  {
    names: ["Quinoa Buddha Bowl", "Acai Bowl", "Green Smoothie", "Kale Salad", "Protein Bowl", "Avocado Toast"],
    cuisine: "Healthy",
    diet_tags: [["vegan"], ["vegan"], ["vegan"], ["vegan"], [], ["vegetarian"]],
    allergens: [[], [], [], [], [], ["gluten"]],
    spice: [0, 0, 0, 0, 0, 0],
    macros: [
      { kcal: 420, protein: 18, carbs: 55, fat: 16 },
      { kcal: 280, protein: 6, carbs: 45, fat: 8 },
      { kcal: 180, protein: 4, carbs: 28, fat: 6 },
      { kcal: 220, protein: 8, carbs: 18, fat: 14 },
      { kcal: 380, protein: 32, carbs: 25, fat: 18 },
      { kcal: 320, protein: 12, carbs: 35, fat: 18 }
    ],
    taste: [
      { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.7 },
      { sweet_savory: 0.8, herby_umami: 0.2, crunchy_soft: 0.4 },
      { sweet_savory: 0.6, herby_umami: 0.4, crunchy_soft: 0.1 },
      { sweet_savory: 0.2, herby_umami: 0.7, crunchy_soft: 0.8 },
      { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.5 },
      { sweet_savory: 0.4, herby_umami: 0.5, crunchy_soft: 0.6 }
    ],
    prices: [1599, 1299, 899, 1399, 1799, 1199]
  },
  // Indian dishes
  {
    names: ["Chicken Tikka Masala", "Palak Paneer", "Biryani", "Naan Bread", "Samosas", "Mango Lassi"],
    cuisine: "Indian",
    diet_tags: [[], ["vegetarian"], [], ["vegetarian"], ["vegetarian"], ["vegetarian"]],
    allergens: [["dairy"], ["dairy"], [], ["gluten", "dairy"], [], ["dairy"]],
    spice: [2, 1, 1, 0, 1, 0],
    macros: [
      { kcal: 520, protein: 35, carbs: 25, fat: 32 },
      { kcal: 380, protein: 18, carbs: 22, fat: 28 },
      { kcal: 450, protein: 22, carbs: 65, fat: 12 },
      { kcal: 280, protein: 8, carbs: 45, fat: 8 },
      { kcal: 220, protein: 6, carbs: 28, fat: 10 },
      { kcal: 180, protein: 6, carbs: 32, fat: 4 }
    ],
    taste: [
      { sweet_savory: 0.6, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.3 },
      { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.3, herby_umami: 0.5, crunchy_soft: 0.4 },
      { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.8 },
      { sweet_savory: 0.8, herby_umami: 0.2, crunchy_soft: 0.1 }
    ],
    prices: [1899, 1699, 1999, 599, 899, 699]
  },
  // Seafood dishes
  {
    names: ["Grilled Salmon", "Fish Tacos", "Clam Chowder", "Lobster Roll", "Shrimp Scampi", "Crab Cakes"],
    cuisine: "Seafood",
    diet_tags: [["keto"], [], [], [], [], []],
    allergens: [["fish"], ["fish"], ["fish", "dairy"], ["fish", "gluten"], ["fish", "dairy"], ["fish"]],
    spice: [0, 1, 0, 0, 1, 0],
    macros: [
      { kcal: 380, protein: 42, carbs: 5, fat: 20 },
      { kcal: 420, protein: 28, carbs: 35, fat: 18 },
      { kcal: 320, protein: 18, carbs: 25, fat: 18 },
      { kcal: 480, protein: 32, carbs: 38, fat: 22 },
      { kcal: 450, protein: 35, carbs: 15, fat: 28 },
      { kcal: 380, protein: 28, carbs: 18, fat: 22 }
    ],
    taste: [
      { sweet_savory: 0.2, herby_umami: 0.8, crunchy_soft: 0.3 },
      { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.6 },
      { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.4 },
      { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.2 },
      { sweet_savory: 0.2, herby_umami: 0.8, crunchy_soft: 0.7 }
    ],
    prices: [2299, 1599, 1299, 2899, 2199, 1999]
  }
]

async function seedRestaurants() {
  try {
    console.log('Starting to seed restaurants...')

    // Check if restaurants already exist to avoid duplicates
    const { data: existingRestaurants } = await supabase
      .from('restaurants')
      .select('platform_restaurant_id')

    const existingIds = new Set(existingRestaurants?.map(r => r.platform_restaurant_id) || [])

    // Filter out restaurants that already exist
    const newRestaurants = restaurants.filter(restaurant => !existingIds.has(restaurant.platform_restaurant_id))

    if (newRestaurants.length === 0) {
      console.log('All restaurants already exist. Skipping restaurant seed.')
      return []
    }

    console.log(`Inserting ${newRestaurants.length} new restaurants...`)

    // Insert restaurants
    const { data: insertedRestaurants, error } = await supabase
      .from('restaurants')
      .insert(newRestaurants)
      .select()

    if (error) {
      console.error('Error inserting restaurants:', error)
      throw error
    }

    console.log(`✅ Successfully seeded ${insertedRestaurants?.length || 0} restaurants!`)
    return insertedRestaurants || []

  } catch (error) {
    console.error('❌ Error seeding restaurants:', error)
    process.exit(1)
  }
}

async function seedDishes() {
  try {
    console.log('Starting to seed dishes...')

    // Get all restaurants
    const { data: allRestaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')

    if (restaurantError) {
      console.error('Error fetching restaurants:', restaurantError)
      throw restaurantError
    }

    if (!allRestaurants || allRestaurants.length === 0) {
      console.log('No restaurants found. Please seed restaurants first.')
      return
    }

    console.log(`Found ${allRestaurants.length} restaurants. Creating dishes...`)

    const dishesToInsert = []

    // Create 4-6 dishes for each restaurant
    for (const restaurant of allRestaurants) {
      // Find matching dish template based on cuisine
      let template = dishTemplates.find(t => t.cuisine === restaurant.cuisine)

      // Fallback to American if cuisine not found
      if (!template) {
        template = dishTemplates.find(t => t.cuisine === "American")
      }

      // Create 4-6 dishes per restaurant
      const numDishes = 4 + Math.floor(Math.random() * 3) // 4-6 dishes

      for (let i = 0; i < numDishes && i < template.names.length; i++) {
        const dish = {
          name: template.names[i],
          cuisine: template.cuisine,
          diet_tags: template.diet_tags[i],
          allergens: template.allergens[i],
          spice: template.spice[i],
          macros: template.macros[i],
          taste: template.taste[i],
          url: `https://${restaurant.platform}.com/restaurant/${restaurant.platform_restaurant_id}/dish/${i + 1}`,
          image_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400`,
          restaurant_id: restaurant.id,
          platform: restaurant.platform,
          price_cents: template.prices[i]
        }

        dishesToInsert.push(dish)
      }
    }

    console.log(`Inserting ${dishesToInsert.length} dishes...`)

    // Insert dishes in batches to avoid timeout
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < dishesToInsert.length; i += batchSize) {
      const batch = dishesToInsert.slice(i, i + batchSize)

      const { error } = await supabase
        .from('dishes')
        .insert(batch)

      if (error) {
        console.error(`Error inserting dish batch ${i / batchSize + 1}:`, error)
        throw error
      }

      insertedCount += batch.length
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(dishesToInsert.length / batchSize)} (${insertedCount}/${dishesToInsert.length} dishes)`)
    }

    console.log(`✅ Successfully seeded ${insertedCount} dishes!`)

  } catch (error) {
    console.error('❌ Error seeding dishes:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🌱 Starting restaurant and dish seeding...')

  // Seed restaurants first
  await seedRestaurants()

  // Then seed dishes
  await seedDishes()

  console.log('🎉 All seeding completed successfully!')
  process.exit(0)
}

if (require.main === module) {
  main()
}

module.exports = { seedRestaurants, seedDishes }
