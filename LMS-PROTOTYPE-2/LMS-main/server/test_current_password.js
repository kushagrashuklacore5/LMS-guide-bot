const bcrypt = require('bcryptjs');

// Test current password hash
async function testCurrentPassword() {
    const newPassword = 'NewPassword123';
    const currentHash = '$2a$12$wNPIsf8aI09fKe4UjxraKunH.cITkIQotG8kCiwbw0SRw7/a9NG.W';
    
    console.log('🔍 Testing current password hash...');
    console.log('📝 New password:', newPassword);
    console.log('🔐 Current hash:', currentHash);
    
    try {
        const isValid = await bcrypt.compare(newPassword, currentHash);
        console.log('✅ Password match:', isValid);
        
        if (!isValid) {
            console.log('❌ Current hash does not match NewPassword123!');
            
            // Test with original password
            const originalPassword = 'W#TH9JD291MU';
            const isOriginalValid = await bcrypt.compare(originalPassword, currentHash);
            console.log('✅ Original password match:', isOriginalValid);
            
            // Create a new hash for NewPassword123
            console.log('🔄 Creating correct hash for NewPassword123...');
            const correctHash = await bcrypt.hash(newPassword, 12);
            console.log('🔐 Correct hash:', correctHash);
            
            // Test the new hash
            const isNewHashValid = await bcrypt.compare(newPassword, correctHash);
            console.log('✅ New hash verification:', isNewHashValid);
        }
    } catch (error) {
        console.error('❌ Error testing password:', error.message);
    }
}

testCurrentPassword();
