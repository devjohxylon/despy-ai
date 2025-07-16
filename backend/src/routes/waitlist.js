const express = require('express');
const { body, validationResult } = require('express-validator');
const WaitlistEntry = require('../models/WaitlistEntry');
const emailService = require('../services/emailService');
const webhookService = require('../services/webhookService');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
];

// Add email to waitlist
router.post('/', validateEmail, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if email already exists
    const existingEntry = await WaitlistEntry.findOne({ email });
    if (existingEntry) {
      return res.status(409).json({
        message: 'This email is already on the waitlist'
      });
    }

    // Generate verification token
    const verificationToken = emailService.generateVerificationToken(email);

    // Collect analytics data
    const analytics = {
      browser: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform'],
      referrer: req.headers['referer'],
      ipAddress: req.ip
    };

    // Create new waitlist entry
    const waitlistEntry = new WaitlistEntry({
      email,
      verificationToken,
      analytics
    });
    await waitlistEntry.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    // Send webhook notification
    await webhookService.notify('waitlist.signup', {
      email,
      timestamp: new Date(),
      analytics
    });

    // Send admin notification
    await emailService.sendAdminNotification(waitlistEntry);

    res.status(201).json({
      message: 'Successfully added to waitlist. Please check your email to verify your address.',
      data: { email }
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({
      message: 'An error occurred while adding to waitlist'
    });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const entry = await WaitlistEntry.findOne({ verificationToken: token });
    
    if (!entry) {
      return res.status(404).json({
        message: 'Invalid or expired verification token'
      });
    }

    if (entry.verified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    // Update entry
    entry.verified = true;
    entry.verifiedAt = new Date();
    await entry.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(entry.email);

    // Send webhook notification
    await webhookService.notify('waitlist.verified', {
      email: entry.email,
      timestamp: new Date()
    });

    res.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      message: 'An error occurred during verification'
    });
  }
});

// Resend verification email
router.post('/resend-verification', validateEmail, async (req, res) => {
  try {
    const { email } = req.body;
    
    const entry = await WaitlistEntry.findOne({ email });
    
    if (!entry) {
      return res.status(404).json({
        message: 'Email not found in waitlist'
      });
    }

    if (entry.verified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    // Check if we've tried too many times
    if (entry.emailAttempts >= 3) {
      return res.status(429).json({
        message: 'Maximum verification attempts reached. Please contact support.'
      });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken(email);
    entry.verificationToken = verificationToken;
    entry.emailAttempts += 1;
    entry.lastEmailSent = new Date();
    await entry.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    res.json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      message: 'An error occurred while resending verification email'
    });
  }
});

module.exports = router; 