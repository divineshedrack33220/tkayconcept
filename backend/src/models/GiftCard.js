const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    initialBalance: { type: Number, required: true, min: [1, 'Balance must be at least $1'] },
    balance: { type: Number, required: true, min: 0 },
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientEmail: { type: String, default: '' },
    recipientName: { type: String, default: '' },
    message: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    redeemedAt: { type: Date },
    expiresAt: { type: Date },
    ordersUsed: [{
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      amount: { type: Number },
      usedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

giftCardSchema.index({ purchaser: 1 });

module.exports = mongoose.model('GiftCard', giftCardSchema);
