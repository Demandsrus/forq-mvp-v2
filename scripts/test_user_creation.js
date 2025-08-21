const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testUserCreation() {
  const userId = crypto.randomUUID()
  console.log('Testing user creation with ID:', userId)
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      user_id: userId,
      email: `${userId}@forq-mvp.local`,
      email_confirm: true
    })
    
    if (error) {
      console.log('User creation error:', error)
    } else {
      console.log('User created successfully:', data.user.id)
    }
  } catch (err) {
    console.log('Exception:', err)
  }
}

testUserCreation()
