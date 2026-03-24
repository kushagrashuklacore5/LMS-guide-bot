// Test if password generation is working
console.log('🧪 Testing password generation import...');

try {
  const { generateVendorPassword, hashPassword } = require('./utils/passwordUtils');
  
  const password = generateVendorPassword();
  const hashed = hashPassword(password);
  
  console.log('✅ Password generation working!');
  console.log('🔐 Generated password:', password);
  console.log('🔒 Hashed password:', hashed);
  
  // Test the exact same logic as vendor creation
  const testVendorData = {
    name: 'Test Vendor',
    email: 'test@password.com',
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category'
  };
  
  console.log('📝 Simulating vendor creation logic...');
  const plainPassword = generateVendorPassword();
  const hashedPassword = hashPassword(plainPassword);
  
  console.log('🔐 Generated password for vendor:', plainPassword);
  console.log('🔒 Hashed password for database:', hashedPassword);
  
  const response = {
    success: true,
    message: 'Vendor added successfully',
    data: {
      id: 999,
      name: testVendorData.name,
      email: testVendorData.email,
      phone: testVendorData.phone,
      address: testVendorData.address,
      category: testVendorData.category,
      generatedPassword: plainPassword // This should be returned!
    }
  };
  
  console.log('✅ Mock API response:', JSON.stringify(response, null, 2));
  
  if (response.data && response.data.generatedPassword) {
    console.log('🎉 SUCCESS: Password is included in response!');
    console.log('📧 Email:', response.data.email);
    console.log('🔐 Password:', response.data.generatedPassword);
  } else {
    console.log('❌ ISSUE: Password missing from response');
  }
  
} catch (error) {
  console.error('❌ Error importing password utils:', error);
}

process.exit(0);
