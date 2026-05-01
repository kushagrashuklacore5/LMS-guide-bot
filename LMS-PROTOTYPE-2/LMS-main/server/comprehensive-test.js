const axios = require('axios');
require('dotenv').config();

console.log('=== Comprehensive Subscription Test ===');

const API_BASE = 'http://127.0.0.1:5002';

// Generate real portal token
function generatePortalToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  
  return jwt.sign(
    { 
      userId: 69, 
      email: 'portal@core5.co.in', 
      role: 'portal_admin',
      name: 'Portal Admin'
    },
    secret,
    { expiresIn: '24h' }
  );
}

async function comprehensiveTest() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Test 1: Current subscription
    console.log('\n1. Current subscription test:');
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current plan:', currentResponse.data.subscription.planName);
    console.log('Current status:', currentResponse.data.subscription.status);
    console.log('Current ID:', currentResponse.data.subscription.id || 'No ID');
    
    // Test 2: Feature access
    console.log('\n2. Feature access test:');
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Feature plan:', featureResponse.data.currentPlan);
    console.log('Can access calendar:', featureResponse.data.canAccessCalendar);
    console.log('Can export data:', featureResponse.data.canExportData);
    
    // Test 3: Direct database check
    console.log('\n3. Direct database check:');
    const db = require('./config/database-switch');
    
    const checkQuery = `
      SELECT * FROM subscriptions 
      WHERE superadminId LIKE '%69%'
      ORDER BY createdAt DESC
      LIMIT 3
    `;
    
    db.all(checkQuery, [], (err, rows) => {
      if (err) {
        console.error('Error checking database:', err);
        return;
      }
      
      console.log('Database subscriptions:');
      rows.forEach(row => {
        console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}, Status: ${row.status}`);
      });
      
      // Test 4: Try to find subscription manually
      console.log('\n4. Manual subscription lookup:');
      const findSubscriptionById = (userId) => {
        return new Promise((resolve, reject) => {
          let superadminId = userId;
          const userIdStr = String(userId);
          
          if (userIdStr.startsWith('superadmin-')) {
            superadminId = userIdStr;
            console.log(`Using existing superadminId: ${superadminId}`);
          } else if (userId && parseInt(userId) > 10) {
            superadminId = `superadmin-${userId}`;
            console.log(`Converting to superadminId: ${superadminId}`);
          } else {
            console.log(`Using regular userId: ${userId}`);
          }
          
          console.log(`Looking for subscription with superadminId: ${superadminId}`);
          
          db.get(
            'SELECT * FROM subscriptions WHERE superadminId = ?',
            [superadminId],
            (err, row) => {
              if (err) {
                console.error('Error finding subscription:', err);
                reject(err);
              } else {
                console.log(`Found subscription:`, row ? {
                  id: row.id,
                  superadminId: row.superadminId,
                  planName: row.planName,
                  status: row.status
                } : 'None');
                resolve(row);
              }
            }
          );
        });
      };
      
      // Test with both formats
      findSubscriptionById('superadmin-69').then(sub1 => {
        console.log('superadmin-69 lookup:', sub1 ? 'Found' : 'Not found');
        
        findSubscriptionById('69').then(sub2 => {
          console.log('69 lookup:', sub2 ? 'Found' : 'Not found');
          
          console.log('\n=== Summary ===');
          console.log('Current subscription API:', currentResponse.data.subscription.planName);
          console.log('Feature access API:', featureResponse.data.currentPlan);
          console.log('Database superadmin-69:', rows.find(r => r.superadminId === 'superadmin-69')?.planName || 'Not found');
          console.log('Database 69:', rows.find(r => r.superadminId === '69')?.planName || 'Not found');
          console.log('Manual lookup superadmin-69:', sub1?.planName || 'Not found');
          console.log('Manual lookup 69:', sub2?.planName || 'Not found');
          
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

comprehensiveTest();
