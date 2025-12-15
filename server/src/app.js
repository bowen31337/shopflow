// Shared Express app configuration
// Used by both local server (index.js) and Vercel serverless (api/index.js)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';

// Import routes
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import brandsRoutes from './routes/brands.js';
import cartRoutes from './routes/cart.js';
import userRoutes from './routes/user.js';
import wishlistRoutes from './routes/wishlist.js';
import checkoutRoutes from './routes/checkout.js';
import ordersRoutes from './routes/orders.js';
import reviewsRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();

// Determine allowed origins based on environment
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3002'];

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || '*' : allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database debug endpoint
app.get('/api/debug/db', async (req, res) => {
  try {
    const db = (await import('./database.js')).default;
    const result = await db.all('SELECT COUNT(*) as count FROM categories');
    const tursoUrl = process.env.TURSO_DATABASE_URL || 'not set';
    res.json({
      status: 'connected',
      categoryCount: result[0]?.count || 0,
      dbUrl: tursoUrl.substring(0, 20) + '...',
      hasToken: !!process.env.TURSO_AUTH_TOKEN
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ShopFlow E-Commerce API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
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

// Initialize database function (for serverless cold starts)
let dbInitialized = false;

export async function initDB() {
  if (dbInitialized) return true;
  
  try {
    await initializeDatabase();
    dbInitialized = true;
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

export default app;
