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
const isContentManager = checkRole('super_admin', 'admin', 'content_manager');
const isInventoryManager = checkRole('super_admin', 'admin', 'inventory_manager');
const isSupport = checkRole('super_admin', 'admin', 'support');

module.exports = { checkRole, isAdmin, isContentManager, isInventoryManager, isSupport };
