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
// UNIFIED FRONTEND INTEGRATION (Vite / Static)
// ==========================================
const clientDir = path.resolve(__dirname, '../../client');
const clientDist = path.resolve(clientDir, 'dist');
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

async function bootstrap() {
  if (!isProd) {
    const clientSrc = path.join(clientDir, 'src');
    if (fs.existsSync(clientSrc)) {
      try {
        // Development mode: Mount Vite dev server middleware directly in Express
        // Dynamic require ensures static AST analyzers (@vercel/nft) ignore Vite & client sources
        const dynamicReq = eval('require');
        const vitePath = dynamicReq.resolve('vite', { paths: [clientDir] });
        const { createServer } = dynamicReq(vitePath);
        const vite = await createServer({
          root: clientDir,
          server: { middlewareMode: true },
          appType: 'spa'
        });
        app.use(vite.middlewares);
        console.log('⚡ Vite Dev Middleware mounted into Express (HMR active)');
      } catch (e: any) {
        console.warn('Vite dev middleware fallback to static dist:', e.message);
        if (fs.existsSync(clientDist)) {
          app.use(express.static(clientDist));
          app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
        }
      }
    }
  } else if (!process.env.VERCEL && fs.existsSync(clientDist)) {
    // Production standalone mode: Serve pre-built static client files
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
    console.log('📦 Serving production client build from client/dist');
  }

  // Guard app.listen so Vercel Serverless Functions manage port binding dynamically
  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`🚀 NexVps Unified Server running on http://localhost:${PORT}`);
      console.log(`💻 Frontend & 📡 Backend API berjalan bersamaan di port ${PORT}!`);
      console.log(`📡 BuatQRIS Webhook: http://localhost:${PORT}/api/webhook/buatqris`);
      console.log(`=========================================`);
    });
  }
}

bootstrap();

export default app;
