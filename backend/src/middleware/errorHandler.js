/**
 * Central error-handling middleware.
 * Must be registered AFTER all routes.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid value for field '${err.path}'` });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Duplicate value for field '${field}'` });
  }

  // Custom app errors (thrown with { status, message })
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Generic fallback
  res.status(500).json({ error: 'An unexpected server error occurred' });
}

module.exports = errorHandler;
