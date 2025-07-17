import crypto from 'crypto';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export const adminAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  try {
    // Hash the provided API key
    const keyHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // Check if the key exists and update last_used
    const result = await db.execute(
      `SELECT id FROM admin_keys 
       WHERE key_hash = ?`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Update last used timestamp
    await db.execute(
      `UPDATE admin_keys 
       SET last_used = CURRENT_TIMESTAMP 
       WHERE key_hash = ?`,
      [keyHash]
    );

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}; 