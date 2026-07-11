const { verifyToken, createClerkClient } = require('@clerk/backend');
const User = require('../models/User');

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      req.user = null;
      return next();
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    req.user = payload;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    req.user = payload;

    try {
      const clerkUser = await clerkClient.users.getUser(payload.sub);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const avatar = clerkUser.imageUrl || '';

      if (email) {
        let user = await User.findOne({ clerkId: payload.sub });
        if (user) {
          user.email = email;
          if (firstName) user.firstName = firstName;
          if (lastName) user.lastName = lastName;
          if (avatar) user.avatar = avatar;
          await user.save();
        } else {
          user = await User.create({
            clerkId: payload.sub,
            email,
            firstName,
            lastName,
            avatar,
          });
        }
        req.dbUser = user;
      }
    } catch (syncError) {
      console.error('Auto-sync user error (non-fatal):', syncError.message);
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate, requireAuth };
