const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Testing Vendor Creation Process ===\n');

// Simulate the exact vendor creation request
const mockRequest = {
  body: {
    name: 'Test Vendor',
    email: 'testvendor@example.com',
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category'
  },
  user: {
    userId: 1 // Assuming storekeeper user ID 1
  }
};

console.log('1. Simulating vendor creation request...');
console.log('Mock request:', mockRequest);

// Test the validation logic
const { name, email, phone, address, category } = mockRequest.body;
const userId = mockRequest.user?.userId;

console.log('\n2. Testing validation logic...');
console.log('Extracted data:', { 
  userId: userId || 'MISSING', 
  name: name || 'MISSING', 
  email: email || 'MISSING', 
  phone: phone || 'MISSING', 
  address: address || 'MISSING', 
  category: category || 'MISSING' 
});

// Validate required fields
if (!name || !name.trim()) {
  console.log('❌ Validation failed: Vendor name is required');
  process.exit(1);
}

if (!userId) {
  console.log('❌ Validation failed: Storekeeper not authenticated');
  process.exit(1);
}

console.log('✅ Basic validation passed');

// Check email uniqueness if provided
if (email && email.trim()) {
  console.log('🔍 Checking email uniqueness for:', email);
  
  db.get('SELECT id FROM vendors WHERE email = ?', [email], (err, existingVendor) => {
    if (err) {
      console.error('❌ Error checking email uniqueness:', err);
      process.exit(1);
    }

    console.log('🔍 Email check result:', existingVendor);

    if (existingVendor) {
      console.log('❌ Validation failed: Email already exists');
      process.exit(1);
    }

    console.log('✅ Email uniqueness check passed');
    testUserAuthentication(userId);
  });
} else {
  console.log('🔍 No email provided, proceeding with auto-generated email');
  testUserAuthentication(userId);
}

function testUserAuthentication(userId) {
  console.log('\n3. Testing user authentication...');
  
  // Get user's university_id from database
  db.get(
    'SELECT university_id FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('❌ Get user error:', err);
        process.exit(1);
      }

      console.log('User from database:', user);

      if (!user) {
        console.log('❌ User not found');
        process.exit(1);
      }

      console.log('✅ User authentication passed');
      console.log('University ID:', user.university_id);
      
      testVendorCreation(user.university_id);
    }
  );
}

function testVendorCreation(universityId) {
  console.log('\n4. Testing actual vendor creation...');
  
  // Generate a random password for the vendor
  const bcrypt = require('bcryptjs');
  const plainPassword = 'test123';
  const hashedPassword = bcrypt.hashSync(plainPassword, 10);
  
  console.log('Generated password for vendor:', plainPassword);

  // Insert new vendor with password
  db.run(
    `INSERT INTO vendors (name, email, phone, address, category, rating, totalOrders, totalValue, university_id, password) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email || '', phone || '', address || '', category || '', 0, 0, 0, universityId, hashedPassword],
    function(err) {
      if (err) {
        console.error('❌ Add vendor error:', err);
        process.exit(1);
      }

      console.log('✅ Vendor added successfully with ID:', this.lastID);
      
      // Create corresponding user account for vendor login
      const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '_')}@vendor.com`;
      const userPassword = plainPassword;
      const hashedUserPassword = hashedPassword;
      
      db.run(
        `INSERT INTO users (email, password, role, isApproved, created_at, updated_at) 
         VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
        [userEmail, hashedUserPassword, 'vendor'],
        function(err) {
          if (err) {
            console.error('❌ Error creating vendor user account:', err);
            process.exit(1);
          }
          
          console.log('✅ Vendor user account created with ID:', this.lastID);
          
          console.log('\n🎉 Vendor Creation Test Complete!');
          console.log('📋 Summary:');
          console.log('✅ All validation passed');
          console.log('✅ Email uniqueness check passed');
          console.log('✅ User authentication passed');
          console.log('✅ Vendor created successfully');
          console.log('✅ User account created successfully');
          
          // Clean up test data
          console.log('\n🧹 Cleaning up test data...');
          db.run('DELETE FROM vendors WHERE id = ?', [this.lastID]);
          db.run('DELETE FROM users WHERE id = ?', [this.lastID]);
          
          console.log('✅ Test data cleaned up');
          
          console.log('\n💡 If this test passes, the issue might be:');
          console.log('1. Frontend not sending required fields');
          console.log('2. Authentication middleware not working');
          console.log('3. CORS issues blocking the request');
          console.log('4. Request body parsing issues');
          
          console.log('\n🔧 Check these in the actual request:');
          console.log('- Request body contains all required fields');
          console.log('- User is properly authenticated');
          console.log('- Content-Type header is application/json');
          console.log('- Request is properly formatted');
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\n✅ Database connection closed');
            }
          });
        }
      );
    }
  );
}
