require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  {
    name: 'Books',
    slug: 'books',
    description: 'Inspiring reads that strengthen your faith and purpose.',
    sortOrder: 1,
    seoTitle: 'Faith-Based Books | TKAYKONCEPTS',
    seoDescription: 'Discover books that inspire faith, purpose, and identity.',
  },
  {
    name: 'Games',
    slug: 'games',
    description: 'Fun and educational games for the whole family.',
    sortOrder: 2,
    seoTitle: 'Faith-Based Games | TKAYKONCEPTS',
    seoDescription: 'Games that bring families together through faith and fun.',
  },
  {
    name: 'Apparel',
    slug: 'apparel',
    description: 'Wear your faith boldly with our apparel collection.',
    sortOrder: 3,
    seoTitle: 'Faith Apparel | TKAYKONCEPTS',
    seoDescription: 'Christian apparel that makes a statement.',
  },
  {
    name: 'Merchandise',
    slug: 'merchandise',
    description: 'Accessories and merchandise for everyday inspiration.',
    sortOrder: 4,
    seoTitle: 'Faith Merchandise | TKAYKONCEPTS',
    seoDescription: 'Faith-inspired merchandise for daily living.',
  },
  {
    name: 'Devotionals',
    slug: 'devotionals',
    description: 'Daily devotionals to deepen your spiritual journey.',
    sortOrder: 5,
    seoTitle: 'Christian Devotionals | TKAYKONCEPTS',
    seoDescription: 'Daily devotionals for spiritual growth.',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Faith-inspired accessories for every occasion.',
    sortOrder: 6,
    seoTitle: 'Faith Accessories | TKAYKONCEPTS',
    seoDescription: 'Accessories that reflect your faith.',
  },
  {
    name: 'Rooted Identity',
    slug: 'rooted-identity',
    description: 'Wear your faith boldly with the Rooted Identity collection.',
    sortOrder: 7,
    seoTitle: 'Rooted Identity | TKAYKONCEPTS',
    seoDescription: 'The Rooted Identity sub-brand — faith-driven apparel and merchandise.',
  },
];

