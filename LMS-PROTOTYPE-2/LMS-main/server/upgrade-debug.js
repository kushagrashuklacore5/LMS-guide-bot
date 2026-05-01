const axios = require('axios');
require('dotenv').config();

console.log('=== Debug Upgrade Save Process ===');

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

async function debugUpgradeSave() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Check current state
    console.log('\n1. Current database state:');
    const db = require('./config/database-switch');
    
    const checkQuery = `
      SELECT * FROM subscriptions 
      WHERE superadminId LIKE '%69%'
      ORDER BY createdAt DESC
      LIMIT 5
    `;
    
    db.all(checkQuery, [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Subscriptions containing 69:');
        rows.forEach(row => {
          console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}, Created: ${row.createdAt}`);
        });
      }
      
      // Now perform upgrade
      console.log('\n2. Performing upgrade...');
      axios.post(`${API_BASE}/api/subscriptions/test-upgrade`, {
        planId: 'standard',
        planName: 'Standard',
        durationDays: 30
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(upgradeResponse => {
        console.log('Upgrade response:', upgradeResponse.data.success);
        
        // Check database after upgrade
        console.log('\n3. Database state after upgrade:');
        db.all(checkQuery, [], (err, rows) => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log('Subscriptions containing 69 after upgrade:');
            rows.forEach(row => {
              console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}, Created: ${row.createdAt}`);
            });
          }
          
          process.exit(0);
        });
      }).catch(error => {
        console.error('Upgrade error:', error.response?.data || error.message);
        process.exit(1);
      });
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugUpgradeSave();
