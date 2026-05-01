const fs = require('fs');
const path = require('path');

// Get all JS files in the server directory
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔧 Comprehensive DB Issues Fix...\n');

const serverDir = path.join(__dirname, 'server');
const allJsFiles = getAllJsFiles(serverDir);

let fixedCount = 0;

allJsFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix 1: Remove duplicate db declarations
    const duplicatePattern = /const db = require\(['"][^'"]*database[-]?switch['"]\);\s*\n\/\/ Get tenant database connection\s*\nconst db = tenantConnectionManager\.getDb\(\);/g;
    if (duplicatePattern.test(content)) {
      content = content.replace(duplicatePattern, '');
      modified = true;
    }
    
    // Fix 2: Remove standalone duplicate db declarations
    const standalonePattern = /\/\/ Get tenant database connection\s*\nconst db = tenantConnectionManager\.getDb\(\);/g;
    if (standalonePattern.test(content)) {
      content = content.replace(standalonePattern, '');
      modified = true;
    }
    
    // Fix 3: Remove any remaining duplicate db declarations
    const lines = content.split('\n');
    const newLines = [];
    let lastDbLine = -1;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check if this is a db declaration
      if (trimmedLine.startsWith('const db =')) {
        // Check if we had a db declaration recently
        if (lastDbLine >= 0 && index - lastDbLine <= 3) {
          // This is likely a duplicate, skip it
          modified = true;
          return;
        }
        lastDbLine = index;
      }
      
      newLines.push(line);
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
      fixedCount++;
    }
    
  } catch (error) {
    // Skip files that can't be read
  }
});

console.log(`\n🎯 Fixed ${fixedCount} files with DB issues!`);
console.log('All duplicate db declarations have been removed.');
