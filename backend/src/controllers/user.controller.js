const User = require('../models/User');

// POST /api/users/sync - Sync Clerk user to MongoDB (called from frontend after login)
const syncUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, phone, avatar } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: 'clerkId and email are required' });
    }

    let user = await User.findOne({ clerkId });

    if (user) {
      user.email = email;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      if (phone !== undefined) user.phone = phone;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      user = await User.create({ clerkId, email, firstName, lastName, phone, avatar });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ message: 'Failed to sync user' });
  }
};

// GET /api/users/me - Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// PUT /api/users/me - Update current user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// GET /api/users/me/addresses - Get all addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user.addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Failed to get addresses' });
  }
};

// POST /api/users/me/addresses - Add new address
const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country, isDefault } = req.body;
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push({ label, street, city, state, zipCode, country, isDefault });
    await user.save();

    res.status(201).json({ data: user.addresses });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Failed to add address' });
  }
};

// PUT /api/users/me/addresses/:addressId - Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, street, city, state, zipCode, country, isDefault } = req.body;
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    if (label !== undefined) address.label = label;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (country !== undefined) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    res.json({ data: user.addresses });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
};

// DELETE /api/users/me/addresses/:addressId - Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses.pull(addressId);
    await user.save();

    res.json({ data: user.addresses });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
};

// PUT /api/users/me/addresses/:addressId/default - Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses.forEach((addr) => { addr.isDefault = false; });
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    address.isDefault = true;
    await user.save();

    res.json({ data: user.addresses });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
};

// GET /api/users/:clerkId - Admin: get user by clerkId
const getUserByClerkId = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

// PUT /api/users/:clerkId/role - Admin: update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'content_manager', 'inventory_manager', 'support', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ data: user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

module.exports = {
  syncUser,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserByClerkId,
  updateUserRole,
};
