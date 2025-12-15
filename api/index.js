// Vercel serverless function handler
// This minimal file re-exports the Express app from server/src/app.js
// All business logic is in server/src/ - this is just a Vercel adapter

import app, { initDB } from '../server/src/app.js';

// Initialize database on cold start
await initDB();

// Export the Express app for Vercel
export default app;
