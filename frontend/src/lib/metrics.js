/**
 * Cálculo unificado de métricas — ESPELHO do backend/lib/metrics.js.
 * Manter os dois sincronizados. Mudou um, muda o outro.
 */

export function calcMetrics(f = {}) {
  const revenue            = Number(f.revenue)            || 0;
  const cogs               = Number(f.cogs)               || 0;
  const fixedExpenses      = Number(f.fixedExpenses)      || 0;
  const debtPayment        = Number(f.debtPayment)        || 0;
  const investments        = Number(f.investments)        || 0;
  const cashBalance        = Number(f.cashBalance)        || 0;
  const accountsReceivable = Number(f.accountsReceivable) || 0;

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const ebitda      = grossProfit - fixedExpenses;
  const netProfit   = ebitda - debtPayment - investments;
  const netMargin   = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const debtRatio   = revenue > 0 ? (debtPayment / revenue) * 100 : 0;
  const breakEven   = grossMargin > 0 ? fixedExpenses / (grossMargin / 100) : 0;

  return {
    revenue, cogs, fixedExpenses, debtPayment, investments, cashBalance, accountsReceivable,
    grossProfit, grossMargin, ebitda, netProfit, netMargin, debtRatio, breakEven,
  };
}

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function formatBRLCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `R$ ${(n / 1_000).toFixed(1)}k`;
  return formatBRL(n);
}
