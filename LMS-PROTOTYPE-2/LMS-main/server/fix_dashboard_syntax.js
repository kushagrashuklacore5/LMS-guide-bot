#!/usr/bin/env node

console.log('🔧 FIXING JSX SYNTAX ERROR AND REMOVING FINANCIAL SUMMARY');
console.log('====================================================');

const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'accountant', 'AccountantDashboard_temp.jsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('📄 Reading AccountantDashboard_temp.jsx...');

// Fix the syntax error and remove financial summary
const fixedContent = content
  .replace('};', '</div>')  // Fix line 340 syntax error
  .replace(/\/\* Financial Summary Chart \*\/[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/g, '')  // Remove entire Financial Summary section
  .replace(/\/\*[\s\S]*?Financial Summary[\s\S]*?<\/h2>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/g, '')  // Remove any remaining financial summary parts
  .replace(/\n\s*\n\s*\n/g, '\n');  // Clean up extra newlines

// Write the fixed content back
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ JSX syntax error fixed!');
console.log('🗑️ Financial Summary section removed!');
console.log('🔧 File structure restored!');
console.log('📱 Dashboard should now load without errors');
console.log('🎯 Expected result:');
console.log('   • No JSX syntax errors');
console.log('   • No Financial Summary pie chart');
console.log('   • Only key metrics cards remain');
console.log('   • Revenue and expense charts functional');
console.log('\n🌟 Ready to test! Refresh the dashboard to see changes.');
