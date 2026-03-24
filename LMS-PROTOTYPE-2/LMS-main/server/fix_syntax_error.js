const fs = require('fs');

console.log('🔧 FIXING SYNTAX ERROR IN accountantRoutes.js...');

// Read the file
const filePath = 'server/routes/accountantRoutes.js';
const content = fs.readFileSync(filePath, 'utf8');

// Fix the syntax error by removing the extra closing brace
const fixedContent = content.replace('}\n\n/**', '\n/**');

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Syntax error fixed! Extra closing brace removed.');
console.log('🔄 Please restart the backend server to apply changes.');
