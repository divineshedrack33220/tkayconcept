const Coupon = require('../models/Coupon');
const AppError = require('../errors/AppError');

class CouponService {
  async validate(code, orderSubtotal) {
    if (!code) throw new AppError('Coupon code is required', 400);

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new AppError('Invalid coupon code', 404);

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new AppError('Coupon has expired', 400);
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    if (coupon.minimumOrder > 0 && orderSubtotal < coupon.minimumOrder) {
      throw new AppError(`Minimum order of £${coupon.minimumOrder} required`, 400);
    }

    const discount = this.calculateDiscount(coupon, orderSubtotal);

    return { coupon, discount };
  }

  calculateDiscount(coupon, orderSubtotal) {
    let discount = coupon.type === 'percentage'
      ? (orderSubtotal * coupon.value / 100)
      : coupon.value;

    if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }

    return Math.round(discount * 100) / 100;
  }

  async incrementUsage(couponId, session) {
    await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } },
      session ? { session } : {}
    );
  }

  async decrementUsage(couponId) {
    await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: -1 } }
    );
  }
}

module.exports = new CouponService();
