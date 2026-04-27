/**
 * Cálculo unificado de métricas financeiras.
 * Usar nos dois endpoints (diagnose + chat) para evitar divergência.
 */

export function calcMetrics(f = {}) {
  const revenue       = Number(f.revenue)       || 0;
  const cogs          = Number(f.cogs)          || 0;
  const fixedExpenses = Number(f.fixedExpenses) || 0;
  const debtPayment   = Number(f.debtPayment)   || 0;
  const investments   = Number(f.investments)   || 0;
  const cashBalance   = Number(f.cashBalance)   || 0;
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
