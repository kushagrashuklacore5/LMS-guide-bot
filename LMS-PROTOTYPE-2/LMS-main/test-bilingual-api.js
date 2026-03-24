const axios = require('axios');

const API_URL = 'http://localhost:5002/api/bilingual';

// Mock user with token (replace with actual token from login)
const token = 'your-jwt-token-here';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

/**
 * Test 1: Translate a string to Arabic
 */
async function testTranslate() {
  try {
    console.log('\n📝 Test 1: Translate to Arabic');
    const response = await axios.post(`${API_URL}/translate`, {
      text: 'Welcome to the course management system',
      targetLanguage: 'ar'
    }, { headers });
    
    console.log('✅ Translation successful:');
    console.log('  Original:', response.data.original);
    console.log('  Translated:', response.data.translated);
  } catch (error) {
    console.error('❌ Translation failed:', error.response?.data || error.message);
  }
}

/**
 * Test 2: Create data in English (auto-translates to Arabic)
 */
async function testCreateEnglish() {
  try {
    console.log('\n📝 Test 2: Create course in English');
    const response = await axios.post(`${API_URL}/create`, {
      table: 'courses',
      language: 'en',
      data: {
        title: 'Advanced React Development',
        description: 'Learn advanced React patterns and best practices',
        category: 'Web Development'
      }
    }, { headers });
    
    console.log('✅ Creation successful:');
    console.log('  Data stored in both English and Arabic');
  } catch (error) {
    console.error('❌ Creation failed:', error.response?.data || error.message);
  }
}

/**
 * Test 3: Create data in Arabic (auto-translates to English)
 */
async function testCreateArabic() {
  try {
    console.log('\n📝 Test 3: Create course in Arabic');
    const response = await axios.post(`${API_URL}/create`, {
      table: 'courses',
      language: 'ar',
      data: {
        title: 'تطوير React المتقدم',
        description: 'تعلم أنماط React المتقدمة وأفضل الممارسات',
        category: 'تطوير الويب'
      }
    }, { headers });
    
    console.log('✅ Creation successful:');
    console.log('  Data stored in both Arabic and English');
  } catch (error) {
    console.error('❌ Creation failed:', error.response?.data || error.message);
  }
}

/**
 * Test 4: Retrieve data in English
 */
async function testGetEnglish() {
  try {
    console.log('\n📝 Test 4: Retrieve course in English');
    const response = await axios.get(`${API_URL}/get`, {
      params: {
        table: 'courses',
        language: 'en',
        id: 1
      },
      headers
    });
    
    console.log('✅ Retrieval successful (English):');
    console.log(JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.error('❌ Retrieval failed:', error.response?.data || error.message);
  }
}

/**
 * Test 5: Retrieve data in Arabic
 */
async function testGetArabic() {
  try {
    console.log('\n📝 Test 5: Retrieve course in Arabic');
    const response = await axios.get(`${API_URL}/get`, {
      params: {
        table: 'courses',
        language: 'ar',
        id: 1
      },
      headers
    });
    
    console.log('✅ Retrieval successful (Arabic):');
    console.log(JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.error('❌ Retrieval failed:', error.response?.data || error.message);
  }
}

/**
 * Test 6: Update data with new translation
 */
async function testUpdate() {
  try {
    console.log('\n📝 Test 6: Update course in English');
    const response = await axios.put(`${API_URL}/update`, {
      table: 'courses',
      id: 1,
      language: 'en',
      data: {
        title: 'Updated React Course',
        description: 'Updated description for React course'
      }
    }, { headers });
    
    console.log('✅ Update successful:');
    console.log('  Data updated in both English and Arabic');
  } catch (error) {
    console.error('❌ Update failed:', error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Bilingual API Tests');
  console.log('================================');
  
  // Note: Tests without auth token will fail
  // You need to get a valid JWT token first
  console.log('\n⚠️  Note: Tests require a valid JWT token.');
  console.log('   Get token by logging in first, then update the token variable.');
  
  // Uncomment to test when you have a valid token:
  // await testTranslate();
  // await testCreateEnglish();
  // await testCreateArabic();
  // await testGetEnglish();
  // await testGetArabic();
  // await testUpdate();
  
  console.log('\n✅ Test suite defined. Run tests when JWT token is available.');
}

// Run tests
runAllTests().catch(console.error);
