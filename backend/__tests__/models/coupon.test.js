const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup');

beforeAll(() => connect());
afterEach(() => clearDatabase());
afterAll(() => closeDatabase());

const Coupon = require('../../src/models/Coupon');

describe('Coupon Model', () => {
  it('should create and save a coupon', async () => {
    const coupon = await Coupon.create({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
    });
    expect(coupon._id).toBeDefined();
    expect(coupon.code).toBe('SAVE10');
    expect(coupon.type).toBe('percentage');
    expect(coupon.value).toBe(10);
    expect(coupon.isActive).toBe(true);
  });

  it('should require code, type, and value', async () => {
    await expect(Coupon.create({})).rejects.toThrow();
    await expect(Coupon.create({ code: 'X' })).rejects.toThrow();
  });

  it('should enforce unique code', async () => {
    await Coupon.create({ code: 'SAVE10', type: 'percentage', value: 10 });
    await expect(Coupon.create({ code: 'SAVE10', type: 'fixed', value: 5 })).rejects.toThrow();
  });

  it('should uppercase code automatically', async () => {
    const coupon = await Coupon.create({ code: 'lower', type: 'fixed', value: 5 });
    expect(coupon.code).toBe('LOWER');
  });

  it('should accept percentage and fixed types', async () => {
    const pct = await Coupon.create({ code: 'PCT', type: 'percentage', value: 15 });
    expect(pct.type).toBe('percentage');
    const fix = await Coupon.create({ code: 'FIX', type: 'fixed', value: 20 });
    expect(fix.type).toBe('fixed');
  });

  it('should reject invalid types', async () => {
    await expect(Coupon.create({ code: 'BAD', type: 'bogus', value: 5 })).rejects.toThrow();
  });

  it('should default usedCount to 0', async () => {
    const coupon = await Coupon.create({ code: 'NEW', type: 'percentage', value: 5 });
    expect(coupon.usedCount).toBe(0);
  });

  it('should store expiry date', async () => {
    const expires = new Date('2026-12-31');
    const coupon = await Coupon.create({ code: 'EXP', type: 'percentage', value: 10, expiresAt: expires });
    expect(coupon.expiresAt.toISOString()).toBe(expires.toISOString());
  });

  it('should store minimumOrder and maximumDiscount', async () => {
    const coupon = await Coupon.create({
      code: 'MINMAX',
      type: 'percentage',
      value: 20,
      minimumOrder: 50,
      maximumDiscount: 25,
    });
    expect(coupon.minimumOrder).toBe(50);
    expect(coupon.maximumDiscount).toBe(25);
  });

  it('should store usageLimit', async () => {
    const coupon = await Coupon.create({ code: 'LIMITED', type: 'fixed', value: 10, usageLimit: 100 });
    expect(coupon.usageLimit).toBe(100);
  });
});
