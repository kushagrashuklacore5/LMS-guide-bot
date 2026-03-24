const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Fixing Vendor Email Uniqueness ===\n');

// Check all vendors for duplicate emails
console.log('1. Checking all vendor emails for duplicates...');
db.all('SELECT * FROM vendors ORDER BY email', (err, vendors) => {
  if (err) {
    console.error('Error fetching vendors:', err);
    return;
  }
  
  console.log(`Found ${vendors.length} vendors:`);
  
  // Group by email to find duplicates
  const emailGroups = {};
  vendors.forEach(vendor => {
    if (!emailGroups[vendor.email]) {
      emailGroups[vendor.email] = [];
    }
    emailGroups[vendor.email].push(vendor);
  });
  
  // Find duplicates
  const duplicates = {};
  Object.keys(emailGroups).forEach(email => {
    if (emailGroups[email].length > 1) {
      duplicates[email] = emailGroups[email];
    }
  });
  
  console.log('\n2. Analyzing email groups...');
  
  // Display all vendors
  vendors.forEach((vendor, index) => {
    console.log(`\nVendor ${index + 1}:`);
    console.log(`- ID: ${vendor.id}`);
    console.log(`- Name: ${vendor.name}`);
    console.log(`- Email: ${vendor.email}`);
    console.log(`- University ID: ${vendor.university_id}`);
  });
  
  // Show duplicates
  if (Object.keys(duplicates).length > 0) {
    console.log('\n❌ Found duplicate emails:');
    Object.keys(duplicates).forEach(email => {
      console.log(`\nEmail: "${email}" appears ${duplicates[email].length} times:`);
      duplicates[email].forEach((vendor, index) => {
        console.log(`  ${index + 1}. ID: ${vendor.id}, Name: ${vendor.name}`);
      });
    });
    
    console.log('\n3. Fixing duplicate emails...');
    
    // Fix duplicates by making emails unique
    let fixCount = 0;
    Object.keys(duplicates).forEach(email => {
      const vendorsWithSameEmail = duplicates[email];
      
      // Keep the first vendor as-is, update others
      for (let i = 1; i < vendorsWithSameEmail.length; i++) {
        const vendor = vendorsWithSameEmail[i];
        const uniqueEmail = `${vendor.name.toLowerCase().replace(/\s+/g, '_')}_${vendor.id}@vendor.com`;
        
        console.log(`\nFixing vendor ID ${vendor.id}:`);
        console.log(`- Old email: "${vendor.email}"`);
        console.log(`- New email: "${uniqueEmail}"`);
        
        db.run(
          'UPDATE vendors SET email = ? WHERE id = ?',
          [uniqueEmail, vendor.id],
          function(err) {
            if (err) {
              console.error(`Error updating vendor ${vendor.id}:`, err);
              return;
            }
            
            console.log(`✅ Updated vendor ${vendor.id} email to: ${uniqueEmail}`);
            fixCount++;
            
            // Also update corresponding user account if exists
            db.run(
              'UPDATE users SET email = ? WHERE email = ? AND role = "vendor"',
              [uniqueEmail, vendor.email],
              function(err) {
                if (err) {
                  console.error(`Error updating user for vendor ${vendor.id}:`, err);
                  return;
                }
                
                if (this.changes > 0) {
                  console.log(`✅ Updated user account email to: ${uniqueEmail}`);
                }
                
                // Check if all fixes are done
                if (fixCount === Object.values(duplicates).reduce((sum, vendors) => sum + (vendors.length - 1), 0)) {
                  console.log('\n4. Verifying email uniqueness...');
                  verifyEmailUniqueness();
                }
              }
            );
          }
        );
      }
    });
    
  } else {
    console.log('✅ No duplicate emails found');
    verifyEmailUniqueness();
  }
});

function verifyEmailUniqueness() {
  db.all('SELECT email, COUNT(*) as count FROM vendors GROUP BY email HAVING count > 1', (err, duplicates) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return;
    }
    
    if (duplicates.length === 0) {
      console.log('✅ All vendor emails are now unique!');
      
      // Show final vendor list
      db.all('SELECT * FROM vendors ORDER BY id', (err, finalVendors) => {
        if (err) {
          console.error('Error fetching final vendors:', err);
          return;
        }
        
        console.log('\n📋 Final Vendor List:');
        finalVendors.forEach((vendor, index) => {
          console.log(`\nVendor ${index + 1}:`);
          console.log(`- ID: ${vendor.id}`);
          console.log(`- Name: ${vendor.name}`);
          console.log(`- Email: ${vendor.email}`);
          console.log(`- University ID: ${vendor.university_id}`);
        });
        
        console.log('\n🎉 Vendor Email Uniqueness Fix Complete!');
        console.log('📋 Summary:');
        console.log('✅ All vendor emails are now unique');
        console.log('✅ No duplicate email addresses');
        console.log('✅ User accounts updated accordingly');
        
        // Add unique constraint to prevent future duplicates
        console.log('\n5. Adding unique constraint to prevent future duplicates...');
        
        // Note: SQLite doesn't support ALTER TABLE ADD CONSTRAINT for existing tables
        // We'll need to recreate the table or handle this in application logic
        console.log('💡 Recommendation: Add email uniqueness check in vendor creation API');
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('\n✅ Database connection closed');
          }
        });
      });
    } else {
      console.log('❌ Still found duplicate emails:');
      duplicates.forEach(dup => {
        console.log(`- ${dup.email}: ${dup.count} occurrences`);
      });
      
      db.close();
    }
  });
}
