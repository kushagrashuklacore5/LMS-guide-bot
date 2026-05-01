const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Fix new password in database
async function fixNewPassword() {
    const usersFile = path.join(__dirname, 'data', 'users.json');
    
    try {
        // Read current users
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        
        // Find the user in global storage
        const globalUsers = usersData.global || [];
        const userIndex = globalUsers.findIndex(user => user.email === 'anisingh2309@gmail.com');
        
        if (userIndex !== -1) {
            // Create correct hash for the new password
            const newPassword = 'NewPassword123';
            const correctHash = await bcrypt.hash(newPassword, 12);
            
            // Update the password
            globalUsers[userIndex].password = correctHash;
            usersData.global = globalUsers;
            
            // Save back to file
            fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2), 'utf8');
            
            console.log('✅ New password updated successfully for anisingh2309@gmail.com');
            console.log('🔐 New hash:', correctHash);
            
            // Test the new hash
            const isValid = await bcrypt.compare(newPassword, correctHash);
            console.log('✅ New password verification test:', isValid);
            
        } else {
            console.log('❌ User not found in global storage');
        }
        
    } catch (error) {
        console.error('❌ Error fixing new password:', error.message);
    }
}

fixNewPassword();
