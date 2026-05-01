const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Debug the entire password reset process
async function debugPasswordReset() {
    console.log('🔍 DEBUGGING PASSWORD RESET PROCESS');
    console.log('=====================================');
    
    const usersFile = path.join(__dirname, 'data', 'users.json');
    const email = 'anisingh2309@gmail.com';
    const newPassword = 'DebugTest123';
    
    try {
        // Step 1: Read current users
        console.log('\n📂 Step 1: Reading current users...');
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        console.log('📋 Global users count:', usersData.global?.length || 0);
        
        // Step 2: Find user
        console.log('\n🔍 Step 2: Finding user...');
        const globalUsers = usersData.global || [];
        const userIndex = globalUsers.findIndex(user => user.email === email);
        console.log('👤 User index:', userIndex);
        
        if (userIndex !== -1) {
            console.log('✅ User found:', globalUsers[userIndex].email);
            console.log('🔐 Current password hash:', globalUsers[userIndex].password);
        } else {
            console.log('❌ User not found');
            return;
        }
        
        // Step 3: Create new hash
        console.log('\n🔧 Step 3: Creating new password hash...');
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        console.log('🔐 New password hash:', hashedPassword);
        
        // Step 4: Update user
        console.log('\n💾 Step 4: Updating user password...');
        globalUsers[userIndex].password = hashedPassword;
        usersData.global = globalUsers;
        
        // Step 5: Save to file
        console.log('\n💾 Step 5: Saving to database...');
        fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2), 'utf8');
        console.log('✅ Database saved successfully');
        
        // Step 6: Verify save
        console.log('\n✅ Step 6: Verifying save...');
        const verifyData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        const verifyUser = verifyData.global[userIndex];
        console.log('🔐 Verified hash in database:', verifyUser.password);
        console.log('🔍 Hashes match:', verifyUser.password === hashedPassword);
        
        // Step 7: Test password verification
        console.log('\n🧪 Step 7: Testing password verification...');
        const isValid = await bcrypt.compare(newPassword, verifyUser.password);
        console.log('✅ Password verification:', isValid);
        
        // Step 8: Test login (simulate)
        console.log('\n🔐 Step 8: Simulating login check...');
        const loginUsers = verifyData.global || [];
        const loginUser = loginUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (loginUser) {
            const loginValid = await bcrypt.compare(newPassword, loginUser.password);
            console.log('✅ Login simulation successful:', loginValid);
        } else {
            console.log('❌ User not found for login simulation');
        }
        
        console.log('\n🎉 DEBUG COMPLETE');
        
    } catch (error) {
        console.error('❌ Debug error:', error.message);
        console.error('❌ Stack:', error.stack);
    }
}

debugPasswordReset();
