const axios = require('axios');
require('dotenv').config();

// Generate JWT token for portal user
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

async function createTestSuperadmins() {
  try {
    const token = generatePortalToken();
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('=== Creating Test Superadmins ===');
    
    // Test superadmin credentials to create
    const testSuperadmins = [
      { email: 'admin@test.com', password: 'Admin123!' },
      { email: 'super@admin.com', password: 'Super123!' },
      { email: 'test@superadmin.com', password: 'Test123!' }
    ];
    
    for (const superadmin of testSuperadmins) {
      try {
        console.log(`\nCreating superadmin: ${superadmin.email}`);
        
        const response = await axios.post(
          'http://127.0.0.1:5002/api/superadmin/internal/create-superadmin',
          { email: superadmin.email },
          config
        );
        
        if (response.data.success) {
          console.log(`\n=== Superadmin Created Successfully ===`);
          console.log(`Email: ${superadmin.email}`);
          console.log(`Password: ${response.data.data.generatedPassword}`);
          console.log(`ID: ${response.data.data.id}`);
          console.log(`Expires: ${new Date(response.data.data.expires_at).toLocaleDateString()}`);
          console.log(`Status: ${response.data.data.status}`);
          console.log('=====================================\n');
        } else {
          console.log(`Failed to create ${superadmin.email}:`, response.data.message);
        }
        
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('Email already exists')) {
          console.log(`Superadmin ${superadmin.email} already exists`);
        } else {
          console.log(`Error creating ${superadmin.email}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n=== Final Superadmin Credentials ===');
    console.log('Here are your superadmin login credentials:');
    console.log('');
    
    // Get the current superadmins to show all credentials
    const superadminsResponse = await axios.get('http://127.0.0.1:5002/api/superadmin/internal/superadmins', config);
    
    if (superadminsResponse.data.success) {
      superadminsResponse.data.data.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Password: ${admin.generatedPassword || 'Password hidden - needs reset'}`);
        console.log(`   Status: ${admin.status || 'Not set'}`);
        console.log(`   Expires: ${new Date(admin.expires_at).toLocaleDateString()}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

createTestSuperadmins();
