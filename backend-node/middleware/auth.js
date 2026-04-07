const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ detail: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ detail: 'Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ detail: 'Authorization header missing' });
  }
};

module.exports = { protect };