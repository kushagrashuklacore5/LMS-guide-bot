const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Testing Vendor Requests API Logic ===\n');

// Simulate vendor1@gmail.com authentication
const userId = 36; // User ID for vendor1@gmail.com
const vendorId = 16; // Vendor ID for vendor1@gmail.com

console.log(`Testing API logic for User ID: ${userId} → Vendor ID: ${vendorId}\n`);

// Step 1: Test the vendor ID mapping (same as API)
console.log('1. Testing vendor ID mapping...');
db.get('SELECT id FROM vendors WHERE email = (SELECT email FROM users WHERE id = ?)', [userId], (err, vendorRow) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (!vendorRow) {
    console.log('❌ No vendor found for user ID:', userId);
    return;
  }
  
  console.log('✅ Vendor mapping successful:');
  console.log(`- User ID: ${userId}`);
  console.log(`- Vendor ID: ${vendorRow.id}`);
  
  // Step 2: Test the university ID lookup
  console.log('\n2. Testing university ID lookup...');
  db.get('SELECT university_id FROM vendors WHERE id = ?', [vendorRow.id], (err, vendor) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    const universityId = vendor ? vendor.university_id : 1;
    console.log(`✅ University ID: ${universityId}`);
    
    // Step 3: Test the main query (same as API)
    console.log('\n3. Testing main stock requests query...');
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
    
    console.log('Query:', query);
    console.log('Parameters:', [vendorRow.id, universityId]);
    
    db.all(query, [vendorRow.id, universityId], (err, requests) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log(`\n✅ Found ${requests.length} request items:`);
      
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
        
        // Display grouped results
        Object.values(groupedRequests).forEach((request, index) => {
          console.log(`\n📋 Request ${index + 1}:`);
          console.log(`- ID: ${request.id}`);
          console.log(`- Title: ${request.title}`);
          console.log(`- Status: ${request.status}`);
          console.log(`- Items: ${request.items.length}`);
          
          request.items.forEach((item, itemIndex) => {
            console.log(`  Item ${itemIndex + 1}: ${item.item_name} (${item.quantity_requested})`);
          });
        });
        
        console.log('\n✅ API should return these requests correctly!');
        
      } else {
        console.log('❌ No requests found with this query');
        
        // Test without university filter
        console.log('\n4. Testing without university filter...');
        db.all(
          `SELECT DISTINCT 
            sr.id, sr.title, sr.description, sr.status, sr.created_at, 
            sri.item_name, sri.category, sri.quantity_requested
          FROM stock_requests sr
          JOIN stock_request_items sri ON sr.id = sri.request_id
          WHERE sri.vendor_id = ?
          ORDER BY sr.created_at DESC`,
          [vendorRow.id],
          (err, requests) => {
            if (err) {
              console.error('Error:', err);
              return;
            }
            
            console.log(`Without university filter: ${requests.length} requests`);
            
            if (requests.length > 0) {
              console.log('❌ Problem: University filter is removing requests');
              console.log('🔧 Solution: Fix university_id in stock_requests or remove filter');
            } else {
              console.log('❌ Problem: No requests found at all');
            }
          }
        );
      }
      
      console.log('\n=== API Test Complete ===');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('✅ Database connection closed');
        }
      });
    });
  });
});
