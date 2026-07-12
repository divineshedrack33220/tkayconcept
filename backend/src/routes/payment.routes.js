const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// POST /api/payments/create-intent - Create Stripe payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount < 0.5) {
      return res.status(400).json({ message: 'Invalid amount. Minimum is $0.50 (50 cents)' });
    }

    // Check if Stripe is configured with real keys
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_xxx') {
      // Demo mode - return a mock payment intent
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
      amount: Math.round(amount * 100), // Convert to cents
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
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
};

// POST /api/payments/confirm - Confirm payment and update order
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ message: 'paymentIntentId and orderId are required' });
    }

    // In demo mode, just mark as paid
    if (paymentIntentId.startsWith('pi_demo_')) {
      const Order = require('../models/Order');
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.paymentStatus = 'paid';
      order.stripePaymentIntentId = paymentIntentId;
      order.orderStatus = 'confirmed';
      await order.save();

      return res.json({ data: order });
    }

    // Live mode - verify with Stripe
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_xxx') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = paymentIntentId;
        order.orderStatus = 'confirmed';
        await order.save();

        return res.json({ data: order });
      }
    }

    res.status(400).json({ message: 'Payment not completed' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

router.post('/create-intent', requireAuth, createPaymentIntent);
router.post('/confirm', requireAuth, confirmPayment);

module.exports = router;
