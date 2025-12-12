import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';
import { seedDatabase } from './seed.js';

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
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3002'],
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
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ShopFlow E-Commerce API',
    version: '1.0.0',
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

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    initializeDatabase();

    console.log('Seeding database...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log(`✓ ShopFlow API Server is running`);
      console.log(`✓ Port: ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ URL: http://localhost:${PORT}`);
      console.log('================================================');
      console.log('');
      console.log('Test credentials:');
      console.log('  Admin: admin@shopflow.com / admin123');
      console.log('  Customer: customer@example.com / customer123');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
