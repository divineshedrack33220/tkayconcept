const orderService = require('../services/order.service');
const AppError = require('../errors/AppError');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.sub, {
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes,
      couponCode: req.body.couponCode,
    });

    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user.sub, {
      page: req.query.page,
      limit: req.query.limit,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.user.sub, req.params.orderId);
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      search: req.query.search,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.orderId, {
      orderStatus: req.body.orderStatus,
      trackingNumber: req.body.trackingNumber,
    });

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
