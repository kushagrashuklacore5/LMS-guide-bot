const rateLimit = require('express-rate-limit');

// Simple rate limiting configuration - 50 requests per minute
const createRateLimiter = (windowMs = 60000, max = 50, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limiters for different endpoints - all set to 50 requests per minute
const rateLimiters = {
  // Authentication endpoints - 50 requests per minute
  login: createRateLimiter(60000, 50, 'Too many login attempts. Please try again later.'),
  register: createRateLimiter(60000, 50, 'Too many registration attempts. Please try again later.'),
  
  // General API endpoints - 50 requests per minute
  general: createRateLimiter(60000, 50, 'Too many requests. Please try again later.'),
  
  // Sensitive endpoints - 50 requests per minute
  sensitive: createRateLimiter(60000, 50, 'Too many sensitive operations. Please try again later.'),
  
  // Payment endpoints - 50 requests per minute
  createOrder: createRateLimiter(60000, 50, 'Too many payment attempts. Please try again later.'),
  verifyPayment: createRateLimiter(60000, 50, 'Too many payment verification attempts. Please try again later.')
};

module.exports = { rateLimiters };
