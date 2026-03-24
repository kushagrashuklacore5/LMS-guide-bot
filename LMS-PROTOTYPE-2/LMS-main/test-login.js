// Test login API directly
const testLogin = async () => {
  try {
    console.log('🔥 Testing login API...');
    
    const response = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '12345678'
      }),
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Login API Error:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ Login API Success:', data);
    
    if (data.token && data.user) {
      console.log(`🎉 Login successful! User: ${data.user.name}, Role: ${data.user.role}`);
    } else {
      console.error('❌ Login failed - missing token or user');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Auto-run the test
testLogin();
