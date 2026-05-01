const axios = require('axios');
require('dotenv').config();

console.log('=== Debug Upgrade Process ===');

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

async function debugUpgradeProcess() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Check database before upgrade
    console.log('\n1. Database state before upgrade:');
    const db = require('./config/database-switch');
    
    const checkQuery = `
      SELECT * FROM subscriptions 
      WHERE superadminId LIKE '%69%'
      ORDER BY createdAt DESC
      LIMIT 3
    `;
    
    db.all(checkQuery, [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log('Subscriptions containing 69 before upgrade:');
      rows.forEach(row => {
        console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}, Created: ${row.createdAt}`);
      });
      
      // Now perform upgrade and capture response
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
        console.log('Upgrade response success:', upgradeResponse.data.success);
        console.log('Upgrade response plan:', upgradeResponse.data.subscription.planName);
        
        // Check database immediately after upgrade
        setTimeout(() => {
          console.log('\n3. Database state after upgrade:');
          db.all(checkQuery, [], (err, rows) => {
            if (err) {
              console.error('Error:', err);
              return;
            }
            
            console.log('Subscriptions containing 69 after upgrade:');
            rows.forEach(row => {
              console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}, Created: ${row.createdAt}`);
            });
            
            // Check current subscription
            console.log('\n4. Checking current subscription via API:');
            axios.get(`${API_BASE}/api/subscriptions/current`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }).then(currentResponse => {
              console.log('Current subscription plan:', currentResponse.data.subscription.planName);
              
              console.log('\n=== Summary ===');
              console.log('Upgrade response shows:', upgradeResponse.data.subscription.planName);
              console.log('Current subscription shows:', currentResponse.data.subscription.planName);
              console.log('Database has Standard plan:', rows.some(r => r.planName === 'Standard') ? 'YES' : 'NO');
              
              process.exit(0);
            }).catch(error => {
              console.error('Error checking current subscription:', error.response?.data || error.message);
              process.exit(1);
            });
          });
        }, 1000); // Wait 1 second for database to update
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

debugUpgradeProcess();
