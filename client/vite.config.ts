import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';

const apiProxyConfig = {
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  secure: false,
  configure: (proxy: any, _options: any) => {
    proxy.on('error', (_err: any, _req: any, res: any) => {
      if (res && 'writeHead' in res && !res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Backend server tidak aktif di http://127.0.0.1:5000. Pastikan Anda menjalankan "npm run dev" atau "npm run server:dev".'
        }));
      }
    });
  }
};

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': apiProxyConfig
    }
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': apiProxyConfig
    }
  }
});
