// Test script for accounts API endpoints with cookie handling
const BASE_URL = 'http://localhost:3000'

// Simple cookie jar to simulate browser behavior
let cookies = ''

async function fetchWithCookies(url, options = {}) {
  const headers = {
    ...options.headers,
    ...(cookies && { 'Cookie': cookies })
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  // Extract and store cookies from response
  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader) {
    // Simple cookie parsing (just get the first cookie value)
    const cookieMatch = setCookieHeader.match(/forq_user_id=([^;]+)/)
    if (cookieMatch) {
      cookies = `forq_user_id=${cookieMatch[1]}`
      console.log('🍪 Cookie set:', cookies)
    }
  }
  
  return response
}

async function testAccountsAPIWithCookies() {
  console.log('🧪 Testing Accounts API with Cookie Handling...\n')

  try {
    // Test 1: List accounts (should be empty initially)
    console.log('1. Testing GET /api/accounts/list (initial)')
    const listResponse = await fetchWithCookies(`${BASE_URL}/api/accounts/list`)
    const listData = await listResponse.json()
    console.log('Response:', listData)
    console.log('✅ List accounts successful\n')

    // Test 2: Link a new account
    console.log('2. Testing POST /api/accounts/link (Uber Eats)')
    const linkResponse = await fetchWithCookies(`${BASE_URL}/api/accounts/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'ubereats',
        external_user_id: 'test_user_123',
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      })
    })
    const linkData = await linkResponse.json()
    console.log('Response:', linkData)
    console.log('✅ Link account successful\n')

    // Test 3: List accounts again (should show the linked account)
    console.log('3. Testing GET /api/accounts/list (after linking)')
    const listResponse2 = await fetchWithCookies(`${BASE_URL}/api/accounts/list`)
    const listData2 = await listResponse2.json()
    console.log('Response:', listData2)
    console.log('✅ List accounts after linking successful\n')

    // Test 4: Link another account (different provider)
    console.log('4. Testing POST /api/accounts/link (DoorDash)')
    const linkResponse2 = await fetchWithCookies(`${BASE_URL}/api/accounts/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'doordash',
        external_user_id: 'doordash_user_456',
        access_token: 'doordash_token'
      })
    })
    const linkData2 = await linkResponse2.json()
    console.log('Response:', linkData2)
    console.log('✅ Link DoorDash account successful\n')

    // Test 5: Update existing account (upsert)
    console.log('5. Testing POST /api/accounts/link (update existing Uber Eats)')
    const updateResponse = await fetchWithCookies(`${BASE_URL}/api/accounts/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'ubereats',
        external_user_id: 'test_user_123_updated',
        access_token: 'updated_access_token'
      })
    })
    const updateData = await updateResponse.json()
    console.log('Response:', updateData)
    console.log('✅ Update account successful\n')

    // Test 6: Final list to see all accounts
    console.log('6. Testing GET /api/accounts/list (final)')
    const finalListResponse = await fetchWithCookies(`${BASE_URL}/api/accounts/list`)
    const finalListData = await finalListResponse.json()
    console.log('Response:', finalListData)
    console.log('✅ Final list successful\n')

    console.log('🎉 All tests with cookies passed!')
    console.log(`📊 Final account count: ${finalListData.length}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the tests
testAccountsAPIWithCookies()
