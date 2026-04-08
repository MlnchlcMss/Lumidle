const app = require('../lumidle_backend/server');

// Vercel serverless catch-all handler
// Handles all /api/* routes
module.exports = (req, res) => {
  // Prepend /api to the URL since Vercel strips it for catch-all routes
  // The [...path] catch-all receives the path after /api/
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  app(req, res);
};
