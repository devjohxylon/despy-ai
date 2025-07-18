// Admin API endpoints for waitlist management
// Add these to your server.js file

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_SECRET_KEY;
  
  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Clear all waitlist entries
app.delete('/api/admin/waitlist/clear', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const result = await db.execute('DELETE FROM waitlist');
    
    res.json({
      success: true,
      message: `Cleared ${result.rowsAffected} waitlist entries`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear waitlist' });
  }
});

// Get all waitlist entries
app.get('/api/admin/waitlist', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const result = await db.execute('SELECT * FROM waitlist ORDER BY created_at DESC');
    
    res.json({
      success: true,
      count: result.rows.length,
      entries: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

// Delete specific email
app.delete('/api/admin/waitlist/:email', adminAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const db = createDbClient();
    
    const result = await db.execute({
      sql: 'DELETE FROM waitlist WHERE email = ?',
      args: [email]
    });
    
    if (result.rowsAffected > 0) {
      res.json({ success: true, message: `Deleted ${email}` });
    } else {
      res.status(404).json({ error: 'Email not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
}); 