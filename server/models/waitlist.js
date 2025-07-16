import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  verificationToken: { type: String },
  tokenExpiry: { type: Date },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date }
});

waitlistSchema.index({ verificationToken: 1 }, { sparse: true });
waitlistSchema.index({ email: 1 });
waitlistSchema.index({ tokenExpiry: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens if needed

export default mongoose.model('Waitlist', waitlistSchema); 