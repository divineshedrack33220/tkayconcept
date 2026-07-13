const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['email', 'sms'], default: 'email' },
    subject: { type: String, default: '' },
    content: { type: String, required: true },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'scheduled', 'sent', 'failed'], default: 'draft' },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
