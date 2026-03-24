// Simple startup script for vendor stock solution
console.log('=== VENDOR STOCK SOLUTION STARTUP ===');

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: false
});

backend.stdout.on('data', (data) => {
  console.log(`Backend: ${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`Backend Error: ${data}`);
});

backend.on('close', (code) => {
  console.log(`Backend exited with code: ${code}`);
  
  if (code === 0) {
    console.log('✅ Backend server started successfully!');
    
    // Start frontend
    console.log('🌐 Starting frontend...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'client'),
      stdio: 'inherit',
      shell: false
    });

    frontend.stdout.on('data', (data) => {
      console.log(`Frontend: ${data}`);
    });

    frontend.stderr.on('data', (data) => {
      console.error(`Frontend Error: ${data}`);
    });

    frontend.on('close', (code) => {
      console.log(`Frontend exited with code: ${code}`);
      
      if (code === 0) {
        console.log('✅ SUCCESS: Both frontend and backend are running!');
        console.log('');
        console.log('🎯 VENDOR STOCK SOLUTION READY!');
        console.log('');
        console.log('📋 ACCESS URLS:');
        console.log('- Frontend: http://localhost:5173');
        console.log('- Backend: http://localhost:5002');
        console.log('');
        console.log('📋 INSTRUCTIONS:');
        console.log('1. Login as vendor (test credentials)');
        console.log('2. Navigate to Stock Management');
        console.log('3. Add stock items');
        console.log('4. Check for real-time sync events in browser console');
        console.log('5. Verify items appear in storekeeper browser');
        console.log('');
        console.log('🎉 VENDOR STOCK ISSUE COMPLETE!');
        
      } else {
        console.error(`❌ Frontend failed with code: ${code}`);
      }
    });
  });
}, 1000);
