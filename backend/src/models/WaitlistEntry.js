const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationToken: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  analytics: {
    browser: String,
    platform: String,
    referrer: String,
    ipAddress: String
  },
  lastEmailSent: {
    type: Date
  },
  emailAttempts: {
    type: Number,
    default: 0
  }
});

// Add index for email field for faster lookups and unique constraint
waitlistSchema.index({ email: 1 }, { unique: true });
waitlistSchema.index({ verificationToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('WaitlistEntry', waitlistSchema); 