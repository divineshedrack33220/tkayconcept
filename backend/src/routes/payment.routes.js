const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const orderService = require('../services/order.service');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'gbp', metadata = {} } = req.body;

    if (!amount || amount < 0.5) {
      return res.status(400).json({ message: 'Invalid amount. Minimum is £0.50 (50 pence)' });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_xxx') {
      return res.json({
        data: {
          clientSecret: 'demo_secret_' + Date.now(),
          paymentIntentId: 'pi_demo_' + Date.now(),
          amount,
          currency,
          status: 'requires_payment_method',
          mode: 'demo',
        },
      });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        userId: req.user.sub,
        ...metadata,
      },
    });

    res.json({
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        mode: 'live',
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ message: 'paymentIntentId and orderId are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (paymentIntentId.startsWith('pi_demo_')) {
      order.paymentStatus = 'paid';
      order.stripePaymentIntentId = paymentIntentId;
      order.orderStatus = 'confirmed';
      await order.save();
      return res.json({ data: order });
    }

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_xxx') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = paymentIntentId;
        order.orderStatus = 'confirmed';
        await order.save();
        return res.json({ data: order });
      }
    }

    res.status(400).json({ message: 'Payment not completed' });
  } catch (error) {
    next(error);
  }
};

router.post('/create-intent', requireAuth, createPaymentIntent);
router.post('/confirm', requireAuth, confirmPayment);

module.exports = router;
