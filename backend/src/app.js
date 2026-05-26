const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/tickets');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── CORS ──────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ────────────────────────────────────
app.use('/tickets', ticketRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.method} ${req.path}' not found` });
});

// ── Error handler (must be last) ──────────────
app.use(errorHandler);

module.exports = app;
