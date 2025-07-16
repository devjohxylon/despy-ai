import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: ['page_view', 'waitlist_signup', 'email_verified', 'form_submit', 'button_click']
  },
  email: { type: String }, // For user-specific events
  userAgent: { type: String },
  ip: { type: String },
  referrer: { type: String },
  page: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional event data
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String },
  source: { type: String }, // utm_source, direct, organic, etc.
  medium: { type: String }, // utm_medium
  campaign: { type: String } // utm_campaign
});

// Indexes for fast querying
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ email: 1 });
analyticsSchema.index({ source: 1 });

export default mongoose.model('Analytics', analyticsSchema); 