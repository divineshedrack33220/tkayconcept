const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalCategories,
      revenueResult,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Category.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email')
        .lean(),
      Product.find({ stock: { $lte: 5 }, isActive: true })
        .select('name stock sku')
        .limit(5)
        .lean(),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const revenue = revenueResult[0] || { total: 0, count: 0 };

    res.json({
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalCategories,
        totalRevenue: revenue.total,
        paidOrders: revenue.count,
        recentOrders,
        lowStockProducts,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      revenueResult,
      topProducts,
      recentOrdersRaw,
      ordersByStatus,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber orderStatus total createdAt')
        .lean(),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const recentOrders = recentOrdersRaw.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      total: o.total,
      status: o.orderStatus,
      createdAt: o.createdAt,
    }));

    const statusBreakdown = ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        topProducts,
        recentOrders,
        ordersByStatus: statusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      data: products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      data: customers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDashboard,
  getAdminProducts,
  getAdminCustomers,
};
