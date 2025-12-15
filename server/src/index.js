// Local development server
// For production serverless deployment, see api/index.js

import app, { initDB } from './app.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initDB();

    console.log('Seeding database...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log(`✓ ShopFlow API Server is running`);
      console.log(`✓ Port: ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
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
