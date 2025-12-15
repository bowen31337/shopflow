// Vercel serverless function handler
// This minimal file re-exports the Express app from server/src/app.js
// All business logic is in server/src/ - this is just a Vercel adapter

let app = null;
let initDB = null;
let initError = null;
let initialized = false;

async function initialize() {
  if (initialized) return;
  
  try {
    const module = await import('../server/src/app.js');
    app = module.default;
    initDB = module.initDB;
    
    // Initialize database on cold start
    await initDB();
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    initError = error;
    initialized = true; // Mark as attempted
  }
}

// Export a handler that can show initialization errors
export default async function handler(req, res) {
  await initialize();
  
  if (initError) {
    return res.status(500).json({
      error: 'Server initialization failed',
      message: initError.message,
      stack: initError.stack,
      hint: 'Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are set in Vercel',
      env: {
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
  
  if (!app) {
    return res.status(500).json({
      error: 'App not initialized',
      message: 'Express app failed to load'
    });
  }
  
  return app(req, res);
}
