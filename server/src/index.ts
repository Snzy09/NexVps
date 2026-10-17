import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';

import fs from 'fs';

const rootEnv = path.join(__dirname, '../../.env');
const serverEnv = path.join(__dirname, '../.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}
dotenv.config({ path: serverEnv, override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-BuatQris-Signature', 'X-App-Name', 'x-admin-email', 'X-Admin-Email']
}));

// Capture raw body buffer for BuatQRIS webhook HMAC-SHA256 signature verification
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({
  extended: true,
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// API Routes
app.use('/api', apiRouter);

// Catch-all 404 for unhandled API endpoints returning JSON
app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint API tidak ditemukan'
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'NexVps API',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// Global Express error handler guaranteeing JSON responses for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error:', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Terjadi kesalahan pada server backend'
    });
  }
  next(err);
});

// ==========================================
// FRONTEND STATIC ASSETS SERVING (Production & Standalone)
// ==========================================
const publicDir = path.resolve(__dirname, '../../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// Development helper: redirect root to Vite dev server if running locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.get('/', (_req, res) => {
    res.redirect('http://localhost:5173');
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 NexVps Server running on http://localhost:${PORT}`);
  console.log(`📡 BuatQRIS Webhook: http://localhost:${PORT}/api/webhook/buatqris`);
  console.log(`=========================================`);
});

export default app;
