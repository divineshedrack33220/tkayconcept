const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmail } = require('../utils/email');

const generateOrderNumber = () => {
  const date = new Date();
  const prefix = 'TK';
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${random}`;
};

// POST /api/orders - Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sync your account first.' });
    }

    // Validate products and calculate totals — batch query instead of N+1
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

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

    const shippingCost = subtotal >= 75 ? 0 : 9.99;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod: paymentMethod || 'stripe',
      notes: notes || '',
    });

    // Decrement stock — batch update
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    // Send order confirmation email (non-blocking)
    sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Order Confirmed!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Thank you for your order. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order Number:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.orderNumber}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Items:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${orderItems.length}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subtotal:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${subtotal.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Shipping:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tax:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${tax.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px;"><strong>Total:</strong></td><td style="padding: 8px; font-size: 18px; color: #F59E0B;"><strong>$${total.toFixed(2)}</strong></td></tr>
          </table>
          <p>We'll notify you when your order ships.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">TKAYKONCEPTS INT'L - Faith. Purpose. Identity.</p>
        </div>
      `,
    }).catch(() => {});

    res.status(201).json({ data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// GET /api/orders - Get current user's orders
const getMyOrders = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name slug images'),
      Order.countDocuments({ user: user._id }),
    ]);

    res.json({
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
};

// GET /api/orders/:orderId - Get single order
const getOrder = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      user: user._id,
    }).populate('items.product', 'name slug images').lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to get order' });
  }
};

// GET /api/orders/admin/all - Admin: get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
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

    res.json({
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
};

// PUT /api/orders/admin/:orderId/status - Admin: update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    await order.save();

    // Send shipping notification email if status is 'shipped'
    if (orderStatus === 'shipped' && trackingNumber) {
      const user = await User.findById(order.user);
      if (user) {
        sendEmail({
          to: user.email,
          subject: `Your Order ${order.orderNumber} Has Shipped!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a2e;">Your Order is On Its Way!</h2>
              <p>Hi ${user.firstName},</p>
              <p>Your order <strong>${order.orderNumber}</strong> has been shipped.</p>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p>We'll notify you when it's delivered.</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">TKAYKONCEPTS INT'L - Faith. Purpose. Identity.</p>
            </div>
          `,
        }).catch(() => {});
      }
    }

    res.json({ data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
