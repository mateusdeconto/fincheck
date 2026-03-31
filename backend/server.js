import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import diagnoseRouter from './routes/diagnose.js';
import chatRouter from './routes/chat.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Em produção o .env não existe (Railway injeta as vars), em dev carrega da raiz
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// CORS só necessário em dev (em prod o backend serve o frontend diretamente)
if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

app.use(express.json());

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY não encontrada.');
  process.exit(1);
}

// Rotas da API
app.use('/api/diagnose', diagnoseRouter);
app.use('/api/chat', chatRouter);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Em produção: serve o frontend buildado
if (isProd) {
  const distPath = join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  // SPA fallback — qualquer rota que não seja /api retorna o index.html
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ FinCheck rodando em http://localhost:${PORT} [${isProd ? 'prod' : 'dev'}]`);
});