const products = [
  {
    name: 'Walking in Purpose',
    description: 'A transformative guide to discovering and walking in your God-given purpose. This book combines biblical wisdom with practical steps to help you align your life with divine intention.',
    shortDescription: 'A transformative guide to discovering your God-given purpose.',
    price: 19.99,
    compareAtPrice: 24.99,
    category: 'books',
    tags: ['purpose', 'faith', 'guidance'],
    images: [{ url: 'https://picsum.photos/seed/book1/600/600', alt: 'Walking in Purpose book', isPrimary: true }],
    sku: 'TK-BOOK-001',
    stock: 150,
    brand: 'TKAYKONCEPTS',
    isFeatured: true,
    isBestSeller: true,
    averageRating: 4.8,
    totalReviews: 124,
  },
  {
    name: 'Rooted Identity T-Shirt',
    description: 'Premium quality cotton t-shirt featuring the Rooted Identity design. Made with 100% organic cotton, this shirt lets you wear your faith boldly.',
    shortDescription: 'Premium cotton t-shirt with Rooted Identity design.',
    price: 29.99,
    category: 'apparel',
    tags: ['apparel', 'identity', 'rooted'],
    images: [{ url: 'https://picsum.photos/seed/apparel1/600/600', alt: 'Rooted Identity T-Shirt', isPrimary: true }],
    variants: [
      {
        name: 'Size',
        options: [
          { value: 'S', stock: 20 },
          { value: 'M', stock: 30 },
          { value: 'L', stock: 25 },
          { value: 'XL', stock: 15 },
          { value: 'XXL', stock: 10 },
        ],
      },
      {
        name: 'Color',
        options: [
          { value: 'Black', stock: 50 },
          { value: 'White', stock: 50 },
        ],
      },
    ],
    sku: 'TK-APP-001',
    stock: 100,
    brand: 'Rooted Identity',
    isFeatured: true,
    isNewArrival: true,
    averageRating: 4.6,
    totalReviews: 87,
  },
  {
    name: 'Faith & Family Board Game',
    description: 'An exciting board game designed to bring families together through faith-based challenges and discussions. Perfect for family game nights.',
    shortDescription: 'Faith-based board game for family game nights.',
    price: 34.99,
    compareAtPrice: 44.99,
    category: 'games',
    tags: ['games', 'family', 'faith'],
    images: [{ url: 'https://picsum.photos/seed/game1/600/600', alt: 'Faith & Family Board Game', isPrimary: true }],
    sku: 'TK-GAME-001',
    stock: 75,
    brand: 'TKAYKONCEPTS',
    isFeatured: true,
    isBestSeller: true,
    averageRating: 4.9,
    totalReviews: 203,
  },
  {
    name: '30-Day Purpose Devotional',
    description: 'A 30-day devotional journey designed to help you discover and walk in your purpose. Each day includes scripture, reflection, and action steps.',
    shortDescription: '30-day devotional for discovering your purpose.',
    price: 12.99,
    category: 'devotionals',
    tags: ['devotional', 'purpose', 'daily'],
    images: [{ url: 'https://picsum.photos/seed/devotional1/600/600', alt: '30-Day Purpose Devotional', isPrimary: true }],
    sku: 'TK-DEV-001',
    stock: 200,
    brand: 'TKAYKONCEPTS',
    isNewArrival: true,
    averageRating: 4.7,
    totalReviews: 156,
  },
  {
    name: 'Identity in Christ Journal',
    description: 'A beautifully designed journal with prompts and scriptures to help you reflect on your identity in Christ. Features premium paper and a lay-flat binding.',
    shortDescription: 'Guided journal for exploring your identity in Christ.',
    price: 16.99,
    category: 'accessories',
    tags: ['journal', 'identity', 'faith'],
    images: [{ url: 'https://picsum.photos/seed/journal1/600/600', alt: 'Identity in Christ Journal', isPrimary: true }],
    sku: 'TK-ACC-001',
    stock: 120,
    brand: 'TKAYKONCEPTS',
    isFeatured: true,
    averageRating: 4.5,
    totalReviews: 98,
  },
  {
    name: 'Faith Over Fear Mug',
    description: 'Start your morning with inspiration. This ceramic mug features the powerful message "Faith Over Fear" and is perfect for your daily coffee or tea.',
    shortDescription: 'Ceramic mug with Faith Over Fear message.',
    price: 14.99,
    category: 'merchandise',
    tags: ['mug', 'faith', 'merchandise'],
    images: [{ url: 'https://picsum.photos/seed/mug1/600/600', alt: 'Faith Over Fear Mug', isPrimary: true }],
    sku: 'TK-MERCH-001',
    stock: 80,
    brand: 'TKAYKONCEPTS',
    averageRating: 4.4,
    totalReviews: 67,
  },
  {
    name: 'Scripture Memory Card Game',
    description: 'A fun and educational card game that helps children and adults memorize scripture. Features 100 cards with verses from across the Bible.',
    shortDescription: 'Card game for memorizing scripture.',
    price: 19.99,
    category: 'games',
    tags: ['games', 'scripture', 'education'],
    images: [{ url: 'https://picsum.photos/seed/game2/600/600', alt: 'Scripture Memory Card Game', isPrimary: true }],
    sku: 'TK-GAME-002',
    stock: 90,
    brand: 'TKAYKONCEPTS',
    isNewArrival: true,
    averageRating: 4.8,
    totalReviews: 145,
  },
  {
    name: 'Rooted Identity Hoodie',
    description: 'Stay warm and stylish with this premium hoodie from the Rooted Identity collection. Features a comfortable fit and meaningful design.',
    shortDescription: 'Premium hoodie from the Rooted Identity collection.',
    price: 49.99,
    category: 'apparel',
    tags: ['apparel', 'hoodie', 'rooted'],
    images: [{ url: 'https://picsum.photos/seed/hoodie1/600/600', alt: 'Rooted Identity Hoodie', isPrimary: true }],
    variants: [
      {
        name: 'Size',
        options: [
          { value: 'S', stock: 10 },
          { value: 'M', stock: 15 },
          { value: 'L', stock: 20 },
          { value: 'XL', stock: 15 },
        ],
      },
    ],
    sku: 'TK-APP-002',
    stock: 60,
    brand: 'Rooted Identity',
    isBestSeller: true,
    averageRating: 4.7,
    totalReviews: 92,
  },
];

const seed = async () => {
  try {
    await connectDB();

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const categoriesWithSlugs = categories.map((c) => ({
      ...c,
      slug: c.slug || c.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim(),
    }));

    const categoryDocs = await Category.insertMany(categoriesWithSlugs);
    console.log(`Seeded ${categoryDocs.length} categories`);

    const categoryMap = {};
    categoryDocs.forEach((cat) => {
      categoryMap[cat.slug || cat.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')] = cat._id;
    });

    const productsWithIds = products.map((p) => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim(),
      category: categoryMap[p.category],
    }));

    const productDocs = await Product.insertMany(productsWithIds);
    console.log(`Seeded ${productDocs.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
