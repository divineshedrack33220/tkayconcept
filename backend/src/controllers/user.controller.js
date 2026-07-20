const User = require('../models/User');

const syncUser = async (req, res, next) => {
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
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
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
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user.addresses });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
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
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
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
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
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
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
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
    next(error);
  }
};

const getUserByClerkId = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
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
    next(error);
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
