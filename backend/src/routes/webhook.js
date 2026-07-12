const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
          await order.save();
          console.log(`Order ${order.orderNumber} paid via webhook`);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        const failedOrder = await Order.findOne({ stripePaymentIntentId: failedIntent.id });
        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          await failedOrder.save();
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const refundedOrder = await Order.findOne({ stripePaymentIntentId: charge.payment_intent });
        if (refundedOrder) {
          refundedOrder.paymentStatus = 'refunded';
          refundedOrder.orderStatus = 'cancelled';
          await refundedOrder.save();
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
