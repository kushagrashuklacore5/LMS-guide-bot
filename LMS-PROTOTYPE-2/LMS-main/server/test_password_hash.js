const bcrypt = require('bcryptjs');

// Test password hashing and verification
async function testPassword() {
    const plainPassword = 'W#TH9JD291MU';
    const hashedPassword = '$2a$12$0FurzOm4piT5d//.9leRH.NcKrPvJ8VxQBcM08CpcoPsJxApscEbK';
    
    console.log('🔍 Testing password verification...');
    console.log('📝 Plain password:', plainPassword);
    console.log('🔐 Hashed password:', hashedPassword);
    
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('✅ Password match:', isValid);
        
        if (!isValid) {
            console.log('❌ Password does not match the hash!');
            
            // Let's create a new hash for this password
            console.log('🔄 Creating new hash...');
            const newHash = await bcrypt.hash(plainPassword, 12);
            console.log('🔐 New hash:', newHash);
            
            // Test the new hash
            const isNewHashValid = await bcrypt.compare(plainPassword, newHash);
            console.log('✅ New hash test:', isNewHashValid);
        }
    } catch (error) {
        console.error('❌ Error testing password:', error.message);
    }
}

testPassword();
