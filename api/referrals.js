import client from './db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get referral statistics
      const referralStats = await client.execute(`
        SELECT 
          w.referral_code,
          w.email as referrer_email,
          COUNT(ra.id) as total_referrals,
          SUM(CASE WHEN ra.status = 'converted' THEN 1 ELSE 0 END) as converted_referrals,
          SUM(CASE WHEN ra.reward_status = 'sent' THEN 1 ELSE 0 END) as rewards_sent
        FROM waitlist w
        LEFT JOIN referral_analytics ra ON w.referral_code = ra.referral_code
        WHERE w.referral_code IS NOT NULL
        GROUP BY w.referral_code, w.email
        ORDER BY total_referrals DESC
      `);

      // Get recent referral activity
      const recentActivity = await client.execute(`
        SELECT 
          ra.*,
          w.email as referrer_email
        FROM referral_analytics ra
        JOIN waitlist w ON ra.referral_code = w.referral_code
        ORDER BY ra.created_at DESC
        LIMIT 10
      `);

      return res.status(200).json({
        stats: referralStats.rows,
        recentActivity: recentActivity.rows
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
      return res.status(500).json({ error: 'Failed to fetch referral data' });
    }
  }

  if (req.method === 'POST') {
    const { referral_code, referred_email } = req.body;

    if (!referral_code || !referred_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Check if referral code exists
      const referrer = await client.execute({
        sql: 'SELECT * FROM waitlist WHERE referral_code = ?',
        args: [referral_code]
      });

      if (!referrer.rows.length) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      // Track the referral
      await client.execute({
        sql: `INSERT INTO referral_analytics 
              (referral_code, referred_email) 
              VALUES (?, ?)`,
        args: [referral_code, referred_email]
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking referral:', error);
      return res.status(500).json({ error: 'Failed to track referral' });
    }
  }

  if (req.method === 'PUT') {
    const { referral_id, status, reward_status } = req.body;

    if (!referral_id) {
      return res.status(400).json({ error: 'Missing referral ID' });
    }

    try {
      let updateSql = 'UPDATE referral_analytics SET ';
      const updateArgs = [];

      if (status) {
        updateSql += 'status = ?, conversion_date = CASE WHEN ? = "converted" THEN CURRENT_TIMESTAMP ELSE conversion_date END, ';
        updateArgs.push(status, status);
      }

      if (reward_status) {
        updateSql += 'reward_status = ?, reward_sent_date = CASE WHEN ? = "sent" THEN CURRENT_TIMESTAMP ELSE reward_sent_date END, ';
        updateArgs.push(reward_status, reward_status);
      }

      updateSql = updateSql.slice(0, -2); // Remove trailing comma
      updateSql += ' WHERE id = ?';
      updateArgs.push(referral_id);

      await client.execute({
        sql: updateSql,
        args: updateArgs
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating referral:', error);
      return res.status(500).json({ error: 'Failed to update referral' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 