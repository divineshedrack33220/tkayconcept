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

// Request-scoped user cache — avoids duplicate DB lookups across middleware/routes
async function resolveDbUser(clerkId) {
  const user = await User.findOne({ clerkId }).lean();
  if (!user) return null;
  return user;
}

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
      // Fast path: check if user already exists in DB (no external API call)
      let user = await User.findOne({ clerkId: payload.sub }).select('-__v').lean();

      if (!user) {
        // Only call Clerk API for new users
        const clerkUser = await clerkClient.users.getUser(payload.sub);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
        const firstName = clerkUser.firstName || '';
        const lastName = clerkUser.lastName || '';
        const avatar = clerkUser.imageUrl || '';

        if (email) {
          user = await User.findOneAndUpdate(
            { clerkId: payload.sub },
            { $setOnInsert: { clerkId: payload.sub, email, firstName, lastName, avatar } },
            { upsert: true, new: true, lean: true },
          );
        }
      }
      req.dbUser = user;
    } catch (syncError) {
      console.error('Auto-sync user error (non-fatal):', syncError.message);
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate, requireAuth, resolveDbUser };
