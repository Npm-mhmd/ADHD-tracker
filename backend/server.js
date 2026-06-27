const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const config = require('./config/env');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const observationRoutes = require('./routes/observations');

const app = express();

app.set('trust proxy', 1);

connectDB();

// ─── Security middleware ───
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin / non-browser requests (no Origin header) and
    // any explicitly whitelisted origin.
    if (!origin || config.clientOrigins.length === 0 || config.clientOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

// ─── Rate limiting ───
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

app.use('/api', apiLimiter);

// ─── API routes ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/observations', observationRoutes);

// Unknown API endpoints should 404 as JSON, never fall through to the SPA.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// ─── Static frontend (SPA) ───
const clientBuildPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // SPA fallback: serve index.html for any non-API GET route so that
  // client-side deep links (e.g. /teacher/dashboard) work on refresh.
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'API running. Frontend build not found.' });
  });
}

// ─── Error handling ───
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

// ─── Process-level safety nets ───
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully.`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
