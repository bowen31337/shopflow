// Vercel serverless function handler
// This minimal file re-exports the Express app from server/src/app.js
// All business logic is in server/src/ - this is just a Vercel adapter

let app;
let initError = null;

try {
  const module = await import('../server/src/app.js');
  app = module.default;
  const { initDB } = module;
  
  // Initialize database on cold start
  await initDB();
} catch (error) {
  console.error('Failed to initialize app:', error);
  initError = error;
}

// Export a handler that can show initialization errors
export default function handler(req, res) {
  if (initError) {
    return res.status(500).json({
      error: 'Server initialization failed',
      message: initError.message,
      hint: 'Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are set in Vercel'
    });
  }
  
  return app(req, res);
}
