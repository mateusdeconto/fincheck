/**
 * Busca dados macroeconômicos ao vivo do Banco Central do Brasil (BCB).
 * Cache em memória de 30 minutos. Nunca lança exceção — usa fallbacks se a API falhar.
 */

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

const FALLBACKS = {
  selic:  { value: '14.75', date: null, isFallback: true },
  ipca:   { value: '5.53',  date: null, isFallback: true },
  usdBrl: { value: '5.80',  date: null, isFallback: true },
};

let cache = null;
let cacheTimestamp = 0;

async function fetchWithTimeout(url, ms = 5000) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSelic() {
  try {
    const data = await fetchWithTimeout(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
    );
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) throw new Error('Resposta vazia');
    return { value: item.valor, date: item.data, isFallback: false };
  } catch (e) {
    console.warn('[macroData] Selic fallback:', e.message);
    return FALLBACKS.selic;
  }
}

async function fetchIPCA() {
  try {
    const data = await fetchWithTimeout(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json',
    );
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) throw new Error('Resposta vazia');
    return { value: item.valor, date: item.data, isFallback: false };
  } catch (e) {
    console.warn('[macroData] IPCA fallback:', e.message);
    return FALLBACKS.ipca;
  }
}

async function fetchUsdBrl() {
  try {
    const data = await fetchWithTimeout(
      'https://economia.awesomeapi.com.br/json/last/USD-BRL',
    );
    const q = data?.USDBRL;
    if (!q) throw new Error('Resposta vazia');
    return { value: parseFloat(q.bid).toFixed(2), date: q.create_date, isFallback: false };
  } catch (e) {
    console.warn('[macroData] USD/BRL fallback:', e.message);
    return FALLBACKS.usdBrl;
  }
}

export async function getMacroData() {
  const now = Date.now();
  if (cache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return { ...cache, cachedAt: cacheTimestamp };
  }

  // Busca os 3 em paralelo — cada um falha independentemente
  const [selic, ipca, usdBrl] = await Promise.all([
    fetchSelic(),
    fetchIPCA(),
    fetchUsdBrl(),
  ]);

  cache = { selic, ipca, usdBrl };
  cacheTimestamp = now;
  console.log(`[macroData] Atualizado — Selic: ${selic.value}% | IPCA: ${ipca.value}% | USD: ${usdBrl.value}`);
  return { ...cache, cachedAt: cacheTimestamp };
}
