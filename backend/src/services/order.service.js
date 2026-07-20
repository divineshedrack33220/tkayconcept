const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const AppError = require('../errors/AppError');
const productService = require('./product.service');
const couponService = require('./coupon.service');
const { sendOrderConfirmation, sendShippingNotification } = require('./email.service');

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;
const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const generateOrderNumber = () => {
  const date = new Date();
  const prefix = 'TK';
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${random}`;
};

class OrderService {
  async createOrder(userId, { items, shippingAddress, paymentMethod, notes, couponCode }) {
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) throw new AppError('User not found. Please sync your account first.', 404);

    if (!items || items.length === 0) {
      throw new AppError('No items in order', 400);
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      throw new AppError('Shipping address is required', 400);
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    await productService.validateStockForOrder(items, productMap);

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
        image: primaryImage,
      });

      subtotal += product.price * item.quantity;
    }

    let discount = 0;
    let couponDoc = null;

    if (couponCode) {
      const { coupon, discount: calculatedDiscount } = await couponService.validate(couponCode, subtotal);
      discount = calculatedDiscount;
      couponDoc = coupon;
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const taxableAmount = subtotal - discount;
    const tax = parseFloat((taxableAmount * TAX_RATE).toFixed(2));
    const total = parseFloat((taxableAmount + shippingCost + tax).toFixed(2));

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.create([{
        orderNumber: generateOrderNumber(),
        user: user._id,
        items: orderItems,
        shippingAddress,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        paymentMethod: paymentMethod || 'stripe',
        coupon: couponDoc ? couponDoc._id : undefined,
        notes: notes || '',
      }], { session });

      const createdOrder = order[0];

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (item.variant && Object.keys(item.variant).length > 0) {
          const variantName = Object.keys(item.variant)[0];
          const variantValue = item.variant[variantName];
          await productService.decrementVariantStock(
            item.productId, variantName, variantValue, item.quantity, session
          );
        } else {
          await productService.decrementStockAtomic(item.productId, item.quantity, session);
        }
      }

      if (couponDoc) {
        await couponService.incrementUsage(couponDoc._id, session);
      }

      await session.commitTransaction();

      sendOrderConfirmation(user, createdOrder, orderItems).catch(() => {});

      return createdOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getMyOrders(userId, { page = 1, limit = 10 }) {
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) throw new AppError('User not found', 404);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name slug images'),
      Order.countDocuments({ user: user._id }),
    ]);

    return {
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  }

  async getOrder(userId, orderId) {
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) throw new AppError('User not found', 404);

    const order = await Order.findOne({
      _id: orderId,
      user: user._id,
    }).populate('items.product', 'name slug images').lean();

    if (!order) throw new AppError('Order not found', 404);

    return order;
  }

  async getAllOrders({ page = 1, limit = 20, status, search }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.orderStatus = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'name slug images')
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  }

  async updateOrderStatus(orderId, { orderStatus, trackingNumber }) {
    if (orderStatus && !VALID_STATUSES.includes(orderStatus)) {
      throw new AppError('Invalid order status', 400);
    }

    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const previousStatus = order.orderStatus;

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    await order.save();

    if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
      await this.restoreStockForOrder(order);
    }

    if (orderStatus === 'shipped' && trackingNumber) {
      const user = await User.findById(order.user);
      if (user) {
        sendShippingNotification(user, order, trackingNumber).catch(() => {});
      }
    }

    return order;
  }

  async restoreStockForOrder(order) {
    for (const item of order.items) {
      if (item.variant && Object.keys(item.variant).length > 0) {
        const variantName = Object.keys(item.variant)[0];
        const variantValue = item.variant[variantName];
        await productService.incrementVariantStock(
          item.product, variantName, variantValue, item.quantity
        );
      } else {
        await productService.incrementStock(item.product, item.quantity);
      }
    }

    if (order.discount > 0) {
      const orderDoc = await Order.findById(order._id);
      if (orderDoc && orderDoc.coupon) {
        await couponService.decrementUsage(orderDoc.coupon);
      }
    }
  }

  async handlePaymentFailure(orderId) {
    const order = await Order.findById(orderId);
    if (!order) return;

    if (order.paymentStatus !== 'failed') {
      order.paymentStatus = 'failed';
      await order.save();
    }
  }

  async handleRefund(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const previousStatus = order.orderStatus;

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    await order.save();

    if (previousStatus !== 'cancelled') {
      await this.restoreStockForOrder(order);
    }

    return order;
  }
}

module.exports = new OrderService();
