const Coupon = require('../models/Coupon');

exports.list = async (req, res) => {
  try {
    const { active, limit = 50 } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ data: coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const { code, orderTotal } = req.query;
    if (!code) return res.status(400).json({ error: 'Code is required' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
    if (orderTotal && coupon.minimumOrder > 0 && parseFloat(orderTotal) < coupon.minimumOrder) {
      return res.status(400).json({ error: `Minimum order of £${coupon.minimumOrder} required` });
    }
    let discount = coupon.type === 'percentage' ? (parseFloat(orderTotal || 0) * coupon.value / 100) : coupon.value;
    if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
    res.json({ data: { ...coupon.toObject(), discount: Math.round(discount * 100) / 100 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ data: coupon });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ data: coupon });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
