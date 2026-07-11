const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhoto: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

testimonialSchema.index({ isApproved: 1, isFeatured: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
