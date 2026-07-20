const Coupon = require('../models/Coupon');
const couponService = require('../services/coupon.service');

exports.list = async (req, res, next) => {
  try {
    const { active, limit = 50 } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ data: coupons });
  } catch (err) {
    next(err);
  }
};

exports.validate = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.query;
    const result = await couponService.validate(code, parseFloat(orderTotal || 0));
    res.json({
      data: {
        ...result.coupon.toObject(),
        discount: result.discount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ data: coupon });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ data: coupon });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
