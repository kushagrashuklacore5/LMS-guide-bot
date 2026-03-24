const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Debugging 400 Error ===\n');

// Test the exact vendor creation process
console.log('1. Testing vendor creation validation...');

// Simulate a vendor creation request
const testCases = [
  {
    name: '',
    email: 'test@example.com',
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category',
    description: 'Missing name'
  },
  {
    name: 'Test Vendor',
    email: '',
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category',
    description: 'Missing email (should be OK)'
  },
  {
    name: 'Test Vendor',
    email: 'vendor1@gmail.com', // Existing email
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category',
    description: 'Existing email'
  },
  {
    name: 'Test Vendor',
    email: 'newvendor@test.com',
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category',
    description: 'Valid request'
  }
];

let testIndex = 0;

function runTest(testCase) {
  console.log(`\n2. Testing case ${testIndex + 1}: ${testCase.description}`);
  console.log('Request data:', testCase);
  
  const { name, email, phone, address, category } = testCase;
  
  // Validate required fields
  if (!name || !name.trim()) {
    console.log('❌ Validation failed: Vendor name is required');
    console.log('Expected 400 error with message: "Vendor name is required"');
    nextTest();
    return;
  }
  
  console.log('✅ Name validation passed');
  
  // Check email uniqueness if provided
  if (email && email.trim()) {
    console.log('🔍 Checking email uniqueness for:', email);
    
    db.get('SELECT id FROM vendors WHERE email = ?', [email], (err, existingVendor) => {
      if (err) {
        console.error('❌ Database error:', err);
        console.log('Expected 500 error with message: "Database error"');
        nextTest();
        return;
      }
      
      console.log('🔍 Email check result:', existingVendor);
      
      if (existingVendor) {
        console.log('❌ Validation failed: Email already exists');
        console.log('Expected 400 error with message: "Email already exists. Please use a different email."');
        nextTest();
        return;
      }
      
      console.log('✅ Email uniqueness check passed');
      testUserAuthentication();
    });
  } else {
    console.log('🔍 No email provided, should proceed');
    testUserAuthentication();
  }
}

function testUserAuthentication() {
  console.log('🔍 Testing user authentication...');
  
  // Simulate authenticated user (storekeeper)
  const userId = 34; // storekeeper@demo.com
  
  db.get('SELECT university_id FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('❌ Database error:', err);
      nextTest();
      return;
    }
    
    if (!user) {
      console.log('❌ User not found');
      console.log('Expected 401 error with message: "Storekeeper not authenticated"');
      nextTest();
      return;
    }
    
    console.log('✅ User authentication passed');
    console.log('University ID:', user.university_id);
    
    console.log('✅ All validations passed - vendor creation should succeed');
    nextTest();
  });
}

function nextTest() {
  testIndex++;
  if (testIndex < testCases.length) {
    runTest(testCases[testIndex]);
  } else {
    console.log('\n🎉 All tests completed!');
    console.log('📋 Summary of expected 400 errors:');
    console.log('1. Missing vendor name → 400 "Vendor name is required"');
    console.log('2. Existing email → 400 "Email already exists. Please use a different email."');
    console.log('3. Missing user authentication → 401 "Storekeeper not authenticated"');
    console.log('4. Database error → 500 "Database error"');
    
    console.log('\n🔧 Common 400 error causes:');
    console.log('❌ Frontend not sending vendor name');
    console.log('❌ Frontend not authenticated (missing user ID)');
    console.log('❌ Email already exists in database');
    console.log('❌ Request body not properly formatted');
    console.log('❌ Content-Type not set to application/json');
    
    console.log('\n💡 Check these in your frontend:');
    console.log('1. Vendor name field is filled');
    console.log('2. User is logged in as storekeeper');
    console.log('3. Email is unique (or leave empty for auto-generation)');
    console.log('4. Request headers include Content-Type: application/json');
    console.log('5. Request body is properly formatted JSON');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('\n✅ Database connection closed');
      }
    });
  }
}

// Start testing
runTest(testCases[0]);
