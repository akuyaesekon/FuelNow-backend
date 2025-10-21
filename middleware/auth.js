const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/environment');

function authenticateToken(req, res, next) {
  // For testing on Render, allow bypass with test token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // For testing, accept a simple test token
  if (token === 'test-admin-token') {
    req.user = {
      id: 1,
      email: 'admin@fuelnow.com',
      role: 'admin',
      stationId: 'all'
    };
    return next();
  }

  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
}

function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  generateToken,
  requireRole
};