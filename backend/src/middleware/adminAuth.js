/**
 * Admin authentication middleware
 * Uses API key authentication for simplicity
 * In production, consider using a more robust authentication system
 */

const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      message: 'Unauthorized - Invalid API key'
    });
  }

  next();
};

module.exports = adminAuth; 