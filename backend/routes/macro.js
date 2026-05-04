import { Router } from 'express';
import { getMacroData } from '../lib/macroData.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await getMacroData();
    res.json(data);
  } catch (e) {
    console.error('[macro]', e.message);
    res.status(500).json({ error: 'Erro ao buscar dados macro' });
  }
});

export default router;
