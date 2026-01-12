const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Rate limiting middleware (simple implementation)
const requestCounts = new Map();

// Strict rate limiter for authentication endpoints (prevent brute force)
const AUTH_RATE_LIMIT = 10; // 10 login/register attempts
const AUTH_TIME_WINDOW = 60000; // per minute

// Generous rate limiter for general API use (prevent abuse)
const API_RATE_LIMIT = 1000; // 1000 requests
const API_TIME_WINDOW = 60000; // per minute

const createRateLimiter = (limit, timeWindow) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key = `${ip}-${limit}`; // Different limits use different keys
    
    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetTime: now + timeWindow });
      return next();
    }
    
    const record = requestCounts.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + timeWindow;
      return next();
    }
    
    if (record.count >= limit) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }
    
    record.count++;
    next();
  };
};

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime + 60000) { // 1 minute after reset time
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

const authRateLimiter = createRateLimiter(AUTH_RATE_LIMIT, AUTH_TIME_WINDOW);
const apiRateLimiter = createRateLimiter(API_RATE_LIMIT, API_TIME_WINDOW);

module.exports = { authenticateToken, authRateLimiter, apiRateLimiter };

