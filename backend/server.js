import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import diagnoseRouter from './routes/diagnose.js';
import chatRouter from './routes/chat.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Detecta produção:
//  - NODE_ENV === 'production', OU
//  - existe a pasta frontend/dist (built)
const distPath = join(__dirname, '..', 'frontend', 'dist');
const distExists = existsSync(join(distPath, 'index.html'));
const isProd = process.env.NODE_ENV === 'production' || distExists;

console.log(`[boot] NODE_ENV=${process.env.NODE_ENV || '(not set)'}`);
console.log(`[boot] dist/index.html exists: ${distExists} (${distPath})`);
console.log(`[boot] mode: ${isProd ? 'PROD (serving frontend)' : 'DEV (api only)'}`);

if (isProd && !distExists) {
  console.error('❌ NODE_ENV=production mas frontend/dist/index.html não existe.');
  console.error('   Rode "npm run build" na raiz antes de iniciar o servidor.');
  console.error('   No Railway: confirme que railway.json tem buildCommand correto.');
  // Não sai — deixa o backend rodar pra API funcionar mesmo sem frontend
}

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
    cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: false,
}));

app.use(express.json({ limit: '50kb' }));

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY não encontrada. Servidor não vai subir.');
  process.exit(1);
}

// API
app.use('/api/diagnose', diagnoseRouter);
app.use('/api/chat', chatRouter);
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mode: isProd ? 'prod' : 'dev',
    distExists,
  });
});

// Frontend estático em prod
if (distExists) {
  app.use(express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.includes(`${join('assets')}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  // CRÍTICO: assets que não existem devem retornar 404 limpo (nunca o index.html
  // como fallback — isso quebra MIME-type checking no navegador).
  app.get('/assets/*', (_req, res) => {
    res.status(404).type('text/plain').send('Asset not found');
  });

  // SPA fallback — apenas para navegação humana (rotas que não casam nada acima).
  // Qualquer GET não-/api e não-/assets cai aqui e recebe o index.html.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(distPath, 'index.html'), (err) => {
      if (err) {
        console.error('[sendFile error]', err.message);
        res.status(500).type('text/plain').send('Erro ao carregar a aplicação.');
      }
    });
  });
} else {
  // Sem dist em prod → resposta clara em vez de erro confuso
  app.get('/', (_req, res) => {
    res.status(503).type('text/html').send(`
      <h1>FinCheck — frontend não disponível</h1>
      <p>O backend está rodando mas o frontend ainda não foi buildado.</p>
      <p>Confira <a href="/api/health">/api/health</a> pra ver o status.</p>
    `);
  });
}

// Error handler — última linha de defesa
app.use((err, req, res, _next) => {
  console.error('[unhandled]', req.method, req.path, '→', err.message);
  if (res.headersSent) return;
  // Pra requests de assets, retorna texto puro (evita o problema de MIME hoje)
  if (req.path.startsWith('/assets/')) {
    return res.status(500).type('text/plain').send('Asset error');
  }
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`✅ FinCheck rodando em http://localhost:${PORT} [${isProd ? 'prod' : 'dev'}]`);
});
