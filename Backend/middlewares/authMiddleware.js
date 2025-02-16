const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('Decoded token:', decoded);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized access' });
    console.log(error);
    
  }
};

module.exports = authMiddleware;
