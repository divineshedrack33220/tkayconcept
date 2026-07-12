const User = require('../models/User');

const checkRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    req.dbUser = user;
    next();
  };
};

const isAdmin = checkRole('super_admin', 'admin');

module.exports = { checkRole, isAdmin };
