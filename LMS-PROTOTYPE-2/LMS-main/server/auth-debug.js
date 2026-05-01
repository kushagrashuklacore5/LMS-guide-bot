const jwt = require('jsonwebtoken');

// Test the portal user token generation and verification
console.log('=== Debugging Portal Authentication ===');

// Generate token like in the test
const token = jwt.sign(
  { 
    userId: 69, 
    email: 'portal@core5.co.in', 
    role: 'portal_admin',
    name: 'Portal Admin'
  },
  process.env.JWT_SECRET || 'default_jwt_secret_key',
  { expiresIn: '24h' }
);

console.log('Generated token:', token);

// Verify the token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');
  console.log('Token verification successful:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// Check if portal user exists in database
const db = require('./config/database-switch');

const query = `
  SELECT id, name, email, role, created_at, expires_at, status
  FROM users 
  WHERE email = 'portal@core5.co.in'
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Database error:', err);
    return;
  }

  console.log('Portal user in database:', rows.length > 0 ? 'YES' : 'NO');
  if (rows.length > 0) {
    console.log('Portal user details:', rows[0]);
  }
  
  process.exit(0);
});
