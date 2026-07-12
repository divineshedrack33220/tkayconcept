const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup');

beforeAll(() => connect());
afterEach(() => clearDatabase());
afterAll(() => closeDatabase());

const Category = require('../../src/models/Category');
const Product = require('../../src/models/Product');

describe('Category Model', () => {
  it('should create and save a category', async () => {
    const cat = await Category.create({ name: 'Clothing' });
    expect(cat._id).toBeDefined();
    expect(cat.name).toBe('Clothing');
    expect(cat.slug).toBe('clothing');
    expect(cat.isActive).toBe(true);
  });

  it('should require a name', async () => {
    await expect(Category.create({})).rejects.toThrow();
  });

  it('should enforce unique name', async () => {
    await Category.create({ name: 'Clothing' });
    await expect(Category.create({ name: 'Clothing' })).rejects.toThrow();
  });

  it('should auto-generate slug from name', async () => {
    const cat = await Category.create({ name: 'Custom Printing' });
    expect(cat.slug).toBe('custom-printing');
  });

  it('should support parent categories', async () => {
    const parent = await Category.create({ name: 'Apparel' });
    const child = await Category.create({ name: 'T-Shirts', parent: parent._id });
    expect(child.parent.toString()).toBe(parent._id.toString());
  });
});

describe('Product Model', () => {
  let categoryId;

  beforeEach(async () => {
    const cat = await Category.create({ name: 'Test Category' });
    categoryId = cat._id;
  });

  const validProduct = (overrides = {}) => ({
    name: 'Test Product',
    price: 29.99,
    category: categoryId,
    ...overrides,
  });

  it('should create and save a product', async () => {
    const product = await Product.create(validProduct());
    expect(product._id).toBeDefined();
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe(29.99);
    expect(product.slug).toBe('test-product');
    expect(product.isActive).toBe(true);
  });

  it('should require name, price, and category', async () => {
    await expect(Product.create({})).rejects.toThrow();
    await expect(Product.create({ name: 'X', price: 1 })).rejects.toThrow();
    await expect(Product.create({ name: 'X', category: categoryId })).rejects.toThrow();
  });

  it('should reject negative price', async () => {
    await expect(Product.create(validProduct({ price: -5 }))).rejects.toThrow();
  });

  it('should auto-generate slug from name', async () => {
    const p = await Product.create(validProduct({ name: 'African Print Shirt' }));
    expect(p.slug).toBe('african-print-shirt');
  });

  it('should enforce unique slug', async () => {
    await Product.create(validProduct({ name: 'Same Name' }));
    await expect(Product.create(validProduct({ name: 'Same Name' }))).rejects.toThrow();
  });

  it('should accept brand enum values', async () => {
    const p1 = await Product.create(validProduct({ brand: 'TKAYKONCEPTS' }));
    expect(p1.brand).toBe('TKAYKONCEPTS');
    const p2 = await Product.create(validProduct({ name: 'Rooted', brand: 'Rooted Identity' }));
    expect(p2.brand).toBe('Rooted Identity');
  });

  it('should default brand to TKAYKONCEPTS', async () => {
    const p = await Product.create(validProduct());
    expect(p.brand).toBe('TKAYKONCEPTS');
  });

  it('should store images', async () => {
    const p = await Product.create(validProduct({
      images: [
        { url: 'https://example.com/img1.jpg', alt: 'Image 1', isPrimary: true },
        { url: 'https://example.com/img2.jpg', alt: 'Image 2' },
      ],
    }));
    expect(p.images).toHaveLength(2);
    expect(p.images[0].isPrimary).toBe(true);
  });

  it('should store variants', async () => {
    const p = await Product.create(validProduct({
      variants: [{
        name: 'Size',
        options: [
          { value: 'S', stock: 10 },
          { value: 'M', stock: 15, price: 32.99 },
        ],
      }],
    }));
    expect(p.variants).toHaveLength(1);
    expect(p.variants[0].options).toHaveLength(2);
    expect(p.variants[0].options[1].price).toBe(32.99);
  });

  it('should have virtuals enabled', async () => {
    const p = await Product.create(validProduct());
    const json = p.toJSON();
    expect(json._id).toBeDefined();
  });
});
