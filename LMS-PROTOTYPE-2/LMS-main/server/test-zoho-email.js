// Test Zoho Email to Your Real Email Address
const emailService = require('./services/emailService');

async function testZohoEmail() {
  console.log('🧪 Testing Zoho Email to Your Real Address...');
  console.log('');

  try {
    // Test sending OTP to your Zoho email
    const testEmail = 'support@core5.co.in'; // Your actual Zoho email
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit OTP
    
    console.log('📧 Sending test OTP to:', testEmail);
    console.log('🔢 Test OTP:', testOTP);
    console.log('✉️  Using Zoho SMTP (smtp.zoho.in:465)');
    console.log('');

    const result = await emailService.sendOTPEmail(testEmail, testOTP);
    
    console.log('✅ Email Service Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.emailService === 'zoho') {
      console.log('🎉 SUCCESS: Real Zoho SMTP is working!');
      console.log('📱 Check your Zoho email inbox for the test OTP');
      console.log('🔗 Email should arrive at: support@core5.co.in');
      console.log('🔢 Look for OTP:', testOTP);
    } else if (result.emailService === 'mock') {
      console.log('⚠️  INFO: Using mock service (Zoho SMTP failed)');
    }

  } catch (error) {
    console.error('❌ Zoho Email Test Failed:', error.message);
  }
}

// Run the test
testZohoEmail();
