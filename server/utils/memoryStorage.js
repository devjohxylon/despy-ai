// In-memory storage for development testing
class MemoryStorage {
  constructor() {
    this.waitlist = [];
    this.admins = [];
    this.analytics = [];
    this.nextId = 1;
    
    // Create default admin account
    this.admins.push({
      id: this.nextId++,
      username: 'admin',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'admin123'
      createdAt: new Date()
    });
  }

  // Waitlist operations
  async findWaitlistByEmail(email) {
    return this.waitlist.find(entry => entry.email === email) || null;
  }

  async createWaitlistEntry(data) {
    const entry = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.waitlist.push(entry);
    return entry;
  }

  async updateWaitlistEntry(email, updates) {
    const index = this.waitlist.findIndex(entry => entry.email === email);
    if (index !== -1) {
      this.waitlist[index] = { 
        ...this.waitlist[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      return this.waitlist[index];
    }
    return null;
  }

  async getWaitlistStats() {
    const total = this.waitlist.length;
    const verified = this.waitlist.filter(entry => entry.isVerified).length;
    return { total, verified };
  }

  async getAllWaitlistEntries() {
    return this.waitlist.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Admin operations
  async findAdminByUsername(username) {
    return this.admins.find(admin => admin.username === username) || null;
  }

  async createAdmin(data) {
    const admin = {
      id: this.nextId++,
      ...data,
      createdAt: new Date()
    };
    this.admins.push(admin);
    return admin;
  }

  async deleteAdmin(username) {
    const index = this.admins.findIndex(admin => admin.username === username);
    if (index !== -1) {
      const deleted = this.admins[index];
      this.admins.splice(index, 1);
      return deleted;
    }
    return null;
  }

  async getAllAdmins() {
    return this.admins.map(admin => ({
      id: admin.id,
      username: admin.username,
      createdAt: admin.createdAt
    }));
  }

  // Analytics operations
  async createAnalyticsEvent(data) {
    const event = {
      id: this.nextId++,
      ...data,
      createdAt: new Date()
    };
    this.analytics.push(event);
    return event;
  }

  async getAnalyticsEvents(query = {}) {
    let filtered = this.analytics;
    
    if (query.eventType) {
      filtered = filtered.filter(event => event.eventType === query.eventType);
    }
    
    if (query.since) {
      const since = new Date(query.since);
      filtered = filtered.filter(event => new Date(event.createdAt) >= since);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAnalyticsStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get events from last 30 days
    const recentEvents = this.analytics.filter(event => 
      new Date(event.createdAt) >= thirtyDaysAgo
    );
    
    // Count by event type
    const eventCounts = recentEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});
    
    // Daily signups for last 30 days
    const dailySignups = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailySignups[dateStr] = 0;
    }
    
    recentEvents
      .filter(event => event.eventType === 'waitlist_signup')
      .forEach(event => {
        const dateStr = new Date(event.createdAt).toISOString().split('T')[0];
        if (dailySignups.hasOwnProperty(dateStr)) {
          dailySignups[dateStr]++;
        }
      });
    
    // Traffic sources
    const trafficSources = recentEvents
      .filter(event => event.eventType === 'page_view' && event.metadata?.utm_source)
      .reduce((acc, event) => {
        const source = event.metadata.utm_source;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
    
    return {
      totalEvents: this.analytics.length,
      recentEvents: recentEvents.length,
      eventCounts,
      dailySignups,
      trafficSources,
      waitlistStats: await this.getWaitlistStats()
    };
  }
}

// Create singleton instance
const memoryStorage = new MemoryStorage();

export default memoryStorage; 