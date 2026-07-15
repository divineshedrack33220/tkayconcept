const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI;
const testimonials = [
  { customerName: 'Sarah Johnson', rating: 5, content: 'These devotionals have completely transformed my morning routine. The depth of insight and practical application is exactly what I needed.', isFeatured: true, isApproved: true },
  { customerName: 'David Williams', rating: 5, content: 'My kids absolutely love the faith-based games! It\'s rare to find entertainment that aligns with our values while being genuinely fun.', isFeatured: true, isApproved: true },
  { customerName: 'Grace Thompson', rating: 5, content: 'The Rooted Identity collection is stunning. I wear my pieces everywhere and always get compliments. Quality is outstanding.', isFeatured: true, isApproved: true },
  { customerName: 'Michael Brown', rating: 4, content: 'Ordered custom t-shirts for our church retreat. The print quality was excellent and delivery was on time. Will order again!', isFeatured: false, isApproved: true },
  { customerName: 'Esther Okafor', rating: 5, content: 'The book collection is phenomenal. Every title speaks to something deep in my spirit. TK Concepts truly creates products with purpose.', isFeatured: true, isApproved: true },
  { customerName: 'James Anderson', rating: 5, content: 'I bought the devotional bundle as a gift and my friend was moved to tears. These products carry genuine anointing.', isFeatured: false, isApproved: true },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const Testimonial = require('../models/Testimonial');
    await Testimonial.deleteMany({});
    const result = await Testimonial.insertMany(testimonials);
    console.log(`Seeded ${result.length} testimonials`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
