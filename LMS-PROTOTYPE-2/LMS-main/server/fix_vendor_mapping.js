const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Fixing Vendor ID Mapping ===\n');

// Check current vendor mapping
console.log('1. Checking current vendor mapping...');
db.get('SELECT * FROM vendors WHERE email = "vendor1@gmail.com"', (err, vendor20) => {
  if (err) {
    console.error('Error fetching vendor 20:', err);
    return;
  }
  
  console.log('Vendor 20 (current mapping):');
  console.log(`- ID: ${vendor20.id}`);
  console.log(`- Name: ${vendor20.name}`);
  console.log(`- Email: ${vendor20.email}`);
  
  // Check vendor 36
  db.get('SELECT * FROM vendors WHERE id = 36', (err, vendor36) => {
    if (err) {
      console.error('Error fetching vendor 36:', err);
      return;
    }
    
    if (vendor36) {
      console.log('\nVendor 36 (target):');
      console.log(`- ID: ${vendor36.id}`);
      console.log(`- Name: ${vendor36.name}`);
      console.log(`- Email: ${vendor36.email}`);
      
      console.log('\n2. Fixing vendor mapping...');
      
      // Update vendor 20 to have different email
      db.run('UPDATE vendors SET email = "old_vendor1@gmail.com" WHERE id = 20', function(err) {
        if (err) {
          console.error('Error updating vendor 20:', err);
          return;
        }
        
        console.log('✅ Updated vendor 20 email to old_vendor1@gmail.com');
        
        // Update vendor 36 to have correct email
        db.run('UPDATE vendors SET email = "vendor1@gmail.com" WHERE id = 36', function(err) {
          if (err) {
            console.error('Error updating vendor 36:', err);
            return;
          }
          
          console.log('✅ Updated vendor 36 email to vendor1@gmail.com');
          
          // Verify the fix
          console.log('\n3. Verifying the fix...');
          
          // Test vendor mapping for user 36
          db.get('SELECT id FROM vendors WHERE email = (SELECT email FROM users WHERE id = 36)', (err, vendorRow) => {
            if (err) {
              console.error('Error testing mapping:', err);
              return;
            }
            
            if (vendorRow) {
              console.log(`✅ User 36 now maps to Vendor ID: ${vendorRow.id}`);
              
              // Test vendor requests query
              const query = `
                SELECT DISTINCT 
                  sr.id, sr.title, sr.description, sr.status, sr.created_at, 
                  sr.expected_delivery_date, sr.urgency_level, sr.requested_by,
                  sri.item_name, sri.category, sri.quantity_requested, sri.unit_price, 
                  sri.total_price, sri.specifications, sri.preferred_brand, sri.alternatives_allowed
                FROM stock_requests sr
                JOIN stock_request_items sri ON sr.id = sri.request_id
                WHERE sri.vendor_id = ? AND sr.university_id = ?
                ORDER BY sr.created_at DESC
              `;
              
              db.all(query, [vendorRow.id, 1], (err, requests) => {
                if (err) {
                  console.error('Error testing requests:', err);
                  return;
                }
                
                console.log(`✅ Query returned ${requests.length} request items for vendor ${vendorRow.id}`);
                
                if (requests.length > 0) {
                  // Group by request ID
                  const groupedRequests = {};
                  requests.forEach(req => {
                    if (!groupedRequests[req.id]) {
                      groupedRequests[req.id] = {
                        id: req.id,
                        title: req.title,
                        description: req.description,
                        status: req.status,
                        created_at: req.created_at,
                        expected_delivery_date: req.expected_delivery_date,
                        urgency_level: req.urgency_level,
                        requested_by: req.requested_by,
                        items: []
                      };
                    }
                    
                    groupedRequests[req.id].items.push({
                      item_name: req.item_name,
                      category: req.category,
                      quantity_requested: req.quantity_requested,
                      unit_price: req.unit_price,
                      total_price: req.total_price,
                      specifications: req.specifications,
                      preferred_brand: req.preferred_brand,
                      alternatives_allowed: req.alternatives_allowed
                    });
                  });
                  
                  const finalRequests = Object.values(groupedRequests);
                  console.log(`✅ Final grouped requests: ${finalRequests.length}`);
                  
                  finalRequests.forEach((request, index) => {
                    console.log(`\nRequest ${index + 1}:`);
                    console.log(`- ID: ${request.id}`);
                    console.log(`- Title: ${request.title}`);
                    console.log(`- Status: ${request.status}`);
                    console.log(`- Items: ${request.items.length}`);
                    
                    request.items.forEach((item, itemIndex) => {
                      console.log(`  Item ${itemIndex + 1}: ${item.item_name} (${item.quantity_requested})`);
                    });
                  });
                  
                  console.log('\n🎉 Vendor Mapping Fix Complete!');
                  console.log('📋 Summary:');
                  console.log(`- User 36 (vendor1@gmail.com) now maps to Vendor ID 36`);
                  console.log(`- Vendor 36 will now see all assigned requests`);
                  console.log(`- ${finalRequests.length} requests will be visible to vendor`);
                  
                  db.close((err) => {
                    if (err) {
                      console.error('Error closing database:', err);
                    } else {
                      console.log('\n✅ Database connection closed');
                    }
                  });
                } else {
                  console.log('❌ Still no requests found after fix');
                  db.close();
                }
              });
            } else {
              console.log('❌ Vendor mapping fix failed');
              db.close();
            }
          });
        });
      });
    } else {
      console.log('❌ Vendor 36 not found');
      db.close();
    }
  });
});
