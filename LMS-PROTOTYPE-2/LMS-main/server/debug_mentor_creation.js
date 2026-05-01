const axios = require('axios');

async function debugMentorCreation() {
  console.log('🔍 Debugging Mentor Creation...\n');
  
  try {
    // Login as admin
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
    
    // Try to create mentor with error handling
    console.log('\n👨‍🏫 Attempting to create mentor...');
    try {
      const newMentor = await axios.post('http://127.0.0.1:5002/api/admin/create-teacher', {
        name: 'Debug Mentor',
        email: 'debugmentor@pro.com',
        specialization: 'Debug Testing'
      }, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Mentor creation successful');
      console.log('📊 Response:', JSON.stringify(newMentor.data, null, 2));
      
    } catch (error) {
      console.log('❌ Mentor creation failed:');
      console.log('📊 Status:', error.response?.status);
      console.log('📊 Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('📊 Message:', error.response?.data?.message);
      
      if (error.response?.status === 400) {
        console.log('🔍 Possible causes:');
        console.log('   - Mentor with this email already exists');
        console.log('   - Missing required fields');
        console.log('   - Validation error');
      }
    }
    
    // Check existing mentors
    console.log('\n📋 Checking existing mentors...');
    const db = require('./config/database-switch');
    db.all('SELECT id, name, email, role, subscriptionPlan FROM users WHERE role = "mentor"', (err, mentors) => {
      if (err) {
        console.error('Error fetching mentors:', err);
      } else {
        console.log('👨‍🏫 Existing mentors:');
        mentors.forEach((mentor, i) => {
          console.log(`   ${i+1}. ID: ${mentor.id}, Name: ${mentor.name}, Email: ${mentor.email}, Plan: ${mentor.subscriptionPlan}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugMentorCreation();
