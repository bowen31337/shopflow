// Vercel serverless function handler for Express API
// This file wraps the Express app for Vercel's serverless environment

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from '../server/src/database.js';

// Import routes
import authRoutes from '../server/src/routes/auth.js';
import productsRoutes from '../server/src/routes/products.js';
import categoriesRoutes from '../server/src/routes/categories.js';
import brandsRoutes from '../server/src/routes/brands.js';
import cartRoutes from '../server/src/routes/cart.js';
import userRoutes from '../server/src/routes/user.js';
import wishlistRoutes from '../server/src/routes/wishlist.js';
import checkoutRoutes from '../server/src/routes/checkout.js';
import ordersRoutes from '../server/src/routes/orders.js';
import reviewsRoutes from '../server/src/routes/reviews.js';
import adminRoutes from '../server/src/routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (if available)
// Note: In serverless, uploads should be stored in external storage (S3, etc.)
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize database (only once, cached in serverless)
let dbInitialized = false;
if (!dbInitialized) {
  try {
    initializeDatabase();
    dbInitialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopFlow API is running',
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ShopFlow E-Commerce API',
    version: '1.0.0',
    environment: 'serverless',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      brands: '/api/brands'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', reviewsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export the Express app as a serverless function
export default app;

