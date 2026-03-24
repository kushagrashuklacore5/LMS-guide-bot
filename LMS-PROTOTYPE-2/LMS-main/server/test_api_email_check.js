const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Testing API Email Check ===\n');

// Test the exact same query that the API uses
console.log('1. Testing exact API query for existing email...');
const existingEmail = 'vendor1@gmail.com';

db.get('SELECT id FROM vendors WHERE email = ?', [existingEmail], (err, existingVendor) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Query result:', existingVendor);
  
  if (existingVendor) {
    console.log(`✅ Found existing vendor with ID: ${existingVendor.id}`);
    console.log('✅ API should return error: "Email already exists. Please use a different email."');
  } else {
    console.log('❌ No existing vendor found - this is the problem!');
  }
  
  // Test with case sensitivity
  console.log('\n2. Testing case sensitivity...');
  const testEmails = [
    'vendor1@gmail.com',
    'Vendor1@gmail.com',
    'VENDOR1@GMAIL.COM',
    ' vendor1@gmail.com ',
    'vendor1@gmail.com\n'
  ];
  
  testEmails.forEach((testEmail, index) => {
    const trimmedEmail = testEmail.trim();
    console.log(`\nTest ${index + 1}: "${testEmail}" -> "${trimmedEmail}"`);
    
    db.get('SELECT id FROM vendors WHERE email = ?', [trimmedEmail], (err, vendor) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      if (vendor) {
        console.log(`✅ Found vendor ID: ${vendor.id}`);
      } else {
        console.log('❌ No vendor found');
      }
      
      if (index === testEmails.length - 1) {
        console.log('\n3. Testing with LIKE query (case-insensitive)...');
        
        db.get('SELECT id FROM vendors WHERE email LIKE ?', [existingEmail.toLowerCase()], (err, vendor) => {
          if (err) {
            console.error('Error:', err);
            return;
          }
          
          console.log('LIKE query result:', vendor);
          
          if (vendor) {
            console.log('✅ LIKE query found vendor - case sensitivity might be the issue');
          } else {
            console.log('❌ LIKE query also failed');
          }
          
          console.log('\n4. Checking all vendor emails...');
          db.all('SELECT id, name, email FROM vendors', (err, vendors) => {
            if (err) {
              console.error('Error:', err);
              return;
            }
            
            console.log('All vendor emails:');
            vendors.forEach(v => {
              console.log(`- ${v.name}: "${v.email}" (length: ${v.email.length})`);
            });
            
            console.log('\n5. Testing exact match...');
            vendors.forEach(vendor => {
              const match = vendor.email === existingEmail;
              console.log(`"${vendor.email}" === "${existingEmail}" = ${match}`);
            });
            
            console.log('\n💡 Analysis:');
            const exactMatch = vendors.find(v => v.email === existingEmail);
            if (exactMatch) {
              console.log('✅ Exact match found - API should work');
              console.log('❌ Problem might be:');
              console.log('   - Server not restarted after changes');
              console.log('   - Different API route being used');
              console.log('   - Email field not being sent properly');
              console.log('   - Frontend not handling error response');
            } else {
              console.log('❌ No exact match found - this is the issue!');
              console.log('🔧 Solution: Check email formatting and storage');
            }
            
            console.log('\n🔧 Recommended fix:');
            console.log('1. Restart the server to apply changes');
            console.log('2. Check browser console for API responses');
            console.log('3. Verify email is being sent from frontend');
            console.log('4. Add more debugging to the API route');
            
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err);
              } else {
                console.log('\n✅ Database connection closed');
              }
            });
          });
        });
      }
    });
  });
});
