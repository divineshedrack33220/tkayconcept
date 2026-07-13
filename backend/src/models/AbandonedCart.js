const mongoose = require('mongoose');

const abandonedCartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, lowercase: true, trim: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number, default: 1 },
      image: { type: String, default: '' },
    }],
    subtotal: { type: Number, default: 0 },
    recoveryEmailSent: { type: Boolean, default: false },
    recovered: { type: Boolean, default: false },
    recoveredOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

abandonedCartSchema.index({ email: 1, createdAt: -1 });
abandonedCartSchema.index({ recoveryEmailSent: 1, createdAt: 1 });

module.exports = mongoose.model('AbandonedCart', abandonedCartSchema);
