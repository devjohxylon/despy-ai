const WaitlistEntry = require('../models/WaitlistEntry');

class AnalyticsService {
  async getBasicMetrics() {
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCount,
      verifiedCount,
      dailySignups,
      weeklySignups,
      monthlySignups
    ] = await Promise.all([
      WaitlistEntry.countDocuments(),
      WaitlistEntry.countDocuments({ verified: true }),
      WaitlistEntry.countDocuments({ createdAt: { $gte: dayAgo } }),
      WaitlistEntry.countDocuments({ createdAt: { $gte: weekAgo } }),
      WaitlistEntry.countDocuments({ createdAt: { $gte: monthAgo } })
    ]);

    return {
      total: totalCount,
      verified: verifiedCount,
      dailySignups,
      weeklySignups,
      monthlySignups,
      verificationRate: totalCount ? (verifiedCount / totalCount * 100).toFixed(2) : 0
    };
  }

  async getReferrerStats() {
    return WaitlistEntry.aggregate([
      {
        $group: {
          _id: '$analytics.referrer',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  async getPlatformStats() {
    return WaitlistEntry.aggregate([
      {
        $group: {
          _id: '$analytics.platform',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  async getBrowserStats() {
    return WaitlistEntry.aggregate([
      {
        $group: {
          _id: '$analytics.browser',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  async getSignupTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return WaitlistEntry.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);
  }

  async getVerificationStats() {
    const stats = await WaitlistEntry.aggregate([
      {
        $group: {
          _id: '$verified',
          count: { $sum: 1 },
          avgTime: {
            $avg: {
              $cond: [
                { $and: ['$verified', '$verifiedAt'] },
                { $subtract: ['$verifiedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id ? 'verified' : 'unverified'] = {
        count: stat.count,
        avgTimeToVerify: stat.avgTime ? Math.round(stat.avgTime / (1000 * 60)) : null // Convert to minutes
      };
      return acc;
    }, {});
  }

  async exportData(format = 'json') {
    const data = await WaitlistEntry.find()
      .select('-__v')
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const fields = ['email', 'createdAt', 'status', 'verified', 'verifiedAt'];
      const csv = [
        fields.join(','),
        ...data.map(entry => 
          fields.map(field => 
            JSON.stringify(entry[field] || '')
          ).join(',')
        )
      ].join('\n');
      
      return csv;
    }

    return data;
  }
}

module.exports = new AnalyticsService(); 