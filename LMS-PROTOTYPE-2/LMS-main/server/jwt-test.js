const jwt = require('jsonwebtoken');

console.log('=== JWT Secret Debug ===');
console.log('JWT_SECRET from process.env:', process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');

const fallbackSecret = 'default_jwt_secret_key';
console.log('Fallback secret:', fallbackSecret);

// Test token generation with both secrets
const tokenWithEnv = jwt.sign(
  { userId: 69, email: 'portal@core5.co.in', role: 'portal_admin' },
  process.env.JWT_SECRET || fallbackSecret,
  { expiresIn: '24h' }
);

const tokenWithFallback = jwt.sign(
  { userId: 69, email: 'portal@core5.co.in', role: 'portal_admin' },
  fallbackSecret,
  { expiresIn: '24h' }
);

console.log('\nToken with env secret (first 50 chars):', tokenWithEnv.substring(0, 50) + '...');
console.log('Token with fallback secret (first 50 chars):', tokenWithFallback.substring(0, 50) + '...');

// Test verification
try {
  const decoded1 = jwt.verify(tokenWithEnv, process.env.JWT_SECRET || fallbackSecret);
  console.log('Env token verification: SUCCESS');
} catch (error) {
  console.log('Env token verification FAILED:', error.message);
}

try {
  const decoded2 = jwt.verify(tokenWithFallback, fallbackSecret);
  console.log('Fallback token verification: SUCCESS');
} catch (error) {
  console.log('Fallback token verification FAILED:', error.message);
}

process.exit(0);
