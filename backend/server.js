import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import diagnoseRouter from './routes/diagnose.js';
import chatRouter from './routes/chat.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1); // Railway/Render fica atrás de proxy → necessário p/ rate-limit

app.use(helmet({
  contentSecurityPolicy: false, // SPA + Vite assets, evita falso-positivos
  crossOriginEmbedderPolicy: false,
}));

// CORS configurável via env. Em prod (single-service) o frontend é servido junto, então só dev precisa.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // requests same-origin (prod single service)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
    cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: false,
}));

app.use(express.json({ limit: '50kb' })); // payloads pequenos, evita abuso

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY não encontrada.');
  process.exit(1);
}

app.use('/api/diagnose', diagnoseRouter);
app.use('/api/chat', chatRouter);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

if (isProd) {
  const distPath = join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, path) => {
      if (path.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }));
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err.message);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`✅ FinCheck rodando em http://localhost:${PORT} [${isProd ? 'prod' : 'dev'}]`);
});
