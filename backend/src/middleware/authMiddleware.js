const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure this path correctly points to your User model

/**
 * Protect routes: ensures user is logged in and attaches 
 * the full Mongoose User document to the request object.
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check for token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      message: "Not authorized, no token provided" 
    });
  }

  try {
    // 2. Verify token using the secret in your .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach full user data to the request object
    // We fetch the user from DB to ensure they still exist and have correct permissions
    // .select('-password') ensures we don't carry the hash around the app
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ 
        message: "The user belonging to this token no longer exists." 
      });
    }
    
    // 4. Move to the next function/route
    next(); 
  } catch (err) {
    console.error("Auth Middleware Error:", err.name);
    return res.status(401).json({ 
      message: "Token is invalid or expired" 
    });
  }
};

/**
 * Admin Only: ensures the logged-in user has admin role.
 * MUST be used after the protect middleware.
 */
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access denied: Requires Admin privileges" 
    });
  }
};