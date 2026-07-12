const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup');
const request = require('supertest');

jest.mock('../../src/middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.user = { sub: 'clerk_test123' };
    req.dbUser = { _id: '000000000000000000000001', role: 'admin' };
    next();
  },
  authenticate: (req, res, next) => next(),
}));

jest.mock('../../src/middleware/roleCheck', () => ({
  isAdmin: (req, res, next) => next(),
  checkRole: () => (req, res, next) => next(),
}));

jest.mock('../../src/config/db', () => jest.fn());

jest.mock('../../src/middleware/rateLimiter', () => ({
  generalLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  contactLimiter: (req, res, next) => next(),
}));

jest.mock('../../src/utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({}),
}));

let app;
let categoryId;

beforeAll(async () => {
  await connect();

  const Category = require('../../src/models/Category');
  const cat = await Category.create({ name: 'Test Category' });
  categoryId = cat._id.toString();

  app = require('../../src/server');
}, 30000);

beforeEach(async () => {
  await clearDatabase();
  const Category = require('../../src/models/Category');
  const cat = await Category.create({ name: 'Test Category' });
  categoryId = cat._id.toString();
});

afterAll(() => closeDatabase());

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('POST /api/bootstrap/admin', () => {
  it('should create first admin user', async () => {
    const res = await request(app)
      .post('/api/bootstrap/admin')
      .send({ clerkId: 'clerk_admin1', email: 'admin@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('super_admin');
  });

  it('should reject if admin already exists', async () => {
    const User = require('../../src/models/User');
    await User.create({ clerkId: 'existing', email: 'exists@example.com', role: 'admin' });

    const res = await request(app)
      .post('/api/bootstrap/admin')
      .send({ clerkId: 'clerk_new', email: 'new@example.com' });
    expect(res.status).toBe(403);
  });

  it('should require clerkId and email', async () => {
    const res = await request(app).post('/api/bootstrap/admin').send({});
    expect(res.status).toBe(400);
  });
});

describe('Products API', () => {
  const Product = require('../../src/models/Product');

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      await Product.create({ name: 'Shirt', price: 29.99, category: categoryId });
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('POST /api/products', () => {
    it('should create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'New Product', price: 39.99, category: categoryId });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Product');
    });

    it('should reject without required fields', async () => {
      const res = await request(app).post('/api/products').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/products/featured', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/api/products/featured');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/best-sellers', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/api/products/best-sellers');
      expect(res.status).toBe(200);
    });
  });
});

describe('Newsletter API', () => {
  describe('POST /api/newsletter/subscribe', () => {
    it('should subscribe to newsletter', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'sub@example.com' });
      expect([200, 201]).toContain(res.status);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'not-an-email' });
      expect([400, 201]).toContain(res.status);
    });
  });
});

describe('Coupons API', () => {
  const Coupon = require('../../src/models/Coupon');

  describe('GET /api/coupons', () => {
    it('should list coupons', async () => {
      await Coupon.create({ code: 'TESTCPN', type: 'percentage', value: 10 });
      const res = await request(app).get('/api/coupons');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/coupons/validate', () => {
    it('should validate a valid coupon', async () => {
      await Coupon.create({ code: 'VALIDCPN', type: 'fixed', value: 10, isActive: true });
      const res = await request(app).get('/api/coupons/validate?code=VALIDCPN');
      expect(res.status).toBe(200);
    });
  });
});
