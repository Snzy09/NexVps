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

// Global Express error handler guaranteeing JSON responses
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server backend'
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 NexVps Server running on http://127.0.0.1:${PORT}`);
  console.log(`📡 BuatQRIS Webhook: http://127.0.0.1:${PORT}/api/webhook/buatqris`);
  console.log(`=========================================`);
});
