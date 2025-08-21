const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const dishes = [
  // Japanese (10 dishes)
  {
    name: 'Chicken Teriyaki Bowl',
    cuisine: 'Japanese',
    diet_tags: ['gluten_free'],
    allergens: ['soy'],
    spice: 1,
    macros: { kcal: 420, protein: 35, carbs: 45, fat: 12 },
    taste: { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.3 },
    url: 'https://example.com/chicken-teriyaki',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'
  },
  {
    name: 'Salmon Sashimi',
    cuisine: 'Japanese',
    diet_tags: ['pescetarian', 'gluten_free'],
    allergens: [],
    spice: 0,
    macros: { kcal: 180, protein: 25, carbs: 2, fat: 8 },
    taste: { sweet_savory: 0.2, herby_umami: 0.9, crunchy_soft: 0.8 },
    url: 'https://example.com/salmon-sashimi',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'
  },
  {
    name: 'Vegetable Tempura',
    cuisine: 'Japanese',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'eggs'],
    spice: 0,
    macros: { kcal: 320, protein: 8, carbs: 35, fat: 18 },
    taste: { sweet_savory: 0.3, herby_umami: 0.4, crunchy_soft: 0.9 },
    url: 'https://example.com/vegetable-tempura',
    image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400'
  },
  {
    name: 'Miso Ramen',
    cuisine: 'Japanese',
    diet_tags: [],
    allergens: ['gluten', 'soy', 'eggs'],
    spice: 2,
    macros: { kcal: 450, protein: 20, carbs: 55, fat: 15 },
    taste: { sweet_savory: 0.4, herby_umami: 0.9, crunchy_soft: 0.2 },
    url: 'https://example.com/miso-ramen',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
  },
  {
    name: 'Tofu Katsu Curry',
    cuisine: 'Japanese',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'soy'],
    spice: 2,
    macros: { kcal: 380, protein: 18, carbs: 48, fat: 14 },
    taste: { sweet_savory: 0.6, herby_umami: 0.7, crunchy_soft: 0.7 },
    url: 'https://example.com/tofu-katsu-curry',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    name: 'Chirashi Bowl',
    cuisine: 'Japanese',
    diet_tags: ['pescetarian'],
    allergens: ['soy'],
    spice: 1,
    macros: { kcal: 350, protein: 28, carbs: 40, fat: 10 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.4 },
    url: 'https://example.com/chirashi-bowl',
    image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400'
  },
  {
    name: 'Beef Yakitori',
    cuisine: 'Japanese',
    diet_tags: ['gluten_free'],
    allergens: ['soy'],
    spice: 1,
    macros: { kcal: 280, protein: 32, carbs: 8, fat: 14 },
    taste: { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/beef-yakitori',
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400'
  },
  {
    name: 'Agedashi Tofu',
    cuisine: 'Japanese',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'soy'],
    spice: 0,
    macros: { kcal: 220, protein: 12, carbs: 18, fat: 12 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.3 },
    url: 'https://example.com/agedashi-tofu',
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400'
  },
  {
    name: 'Unagi Don',
    cuisine: 'Japanese',
    diet_tags: ['pescetarian'],
    allergens: ['soy', 'gluten'],
    spice: 1,
    macros: { kcal: 480, protein: 25, carbs: 52, fat: 18 },
    taste: { sweet_savory: 0.8, herby_umami: 0.9, crunchy_soft: 0.2 },
    url: 'https://example.com/unagi-don',
    image_url: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=400'
  },
  {
    name: 'Edamame',
    cuisine: 'Japanese',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: ['soy'],
    spice: 0,
    macros: { kcal: 120, protein: 11, carbs: 9, fat: 5 },
    taste: { sweet_savory: 0.3, herby_umami: 0.5, crunchy_soft: 0.6 },
    url: 'https://example.com/edamame',
    image_url: 'https://images.unsplash.com/photo-1609501676725-7186f734b2b0?w=400'
  },

  // Thai (10 dishes)
  {
    name: 'Pad Thai',
    cuisine: 'Thai',
    diet_tags: [],
    allergens: ['shellfish', 'peanuts', 'eggs'],
    spice: 3,
    macros: { kcal: 400, protein: 18, carbs: 50, fat: 16 },
    taste: { sweet_savory: 0.7, herby_umami: 0.6, crunchy_soft: 0.5 },
    url: 'https://example.com/pad-thai',
    image_url: 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400'
  },
  {
    name: 'Green Curry with Chicken',
    cuisine: 'Thai',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 4,
    macros: { kcal: 380, protein: 28, carbs: 15, fat: 24 },
    taste: { sweet_savory: 0.5, herby_umami: 0.8, crunchy_soft: 0.3 },
    url: 'https://example.com/green-curry-chicken',
    image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400'
  },
  {
    name: 'Tom Yum Soup',
    cuisine: 'Thai',
    diet_tags: ['gluten_free'],
    allergens: ['shellfish'],
    spice: 4,
    macros: { kcal: 150, protein: 12, carbs: 8, fat: 6 },
    taste: { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.2 },
    url: 'https://example.com/tom-yum-soup',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },
  {
    name: 'Mango Sticky Rice',
    cuisine: 'Thai',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 0,
    macros: { kcal: 320, protein: 4, carbs: 68, fat: 8 },
    taste: { sweet_savory: 0.9, herby_umami: 0.1, crunchy_soft: 0.2 },
    url: 'https://example.com/mango-sticky-rice',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Massaman Curry',
    cuisine: 'Thai',
    diet_tags: ['gluten_free'],
    allergens: ['peanuts'],
    spice: 2,
    macros: { kcal: 420, protein: 25, carbs: 20, fat: 28 },
    taste: { sweet_savory: 0.6, herby_umami: 0.7, crunchy_soft: 0.3 },
    url: 'https://example.com/massaman-curry',
    image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400'
  },

  // Add a few more key dishes for testing
  {
    name: 'Chicken Tikka Masala',
    cuisine: 'Indian',
    diet_tags: ['gluten_free'],
    allergens: ['dairy'],
    spice: 3,
    macros: { kcal: 450, protein: 35, carbs: 18, fat: 28 },
    taste: { sweet_savory: 0.6, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/chicken-tikka-masala',
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400'
  },
  {
    name: 'Margherita Pizza',
    cuisine: 'Italian',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy'],
    spice: 0,
    macros: { kcal: 380, protein: 16, carbs: 45, fat: 16 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.7 },
    url: 'https://example.com/margherita-pizza',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    name: 'Chicken Tacos',
    cuisine: 'Mexican',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 2,
    macros: { kcal: 320, protein: 25, carbs: 28, fat: 12 },
    taste: { sweet_savory: 0.4, herby_umami: 0.6, crunchy_soft: 0.7 },
    url: 'https://example.com/chicken-tacos',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c18?w=400'
  },
  {
    name: 'Greek Salad',
    cuisine: 'Mediterranean',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 0,
    macros: { kcal: 220, protein: 8, carbs: 15, fat: 16 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.8 },
    url: 'https://example.com/greek-salad',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Kimchi Fried Rice',
    cuisine: 'Korean',
    diet_tags: ['gluten_free'],
    allergens: ['soy', 'eggs'],
    spice: 3,
    macros: { kcal: 350, protein: 15, carbs: 45, fat: 12 },
    taste: { sweet_savory: 0.4, herby_umami: 0.9, crunchy_soft: 0.4 },
    url: 'https://example.com/kimchi-fried-rice',
    image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
  },
  {
    name: 'Kung Pao Chicken',
    cuisine: 'Chinese',
    diet_tags: ['gluten_free'],
    allergens: ['peanuts', 'soy'],
    spice: 3,
    macros: { kcal: 380, protein: 28, carbs: 18, fat: 22 },
    taste: { sweet_savory: 0.5, herby_umami: 0.8, crunchy_soft: 0.7 },
    url: 'https://example.com/kung-pao-chicken',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Pho',
    cuisine: 'Vietnamese',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 1,
    macros: { kcal: 350, protein: 20, carbs: 45, fat: 8 },
    taste: { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.2 },
    url: 'https://example.com/pho',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },
  {
    name: 'Classic Burger',
    cuisine: 'American',
    diet_tags: [],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 1,
    macros: { kcal: 520, protein: 28, carbs: 42, fat: 28 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.6 },
    url: 'https://example.com/classic-burger',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Shawarma',
    cuisine: 'Middle Eastern',
    diet_tags: [],
    allergens: ['gluten', 'dairy'],
    spice: 2,
    macros: { kcal: 420, protein: 28, carbs: 35, fat: 20 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/shawarma',
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400'
  },

  // More Thai dishes
  {
    name: 'Papaya Salad',
    cuisine: 'Thai',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: ['peanuts'],
    spice: 4,
    macros: { kcal: 180, protein: 3, carbs: 25, fat: 8 },
    taste: { sweet_savory: 0.6, herby_umami: 0.4, crunchy_soft: 0.8 },
    url: 'https://example.com/papaya-salad',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
  },
  {
    name: 'Thai Basil Beef',
    cuisine: 'Thai',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 4,
    macros: { kcal: 350, protein: 30, carbs: 12, fat: 20 },
    taste: { sweet_savory: 0.4, herby_umami: 0.9, crunchy_soft: 0.4 },
    url: 'https://example.com/thai-basil-beef',
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400'
  },
  {
    name: 'Coconut Rice',
    cuisine: 'Thai',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 0,
    macros: { kcal: 280, protein: 4, carbs: 45, fat: 12 },
    taste: { sweet_savory: 0.7, herby_umami: 0.2, crunchy_soft: 0.1 },
    url: 'https://example.com/coconut-rice',
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'
  },
  {
    name: 'Larb Gai',
    cuisine: 'Thai',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 3,
    macros: { kcal: 220, protein: 25, carbs: 8, fat: 10 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/larb-gai',
    image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400'
  },
  {
    name: 'Pad See Ew',
    cuisine: 'Thai',
    diet_tags: [],
    allergens: ['gluten', 'soy', 'eggs'],
    spice: 1,
    macros: { kcal: 380, protein: 15, carbs: 55, fat: 12 },
    taste: { sweet_savory: 0.6, herby_umami: 0.7, crunchy_soft: 0.3 },
    url: 'https://example.com/pad-see-ew',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },

  // More Indian dishes
  {
    name: 'Dal Tadka',
    cuisine: 'Indian',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 2,
    macros: { kcal: 220, protein: 12, carbs: 35, fat: 6 },
    taste: { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.1 },
    url: 'https://example.com/dal-tadka',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'
  },
  {
    name: 'Palak Paneer',
    cuisine: 'Indian',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 2,
    macros: { kcal: 320, protein: 18, carbs: 12, fat: 24 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/palak-paneer',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'
  },
  {
    name: 'Biryani',
    cuisine: 'Indian',
    diet_tags: ['gluten_free'],
    allergens: ['dairy'],
    spice: 3,
    macros: { kcal: 480, protein: 25, carbs: 65, fat: 15 },
    taste: { sweet_savory: 0.5, herby_umami: 0.9, crunchy_soft: 0.3 },
    url: 'https://example.com/biryani',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Samosas',
    cuisine: 'Indian',
    diet_tags: ['vegetarian'],
    allergens: ['gluten'],
    spice: 2,
    macros: { kcal: 280, protein: 6, carbs: 35, fat: 14 },
    taste: { sweet_savory: 0.4, herby_umami: 0.6, crunchy_soft: 0.9 },
    url: 'https://example.com/samosas',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400'
  },
  {
    name: 'Tandoori Chicken',
    cuisine: 'Indian',
    diet_tags: ['gluten_free'],
    allergens: ['dairy'],
    spice: 4,
    macros: { kcal: 350, protein: 40, carbs: 5, fat: 18 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/tandoori-chicken',
    image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400'
  },
  {
    name: 'Chana Masala',
    cuisine: 'Indian',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 3,
    macros: { kcal: 250, protein: 12, carbs: 40, fat: 8 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.2 },
    url: 'https://example.com/chana-masala',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'
  },
  {
    name: 'Naan Bread',
    cuisine: 'Indian',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 0,
    macros: { kcal: 320, protein: 9, carbs: 55, fat: 8 },
    taste: { sweet_savory: 0.5, herby_umami: 0.3, crunchy_soft: 0.1 },
    url: 'https://example.com/naan-bread',
    image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400'
  },
  {
    name: 'Mango Lassi',
    cuisine: 'Indian',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 0,
    macros: { kcal: 180, protein: 6, carbs: 32, fat: 4 },
    taste: { sweet_savory: 0.9, herby_umami: 0.1, crunchy_soft: 0.0 },
    url: 'https://example.com/mango-lassi',
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400'
  },
  {
    name: 'Butter Chicken',
    cuisine: 'Indian',
    diet_tags: ['gluten_free'],
    allergens: ['dairy'],
    spice: 2,
    macros: { kcal: 420, protein: 32, carbs: 12, fat: 28 },
    taste: { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/butter-chicken',
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400'
  },

  // More Mexican dishes
  {
    name: 'Guacamole',
    cuisine: 'Mexican',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 1,
    macros: { kcal: 180, protein: 3, carbs: 12, fat: 16 },
    taste: { sweet_savory: 0.2, herby_umami: 0.6, crunchy_soft: 0.3 },
    url: 'https://example.com/guacamole',
    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400'
  },
  {
    name: 'Beef Burrito',
    cuisine: 'Mexican',
    diet_tags: [],
    allergens: ['gluten', 'dairy'],
    spice: 2,
    macros: { kcal: 520, protein: 28, carbs: 55, fat: 22 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.3 },
    url: 'https://example.com/beef-burrito',
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'
  },
  {
    name: 'Elote (Mexican Street Corn)',
    cuisine: 'Mexican',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 2,
    macros: { kcal: 220, protein: 6, carbs: 32, fat: 10 },
    taste: { sweet_savory: 0.6, herby_umami: 0.5, crunchy_soft: 0.8 },
    url: 'https://example.com/elote',
    image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400'
  },
  {
    name: 'Pozole',
    cuisine: 'Mexican',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 3,
    macros: { kcal: 280, protein: 20, carbs: 25, fat: 12 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.4 },
    url: 'https://example.com/pozole',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    name: 'Quesadilla',
    cuisine: 'Mexican',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy'],
    spice: 1,
    macros: { kcal: 380, protein: 18, carbs: 35, fat: 20 },
    taste: { sweet_savory: 0.4, herby_umami: 0.6, crunchy_soft: 0.7 },
    url: 'https://example.com/quesadilla',
    image_url: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400'
  },
  {
    name: 'Carnitas',
    cuisine: 'Mexican',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 2,
    macros: { kcal: 420, protein: 35, carbs: 8, fat: 28 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/carnitas',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c18?w=400'
  },
  {
    name: 'Black Bean Soup',
    cuisine: 'Mexican',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 2,
    macros: { kcal: 200, protein: 12, carbs: 32, fat: 4 },
    taste: { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.1 },
    url: 'https://example.com/black-bean-soup',
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'
  },
  {
    name: 'Churros',
    cuisine: 'Mexican',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'eggs', 'dairy'],
    spice: 0,
    macros: { kcal: 350, protein: 5, carbs: 45, fat: 18 },
    taste: { sweet_savory: 0.9, herby_umami: 0.1, crunchy_soft: 0.8 },
    url: 'https://example.com/churros',
    image_url: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=400'
  },
  {
    name: 'Fish Tacos',
    cuisine: 'Mexican',
    diet_tags: ['pescetarian'],
    allergens: ['gluten'],
    spice: 2,
    macros: { kcal: 290, protein: 22, carbs: 25, fat: 12 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.7 },
    url: 'https://example.com/fish-tacos',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c18?w=400'
  },

  // More Mediterranean dishes
  {
    name: 'Hummus with Pita',
    cuisine: 'Mediterranean',
    diet_tags: ['vegan'],
    allergens: ['gluten', 'sesame'],
    spice: 0,
    macros: { kcal: 280, protein: 10, carbs: 35, fat: 12 },
    taste: { sweet_savory: 0.2, herby_umami: 0.7, crunchy_soft: 0.3 },
    url: 'https://example.com/hummus-pita',
    image_url: 'https://images.unsplash.com/photo-1571197119282-7c4e2b8b3d8e?w=400'
  },
  {
    name: 'Grilled Salmon',
    cuisine: 'Mediterranean',
    diet_tags: ['pescetarian', 'gluten_free'],
    allergens: [],
    spice: 1,
    macros: { kcal: 350, protein: 35, carbs: 5, fat: 20 },
    taste: { sweet_savory: 0.2, herby_umami: 0.8, crunchy_soft: 0.4 },
    url: 'https://example.com/grilled-salmon',
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
  },
  {
    name: 'Falafel',
    cuisine: 'Mediterranean',
    diet_tags: ['vegan'],
    allergens: ['gluten', 'sesame'],
    spice: 1,
    macros: { kcal: 320, protein: 14, carbs: 32, fat: 16 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.8 },
    url: 'https://example.com/falafel',
    image_url: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=400'
  },
  {
    name: 'Tabbouleh',
    cuisine: 'Mediterranean',
    diet_tags: ['vegan'],
    allergens: ['gluten'],
    spice: 0,
    macros: { kcal: 150, protein: 4, carbs: 22, fat: 6 },
    taste: { sweet_savory: 0.2, herby_umami: 0.9, crunchy_soft: 0.6 },
    url: 'https://example.com/tabbouleh',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Lamb Gyros',
    cuisine: 'Mediterranean',
    diet_tags: [],
    allergens: ['gluten', 'dairy'],
    spice: 2,
    macros: { kcal: 420, protein: 28, carbs: 35, fat: 20 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/lamb-gyros',
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400'
  },

  // More Italian dishes
  {
    name: 'Spaghetti Carbonara',
    cuisine: 'Italian',
    diet_tags: [],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 0,
    macros: { kcal: 520, protein: 22, carbs: 55, fat: 24 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/spaghetti-carbonara',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400'
  },
  {
    name: 'Chicken Parmigiana',
    cuisine: 'Italian',
    diet_tags: [],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 0,
    macros: { kcal: 480, protein: 35, carbs: 28, fat: 26 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.6 },
    url: 'https://example.com/chicken-parmigiana',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    name: 'Caprese Salad',
    cuisine: 'Italian',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 0,
    macros: { kcal: 250, protein: 12, carbs: 8, fat: 20 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.4 },
    url: 'https://example.com/caprese-salad',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Risotto Mushroom',
    cuisine: 'Italian',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 0,
    macros: { kcal: 420, protein: 12, carbs: 58, fat: 16 },
    taste: { sweet_savory: 0.4, herby_umami: 0.9, crunchy_soft: 0.1 },
    url: 'https://example.com/risotto-mushroom',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    name: 'Lasagna',
    cuisine: 'Italian',
    diet_tags: [],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 1,
    macros: { kcal: 550, protein: 28, carbs: 45, fat: 30 },
    taste: { sweet_savory: 0.5, herby_umami: 0.8, crunchy_soft: 0.3 },
    url: 'https://example.com/lasagna',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
  },
  {
    name: 'Bruschetta',
    cuisine: 'Italian',
    diet_tags: ['vegan'],
    allergens: ['gluten'],
    spice: 0,
    macros: { kcal: 180, protein: 5, carbs: 28, fat: 6 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.8 },
    url: 'https://example.com/bruschetta',
    image_url: 'https://images.unsplash.com/photo-1571197119282-7c4e2b8b3d8e?w=400'
  },
  {
    name: 'Penne Arrabbiata',
    cuisine: 'Italian',
    diet_tags: ['vegan'],
    allergens: ['gluten'],
    spice: 3,
    macros: { kcal: 380, protein: 12, carbs: 65, fat: 8 },
    taste: { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.2 },
    url: 'https://example.com/penne-arrabbiata',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400'
  },

  // More Korean dishes
  {
    name: 'Korean BBQ Bulgogi',
    cuisine: 'Korean',
    diet_tags: ['gluten_free'],
    allergens: ['soy'],
    spice: 2,
    macros: { kcal: 380, protein: 32, carbs: 12, fat: 22 },
    taste: { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.5 },
    url: 'https://example.com/bulgogi',
    image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
  },
  {
    name: 'Bibimbap',
    cuisine: 'Korean',
    diet_tags: ['vegetarian'],
    allergens: ['soy', 'eggs', 'sesame'],
    spice: 2,
    macros: { kcal: 420, protein: 18, carbs: 55, fat: 14 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/bibimbap',
    image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
  },
  {
    name: 'Korean Fried Chicken',
    cuisine: 'Korean',
    diet_tags: [],
    allergens: ['gluten', 'soy'],
    spice: 3,
    macros: { kcal: 450, protein: 28, carbs: 35, fat: 22 },
    taste: { sweet_savory: 0.6, herby_umami: 0.7, crunchy_soft: 0.9 },
    url: 'https://example.com/korean-fried-chicken',
    image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
  },
  {
    name: 'Kimchi',
    cuisine: 'Korean',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 4,
    macros: { kcal: 40, protein: 2, carbs: 8, fat: 0 },
    taste: { sweet_savory: 0.2, herby_umami: 0.9, crunchy_soft: 0.8 },
    url: 'https://example.com/kimchi',
    image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
  },
  {
    name: 'Japchae',
    cuisine: 'Korean',
    diet_tags: ['vegan'],
    allergens: ['soy', 'sesame'],
    spice: 1,
    macros: { kcal: 320, protein: 8, carbs: 55, fat: 8 },
    taste: { sweet_savory: 0.6, herby_umami: 0.7, crunchy_soft: 0.3 },
    url: 'https://example.com/japchae',
    image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
  },

  // More Chinese dishes
  {
    name: 'Mapo Tofu',
    cuisine: 'Chinese',
    diet_tags: ['vegetarian'],
    allergens: ['soy'],
    spice: 4,
    macros: { kcal: 280, protein: 18, carbs: 12, fat: 18 },
    taste: { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.2 },
    url: 'https://example.com/mapo-tofu',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Sweet and Sour Pork',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['gluten', 'soy'],
    spice: 1,
    macros: { kcal: 420, protein: 25, carbs: 45, fat: 16 },
    taste: { sweet_savory: 0.8, herby_umami: 0.5, crunchy_soft: 0.6 },
    url: 'https://example.com/sweet-sour-pork',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Dumplings',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['gluten', 'soy'],
    spice: 1,
    macros: { kcal: 320, protein: 15, carbs: 38, fat: 12 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.3 },
    url: 'https://example.com/dumplings',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Fried Rice',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['soy', 'eggs'],
    spice: 1,
    macros: { kcal: 350, protein: 12, carbs: 52, fat: 10 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.4 },
    url: 'https://example.com/fried-rice',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Hot Pot',
    cuisine: 'Chinese',
    diet_tags: ['gluten_free'],
    allergens: ['soy'],
    spice: 4,
    macros: { kcal: 320, protein: 22, carbs: 15, fat: 18 },
    taste: { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.4 },
    url: 'https://example.com/hot-pot',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Peking Duck',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['gluten', 'soy'],
    spice: 1,
    macros: { kcal: 450, protein: 30, carbs: 25, fat: 26 },
    taste: { sweet_savory: 0.6, herby_umami: 0.8, crunchy_soft: 0.7 },
    url: 'https://example.com/peking-duck',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Chow Mein',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['gluten', 'soy'],
    spice: 1,
    macros: { kcal: 380, protein: 15, carbs: 48, fat: 14 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.5 },
    url: 'https://example.com/chow-mein',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'General Tso Chicken',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['gluten', 'soy'],
    spice: 2,
    macros: { kcal: 480, protein: 25, carbs: 52, fat: 20 },
    taste: { sweet_savory: 0.8, herby_umami: 0.6, crunchy_soft: 0.8 },
    url: 'https://example.com/general-tso-chicken',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },
  {
    name: 'Wonton Soup',
    cuisine: 'Chinese',
    diet_tags: [],
    allergens: ['gluten', 'soy', 'eggs'],
    spice: 0,
    macros: { kcal: 220, protein: 12, carbs: 25, fat: 8 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/wonton-soup',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
  },

  // More Vietnamese dishes
  {
    name: 'Banh Mi',
    cuisine: 'Vietnamese',
    diet_tags: [],
    allergens: ['gluten'],
    spice: 2,
    macros: { kcal: 380, protein: 22, carbs: 42, fat: 14 },
    taste: { sweet_savory: 0.4, herby_umami: 0.7, crunchy_soft: 0.8 },
    url: 'https://example.com/banh-mi',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },
  {
    name: 'Spring Rolls',
    cuisine: 'Vietnamese',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 0,
    macros: { kcal: 180, protein: 6, carbs: 28, fat: 4 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.6 },
    url: 'https://example.com/spring-rolls',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },
  {
    name: 'Bun Bo Hue',
    cuisine: 'Vietnamese',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 4,
    macros: { kcal: 420, protein: 25, carbs: 48, fat: 12 },
    taste: { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.3 },
    url: 'https://example.com/bun-bo-hue',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },
  {
    name: 'Vietnamese Iced Coffee',
    cuisine: 'Vietnamese',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 0,
    macros: { kcal: 180, protein: 4, carbs: 28, fat: 6 },
    taste: { sweet_savory: 0.8, herby_umami: 0.1, crunchy_soft: 0.0 },
    url: 'https://example.com/vietnamese-iced-coffee',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
  },

  // American dishes
  {
    name: 'BBQ Ribs',
    cuisine: 'American',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 2,
    macros: { kcal: 480, protein: 35, carbs: 15, fat: 32 },
    taste: { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/bbq-ribs',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Mac and Cheese',
    cuisine: 'American',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy'],
    spice: 0,
    macros: { kcal: 420, protein: 18, carbs: 45, fat: 20 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.2 },
    url: 'https://example.com/mac-and-cheese',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Buffalo Wings',
    cuisine: 'American',
    diet_tags: ['gluten_free'],
    allergens: ['dairy'],
    spice: 4,
    macros: { kcal: 380, protein: 28, carbs: 5, fat: 28 },
    taste: { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.8 },
    url: 'https://example.com/buffalo-wings',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Clam Chowder',
    cuisine: 'American',
    diet_tags: [],
    allergens: ['shellfish', 'dairy'],
    spice: 0,
    macros: { kcal: 320, protein: 15, carbs: 25, fat: 18 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.1 },
    url: 'https://example.com/clam-chowder',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Apple Pie',
    cuisine: 'American',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 0,
    macros: { kcal: 420, protein: 5, carbs: 65, fat: 18 },
    taste: { sweet_savory: 0.9, herby_umami: 0.1, crunchy_soft: 0.6 },
    url: 'https://example.com/apple-pie',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Fried Chicken',
    cuisine: 'American',
    diet_tags: [],
    allergens: ['gluten', 'eggs'],
    spice: 2,
    macros: { kcal: 450, protein: 32, carbs: 18, fat: 28 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.9 },
    url: 'https://example.com/fried-chicken',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Pancakes',
    cuisine: 'American',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 0,
    macros: { kcal: 380, protein: 12, carbs: 58, fat: 12 },
    taste: { sweet_savory: 0.8, herby_umami: 0.1, crunchy_soft: 0.2 },
    url: 'https://example.com/pancakes',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Philly Cheesesteak',
    cuisine: 'American',
    diet_tags: [],
    allergens: ['gluten', 'dairy'],
    spice: 1,
    macros: { kcal: 520, protein: 32, carbs: 38, fat: 26 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.5 },
    url: 'https://example.com/philly-cheesesteak',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },

  // Greek dishes
  {
    name: 'Souvlaki',
    cuisine: 'Greek',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 1,
    macros: { kcal: 320, protein: 28, carbs: 8, fat: 20 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/souvlaki',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Spanakopita',
    cuisine: 'Greek',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'dairy', 'eggs'],
    spice: 0,
    macros: { kcal: 380, protein: 16, carbs: 28, fat: 24 },
    taste: { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.7 },
    url: 'https://example.com/spanakopita',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Tzatziki',
    cuisine: 'Greek',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['dairy'],
    spice: 0,
    macros: { kcal: 80, protein: 4, carbs: 6, fat: 5 },
    taste: { sweet_savory: 0.2, herby_umami: 0.6, crunchy_soft: 0.1 },
    url: 'https://example.com/tzatziki',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Greek Lemon Chicken',
    cuisine: 'Greek',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 1,
    macros: { kcal: 350, protein: 32, carbs: 12, fat: 20 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.4 },
    url: 'https://example.com/greek-lemon-chicken',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Dolmades',
    cuisine: 'Greek',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 0,
    macros: { kcal: 180, protein: 4, carbs: 28, fat: 6 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/dolmades',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },

  // More Middle Eastern dishes
  {
    name: 'Kebab',
    cuisine: 'Middle Eastern',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 2,
    macros: { kcal: 350, protein: 32, carbs: 8, fat: 22 },
    taste: { sweet_savory: 0.3, herby_umami: 0.8, crunchy_soft: 0.6 },
    url: 'https://example.com/kebab',
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400'
  },
  {
    name: 'Fattoush',
    cuisine: 'Middle Eastern',
    diet_tags: ['vegan'],
    allergens: ['gluten'],
    spice: 1,
    macros: { kcal: 180, protein: 5, carbs: 22, fat: 8 },
    taste: { sweet_savory: 0.3, herby_umami: 0.7, crunchy_soft: 0.8 },
    url: 'https://example.com/fattoush',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  },
  {
    name: 'Shakshuka',
    cuisine: 'Middle Eastern',
    diet_tags: ['vegetarian', 'gluten_free'],
    allergens: ['eggs'],
    spice: 2,
    macros: { kcal: 280, protein: 16, carbs: 18, fat: 18 },
    taste: { sweet_savory: 0.4, herby_umami: 0.8, crunchy_soft: 0.2 },
    url: 'https://example.com/shakshuka',
    image_url: 'https://images.unsplash.com/photo-1571197119282-7c4e2b8b3d8e?w=400'
  },
  {
    name: 'Baklava',
    cuisine: 'Middle Eastern',
    diet_tags: ['vegetarian'],
    allergens: ['gluten', 'tree_nuts', 'dairy'],
    spice: 0,
    macros: { kcal: 380, protein: 6, carbs: 45, fat: 20 },
    taste: { sweet_savory: 0.9, herby_umami: 0.1, crunchy_soft: 0.8 },
    url: 'https://example.com/baklava',
    image_url: 'https://images.unsplash.com/photo-1571197119282-7c4e2b8b3d8e?w=400'
  }
]

async function seedDishes() {
  try {
    console.log('Starting to seed dishes...')
    
    // Check if dishes already exist to avoid duplicates
    const { data: existingDishes } = await supabase
      .from('dishes')
      .select('name')
    
    const existingNames = new Set(existingDishes?.map(d => d.name) || [])
    
    // Filter out dishes that already exist
    const newDishes = dishes.filter(dish => !existingNames.has(dish.name))
    
    if (newDishes.length === 0) {
      console.log('All dishes already exist. Skipping seed.')
      return
    }
    
    console.log(`Inserting ${newDishes.length} new dishes...`)
    
    // Insert dishes in batches of 20 to avoid timeout
    const batchSize = 20
    for (let i = 0; i < newDishes.length; i += batchSize) {
      const batch = newDishes.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('dishes')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }
      
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(newDishes.length / batchSize)}`)
    }
    
    console.log(`✅ Successfully seeded ${newDishes.length} dishes!`)
    
  } catch (error) {
    console.error('❌ Error seeding dishes:', error)
    process.exit(1)
  }
}

seedDishes()
