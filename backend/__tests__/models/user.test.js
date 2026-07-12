const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup');

beforeAll(() => connect());
afterEach(() => clearDatabase());
afterAll(() => closeDatabase());

const User = require('../../src/models/User');

describe('User Model', () => {
  const validUser = {
    clerkId: 'clerk_test123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  it('should create and save a user with valid data', async () => {
    const user = await User.create(validUser);
    expect(user._id).toBeDefined();
    expect(user.clerkId).toBe('clerk_test123');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('customer');
  });

  it('should require clerkId and email', async () => {
    await expect(User.create({})).rejects.toThrow();
    await expect(User.create({ clerkId: 'x' })).rejects.toThrow();
    await expect(User.create({ email: 'x@x.com' })).rejects.toThrow();
  });

  it('should enforce unique clerkId', async () => {
    await User.create(validUser);
    await expect(User.create({ ...validUser, email: 'other@example.com' })).rejects.toThrow();
  });

  it('should enforce unique email', async () => {
    await User.create(validUser);
    await expect(User.create({ ...validUser, clerkId: 'clerk_other' })).rejects.toThrow();
  });

  it('should default role to customer', async () => {
    const user = await User.create(validUser);
    expect(user.role).toBe('customer');
  });

  it('should accept valid role values', async () => {
    const roles = ['customer', 'admin', 'super_admin', 'content_manager', 'inventory_manager', 'support'];
    for (const role of roles) {
      const user = await User.create({ ...validUser, clerkId: `clerk_${role}`, email: `${role}@example.com`, role });
      expect(user.role).toBe(role);
    }
  });

  it('should reject invalid role values', async () => {
    await expect(
      User.create({ ...validUser, role: 'invalid_role' })
    ).rejects.toThrow();
  });

  it('should have virtual fullName', async () => {
    const user = await User.create(validUser);
    const json = user.toJSON();
    expect(json.fullName).toBe('Test User');
  });

  it('should store addresses', async () => {
    const user = await User.create({
      ...validUser,
      addresses: [
        { street: '123 Main St', city: 'Austin', state: 'TX', zipCode: '78701', country: 'US', isDefault: true },
      ],
    });
    expect(user.addresses).toHaveLength(1);
    expect(user.addresses[0].street).toBe('123 Main St');
    expect(user.addresses[0].isDefault).toBe(true);
  });

  it('should have timestamps', async () => {
    const user = await User.create(validUser);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});
