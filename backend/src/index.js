import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import waitlistRoutes from './routes/waitlist.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import { adminAuth } from './middleware/adminAuth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://despy.ai', /\.despy\.ai$/]
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminAuth, adminRoutes);
app.use('/api/analytics', analyticsRoutes); // Public endpoint for tracking
app.use('/api/analytics/data', adminAuth, analyticsRoutes); // Protected endpoint for viewing data

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 