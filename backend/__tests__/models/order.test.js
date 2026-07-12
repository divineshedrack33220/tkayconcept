const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup');

beforeAll(() => connect());
afterEach(() => clearDatabase());
afterAll(() => closeDatabase());

const Order = require('../../src/models/Order');

describe('Order Model', () => {
  const validOrder = {
    orderNumber: 'ORD-000001',
    user: new mongoose.Types.ObjectId(),
    items: [
      { product: new mongoose.Types.ObjectId(), name: 'Test Product', price: 29.99, quantity: 2 },
    ],
    shippingAddress: { street: '123 Main St', city: 'Austin', state: 'TX', zipCode: '78701', country: 'US' },
    subtotal: 59.98,
    total: 59.98,
  };

  it('should create and save an order', async () => {
    const order = await Order.create(validOrder);
    expect(order._id).toBeDefined();
    expect(order.orderNumber).toBe('ORD-000001');
    expect(order.orderStatus).toBe('pending');
    expect(order.paymentStatus).toBe('pending');
  });

  it('should require orderNumber, user, items, address, subtotal, total', async () => {
    await expect(Order.create({})).rejects.toThrow();
  });

  it('should enforce unique orderNumber', async () => {
    await Order.create(validOrder);
    await expect(Order.create({ ...validOrder, user: new mongoose.Types.ObjectId() })).rejects.toThrow();
  });

  it('should accept valid order statuses', async () => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    for (const orderStatus of statuses) {
      const order = await Order.create({
        ...validOrder,
        orderNumber: `ORD-${orderStatus.toUpperCase()}`,
        orderStatus,
      });
      expect(order.orderStatus).toBe(orderStatus);
    }
  });

  it('should accept valid payment statuses', async () => {
    const statuses = ['pending', 'paid', 'failed', 'refunded'];
    for (const paymentStatus of statuses) {
      const order = await Order.create({
        ...validOrder,
        orderNumber: `ORD-PAY-${paymentStatus.toUpperCase()}`,
        paymentStatus,
      });
      expect(order.paymentStatus).toBe(paymentStatus);
    }
  });

  it('should store order items correctly', async () => {
    const order = await Order.create(validOrder);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].price).toBe(29.99);
  });

  it('should have timestamps', async () => {
    const order = await Order.create(validOrder);
    expect(order.createdAt).toBeDefined();
    expect(order.updatedAt).toBeDefined();
  });

  it('should store stripe payment intent id', async () => {
    const order = await Order.create({
      ...validOrder,
      stripePaymentIntentId: 'pi_test_123',
      paymentStatus: 'paid',
    });
    expect(order.stripePaymentIntentId).toBe('pi_test_123');
  });

  it('should default shippingCost, tax, discount to 0', async () => {
    const order = await Order.create(validOrder);
    expect(order.shippingCost).toBe(0);
    expect(order.tax).toBe(0);
    expect(order.discount).toBe(0);
  });
});
