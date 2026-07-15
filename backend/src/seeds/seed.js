require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  {
    name: 'Games',
    slug: 'games',
    description: 'Fun and educational games for the whole family.',
    sortOrder: 1,
    seoTitle: 'Faith-Based Games | TK Concepts',
    seoDescription: 'Games that bring families together through faith and fun.',
  },
  {
    name: 'Puzzles',
    slug: 'puzzles',
    description: 'Faith-inspired puzzles for all ages.',
    sortOrder: 2,
    seoTitle: 'Faith-Based Puzzles | TK Concepts',
    seoDescription: 'Puzzles that inspire faith and bring families together.',
  },
  {
    name: 'Devotionals',
    slug: 'devotionals',
    description: 'Daily devotionals to deepen your spiritual journey.',
    sortOrder: 3,
    seoTitle: 'Christian Devotionals | TK Concepts',
    seoDescription: 'Daily devotionals for spiritual growth.',
  },
  {
    name: 'Storybooks',
    slug: 'storybooks',
    description: 'Faith-based storybooks that inspire young hearts and minds.',
    sortOrder: 4,
    seoTitle: 'Faith-Based Storybooks | TK Concepts',
    seoDescription: 'Storybooks that teach faith, values, and purpose.',
  },
  {
    name: 'Ebooks',
    slug: 'ebooks',
    description: 'Digital books for faith, purpose, and identity.',
    sortOrder: 5,
    seoTitle: 'Faith-Based Ebooks | TK Concepts',
    seoDescription: 'Ebooks that inspire faith and spiritual growth.',
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Inspiring reads that strengthen your faith and purpose.',
    sortOrder: 6,
    isActive: false,
    seoTitle: 'Faith-Based Books | TK Concepts',
    seoDescription: 'Discover books that inspire faith, purpose, and identity.',
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
    brand: 'TK Concepts',
    isFeatured: true,
    isBestSeller: true,
    averageRating: 4.8,
    totalReviews: 124,
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
    brand: 'TK Concepts',
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
    brand: 'TK Concepts',
    isNewArrival: true,
    averageRating: 4.7,
    totalReviews: 156,
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
    brand: 'TK Concepts',
    isNewArrival: true,
    averageRating: 4.8,
    totalReviews: 145,
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
