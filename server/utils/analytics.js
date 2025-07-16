import Analytics from '../models/analytics.js';
import Waitlist from '../models/waitlist.js';

// Track an analytics event
export const trackEvent = async (eventData) => {
  try {
    const analytics = new Analytics(eventData);
    await analytics.save();
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total waitlist entries
    const totalEntries = await Waitlist.countDocuments();
    const verifiedEntries = await Waitlist.countDocuments({ verified: true });
    const todayEntries = await Waitlist.countDocuments({ 
      createdAt: { $gte: yesterday } 
    });

    // Page views
    const totalPageViews = await Analytics.countDocuments({ event: 'page_view' });
    const todayPageViews = await Analytics.countDocuments({ 
      event: 'page_view', 
      timestamp: { $gte: yesterday } 
    });

    // Conversion rate
    const conversionRate = totalPageViews > 0 ? (totalEntries / totalPageViews * 100).toFixed(2) : 0;

    // Daily signups for the last 30 days
    const dailySignups = await Waitlist.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo }
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
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Traffic sources
    const trafficSources = await Analytics.aggregate([
      {
        $match: { event: 'page_view' }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Geographic distribution (based on common IP patterns - simplified)
    const geoDistribution = await Analytics.aggregate([
      {
        $match: { event: 'page_view', ip: { $exists: true } }
      },
      {
        $group: {
          _id: { $substr: ['$ip', 0, 7] }, // Simple geo approximation
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return {
      totalEntries,
      verifiedEntries,
      todayEntries,
      totalPageViews,
      todayPageViews,
      conversionRate,
      verificationRate: totalEntries > 0 ? (verifiedEntries / totalEntries * 100).toFixed(2) : 0,
      dailySignups: dailySignups.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count
      })),
      trafficSources: trafficSources.map(item => ({
        source: item._id || 'Direct',
        count: item.count
      })),
      geoDistribution
    };
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    throw error;
  }
}; 