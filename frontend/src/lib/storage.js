/**
 * Wrapper resiliente sobre localStorage.
 *  - Safari privado / iOS / quota excedida → não derruba o app.
 *  - JSON parse seguro.
 *  - Suporte a versão de schema para migrações futuras.
 */

const SAFE = typeof window !== 'undefined' && (() => {
  try {
    const k = '__fc_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

export function readJSON(key, fallback) {
  if (!SAFE) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  if (!SAFE) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  if (!SAFE) return;
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

export function readSession(key, fallback) {
  if (!SAFE) return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeSession(key, value) {
  if (!SAFE) return false;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeSession(key) {
  if (!SAFE) return;
  try { window.sessionStorage.removeItem(key); } catch { /* ignore */ }
}

export const STORAGE_AVAILABLE = SAFE;
