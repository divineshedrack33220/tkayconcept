/**
 * Database Migration Script: TKAYKONCEPTS → TK Concepts Rebrand
 * 
 * Run once: node src/migrations/rebrand-to-tk-concepts.js
 * 
 * This script:
 * 1. Removes old categories (apparel, merchandise, accessories, rooted-identity, books)
 * 2. Creates new categories (puzzles, storybooks, ebooks) if they don't exist
 * 3. Updates product brand values from "TKAYKONCEPTS" to "TK Concepts"
 * 4. Deletes products in removed categories (per client request)
 * 5. Updates testimonials and blog posts brand references
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

const OLD_CATEGORIES_TO_REMOVE = ['apparel', 'merchandise', 'accessories', 'rooted-identity', 'books'];
const NEW_CATEGORIES = [
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
    description: 'Inspiring stories and coloring books for readers of all ages.',
    sortOrder: 4,
    seoTitle: 'Faith-Based Storybooks | TK Concepts',
    seoDescription: 'Inspiring stories for children and adults rooted in faith.',
  },
  {
    name: 'Ebooks',
    slug: 'ebooks',
    description: 'Digital reads for faith-driven growth, available instantly.',
    sortOrder: 5,
    seoTitle: 'Faith-Based Ebooks | TK Concepts',
    seoDescription: 'Downloadable ebooks for spiritual growth on the go.',
  },
];

async function migrate() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Starting migration...\n');

    // Step 1: Deactivate old categories
    console.log('--- Step 1: Deactivating old categories ---');
    const deactivateResult = await Category.updateMany(
      { slug: { $in: OLD_CATEGORIES_TO_REMOVE } },
      { $set: { isActive: false } }
    );
    console.log(`Deactivated ${deactivateResult.modifiedCount} categories: ${OLD_CATEGORIES_TO_REMOVE.join(', ')}`);

    // Step 2: Create new categories if they don't exist
    console.log('\n--- Step 2: Creating/updating new categories ---');
    for (const cat of NEW_CATEGORIES) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        // Update if exists but was inactive
        if (!existing.isActive) {
          await Category.updateOne({ slug: cat.slug }, { $set: { isActive: true, ...cat } });
          console.log(`Reactivated category: ${cat.name}`);
        } else {
          console.log(`Category already exists and active: ${cat.name}`);
        }
      } else {
        await Category.create(cat);
        console.log(`Created new category: ${cat.name}`);
      }
    }

    // Step 3: Delete products in removed categories
    console.log('\n--- Step 3: Deleting products in removed categories ---');
    const removedCategoryIds = await Category.find({
      slug: { $in: OLD_CATEGORIES_TO_REMOVE }
    }).select('_id').lean();

    const idsToDelete = removedCategoryIds.map(c => c._id);
    if (idsToDelete.length > 0) {
      const deleteResult = await Product.deleteMany({ category: { $in: idsToDelete } });
      console.log(`Deleted ${deleteResult.deletedCount} products in removed categories`);
    } else {
      console.log('No products found in removed categories');
    }

    // Step 4: Update brand values
    console.log('\n--- Step 4: Updating product brand values ---');
    const brandUpdateResult = await Product.updateMany(
      { brand: 'TKAYKONCEPTS' },
      { $set: { brand: 'TK Concepts' } }
    );
    console.log(`Updated ${brandUpdateResult.modifiedCount} products from "TKAYKONCEPTS" to "TK Concepts"`);

    // Also update any "Rooted Identity" products to "TK Concepts" if desired
    // Uncomment the following if you want to rebrand Rooted Identity products:
    // const riUpdateResult = await Product.updateMany(
    //   { brand: 'Rooted Identity' },
    //   { $set: { brand: 'TK Concepts' } }
    // );
    // console.log(`Updated ${riUpdateResult.modifiedCount} Rooted Identity products to "TK Concepts"`);

    // Step 5: Re-seed with new data
    console.log('\n--- Step 5: Re-seeding products and content ---');
    console.log('Run `node src/seeds/seed.js` after this migration to seed new products.');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node src/seeds/seed.js (to seed new products)');
    console.log('2. Run: node src/seeds/seed-testimonials.js (to update testimonials)');
    console.log('3. Run: node src/seeds/seed-blog.js (to update blog posts)');
    console.log('4. Deploy the updated frontend to Render');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

migrate();
