const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function removeForeignKeyConstraint() {
  try {
    console.log('Removing foreign key constraint for MVP...')
    
    // Drop the foreign key constraint
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE linked_accounts DROP CONSTRAINT IF EXISTS linked_accounts_user_id_fkey;'
    })
    
    if (error) {
      console.error('Error removing constraint:', error)
    } else {
      console.log('✅ Foreign key constraint removed successfully')
    }
    
    // Also change user_id column to text for MVP
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE linked_accounts ALTER COLUMN user_id TYPE text;'
    })
    
    if (alterError) {
      console.error('Error changing column type:', alterError)
    } else {
      console.log('✅ user_id column changed to text')
    }
    
  } catch (error) {
    console.error('Exception:', error)
  }
}

removeForeignKeyConstraint()
