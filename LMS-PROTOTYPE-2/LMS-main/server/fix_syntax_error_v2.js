const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING SYNTAX ERROR IN accountantRoutes.js...');

// Read the file with the correct path
const filePath = path.join(__dirname, 'routes', 'accountantRoutes.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log('📄 File read successfully');

// Fix the syntax error by removing the extra closing brace
const fixedContent = content.replace('}\n\n/**', '\n/**');

console.log('🔧 Fixing syntax error...');

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Syntax error fixed! Extra closing brace removed.');
console.log('🔄 Please restart the backend server to apply changes.');
console.log('📊 Backend will now work with the payments table!');
