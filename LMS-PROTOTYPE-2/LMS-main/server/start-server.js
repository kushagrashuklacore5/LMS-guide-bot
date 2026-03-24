const http = require('http');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

console.log('[WRAPPER] Starting server...');

try {
  require('./server.js');
  console.log('[WRAPPER] server.js loaded');
} catch (e) {
  console.error('[WRAPPER] Error loading server.js:', e.message);
  console.error(e.stack);
  process.exit(1);
}

setTimeout(() => {
  console.log('[WRAPPER] Server has been running for 10 seconds');
}, 10000);
