require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const { pool, initDatabase } = require('./src/services/db');
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');

const app = express();
const port = Number(process.env.PORT || 8080);
const uploadsPath = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
const sessionStore = pool
  ? new PgSession({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    })
  : undefined;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({
  limit: '2mb',
  verify: (req, res, buffer) => {
    req.rawBody = buffer;
  },
}));
app.use(cookieParser());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const configuredOrigins = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const defaultOrigins = [
    'https://sansaai.in',
    'https://www.sansaai.in',
    'https://api.sansaai.in',
  ];
  if (process.env.NODE_ENV !== 'production') {
    defaultOrigins.push(
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    );
  }
  const allowedOrigins = new Set(configuredOrigins.length ? configuredOrigins : defaultOrigins);

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
app.use(
  session({
    store: sessionStore,
    name: 'sansa.sid',
    secret: process.env.SESSION_SECRET || 'change-this-session-secret',
    proxy: true,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use('/api', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true, app: 'SANSA AI', time: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'SANSA AI', time: new Date().toISOString() });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    ok: false,
    error: 'Server problem. Please check logs and configuration.',
  });
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`SANSA AI running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database init failed:', error);
    process.exit(1);
  });
