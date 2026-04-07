// Test Email Service Status
const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...');
  console.log('');

  try {
    // Test sending OTP to your email
    const testEmail = 'support@core5.co.in'; // Your email
    const testOTP = '123456';
    
    console.log('📧 Sending test OTP to:', testEmail);
    console.log('🔢 Test OTP:', testOTP);
    console.log('');

    const result = await emailService.sendOTPEmail(testEmail, testOTP);
    
    console.log('✅ Email Service Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.emailService === 'real-gmail') {
      console.log('🎉 SUCCESS: Real Gmail SMTP is working!');
      console.log('📱 Check your email inbox for the test OTP');
    } else if (result.emailService === 'test-ethereal') {
      console.log('⚠️  INFO: Using Ethereal test service');
      console.log('🔗 Check preview URL for the test email');
    } else if (result.emailService === 'mock') {
      console.log('🔄 INFO: Using mock service (console only)');
    }

  } catch (error) {
    console.error('❌ Email Service Test Failed:', error.message);
  }
}

// Run the test
testEmailService();
