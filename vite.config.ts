import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'exe-download-attachment',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url.endsWith('.exe') || req.url.includes('.exe?'))) {
              const base = path.basename(req.url.split('?')[0]);
              res.setHeader('Content-Disposition', `attachment; filename="${base}"`);
              res.setHeader('Content-Type', 'application/octet-stream');
            }
            if (req.url && (req.url === '/src/style.css' || req.url.startsWith('/src/style.css?')) && !req.url.includes('import')) {
              const accept = req.headers['accept'] || '';
              const secFetchDest = req.headers['sec-fetch-dest'] || '';
              if (secFetchDest === 'style' || accept.includes('text/css') || req.url.includes('direct')) {
                const cssPath = path.resolve(__dirname, 'src/style.css');
                if (fs.existsSync(cssPath)) {
                  res.setHeader('Content-Type', 'text/css; charset=utf-8');
                  res.end(fs.readFileSync(cssPath, 'utf8'));
                  return;
                }
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
