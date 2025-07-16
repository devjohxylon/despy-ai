const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const WaitlistEntry = require('../models/WaitlistEntry');

const router = express.Router();

// Get all waitlist entries with pagination and filtering
router.get('/waitlist', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add email search if provided
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const entries = await WaitlistEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await WaitlistEntry.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalEntries: count
    });
  } catch (error) {
    console.error('Admin waitlist error:', error);
    res.status(500).json({
      message: 'Error fetching waitlist entries'
    });
  }
});

// Update waitlist entry status
router.patch('/waitlist/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    const entry = await WaitlistEntry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        message: 'Waitlist entry not found'
      });
    }

    res.json(entry);
  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({
      message: 'Error updating waitlist entry'
    });
  }
});

// Delete waitlist entry
router.delete('/waitlist/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await WaitlistEntry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        message: 'Waitlist entry not found'
      });
    }

    res.json({
      message: 'Waitlist entry deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({
      message: 'Error deleting waitlist entry'
    });
  }
});

// Get waitlist statistics
router.get('/waitlist/stats', adminAuth, async (req, res) => {
  try {
    const stats = await WaitlistEntry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCount = await WaitlistEntry.countDocuments();
    const lastWeekCount = await WaitlistEntry.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      statusBreakdown: stats,
      total: totalCount,
      lastWeekSignups: lastWeekCount
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      message: 'Error fetching waitlist statistics'
    });
  }
});

module.exports = router; 