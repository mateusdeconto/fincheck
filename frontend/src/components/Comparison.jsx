import { useMemo } from 'react';
import { calcMetrics, formatBRL } from '../lib/metrics.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Delta({ a, b, format = 'brl', invertColor = false }) {
  if (b == null || b === 0) return <span className="text-ink-300 text-xs">—</span>;
  const delta = a - b;
  const pct = ((delta / Math.abs(b)) * 100).toFixed(1);
  const positive = delta > 0;
  const good = invertColor ? !positive : positive;
  const color = delta === 0 ? 'text-ink-400' : good ? 'text-money-600' : 'text-loss-600';
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  const formatted = format === 'brl'
    ? formatBRL(Math.abs(delta))
    : `${Math.abs(delta).toFixed(1)}${format === 'pct' ? 'pp' : '%'}`;

  return (
    <span className={`text-xs font-bold ${color}`}>
      {arrow} {formatted} ({Math.abs(pct)}%)
    </span>
  );
}

function Cell({ value, highlight }) {
  return (
    <td className={`px-4 py-3 font-mono text-sm font-semibold text-right ${highlight ? 'text-ink-900' : 'text-ink-600'}`}>
      {value}
    </td>
  );
}

export default function Comparison({ recordA, recordB, onBack }) {
  const mA = useMemo(() => calcMetrics(recordA.financial_data), [recordA]);
  const mB = useMemo(() => calcMetrics(recordB.financial_data), [recordB]);

  const rows = [
    { label: 'Receita Bruta',     a: formatBRL(mA.revenue),       b: formatBRL(mB.revenue),       delta: <Delta a={mA.revenue} b={mB.revenue} />,                         highlight: false },
    { label: 'CMV',               a: formatBRL(mA.cogs),          b: formatBRL(mB.cogs),          delta: <Delta a={mA.cogs} b={mB.cogs} invertColor />,                   highlight: false },
    { label: 'Lucro Bruto',       a: formatBRL(mA.grossProfit),   b: formatBRL(mB.grossProfit),   delta: <Delta a={mA.grossProfit} b={mB.grossProfit} />,                  highlight: true  },
    { label: 'Margem Bruta',      a: `${mA.grossMargin.toFixed(1)}%`, b: `${mB.grossMargin.toFixed(1)}%`, delta: <Delta a={mA.grossMargin} b={mB.grossMargin} format="pct" />, highlight: false },
    { label: 'Despesas Fixas',    a: formatBRL(mA.fixedExpenses), b: formatBRL(mB.fixedExpenses), delta: <Delta a={mA.fixedExpenses} b={mB.fixedExpenses} invertColor />,  highlight: false },
    { label: 'EBITDA',            a: formatBRL(mA.ebitda),        b: formatBRL(mB.ebitda),        delta: <Delta a={mA.ebitda} b={mB.ebitda} />,                            highlight: false },
    { label: 'Dívidas/Parcelas',  a: formatBRL(mA.debtPayment),   b: formatBRL(mB.debtPayment),   delta: <Delta a={mA.debtPayment} b={mB.debtPayment} invertColor />,      highlight: false },
    { label: 'Lucro Líquido',     a: formatBRL(mA.netProfit),     b: formatBRL(mB.netProfit),     delta: <Delta a={mA.netProfit} b={mB.netProfit} />,                      highlight: true  },
    { label: 'Margem Líquida',    a: `${mA.netMargin.toFixed(1)}%`, b: `${mB.netMargin.toFixed(1)}%`, delta: <Delta a={mA.netMargin} b={mB.netMargin} format="pct" />,   highlight: true  },
    { label: 'Saldo de Caixa',    a: formatBRL(mA.cashBalance),   b: formatBRL(mB.cashBalance),   delta: <Delta a={mA.cashBalance} b={mB.cashBalance} />,                  highlight: false },
    { label: 'Ponto de Equilíbrio', a: formatBRL(mA.breakEven),  b: formatBRL(mB.breakEven),     delta: <Delta a={mA.breakEven} b={mB.breakEven} invertColor />,           highlight: false },
  ];

  const revenueGrew = mA.revenue > mB.revenue;
  const profitGrew  = mA.netProfit > mB.netProfit;
  const marginGrew  = mA.netMargin > mB.netMargin;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Comparação</h1>
        <p className="text-sm text-ink-400 mt-0.5">{recordA.business_name}</p>
      </div>

      {/* Resumo do que mudou */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Receita',        grew: revenueGrew, a: formatBRL(mA.revenue),              b: formatBRL(mB.revenue) },
          { label: 'Lucro líquido',  grew: profitGrew,  a: formatBRL(mA.netProfit),            b: formatBRL(mB.netProfit) },
          { label: 'Margem líquida', grew: marginGrew,  a: `${mA.netMargin.toFixed(1)}%`,      b: `${mB.netMargin.toFixed(1)}%` },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-3 ${card.grew ? 'bg-money-50 border-money-200' : 'bg-loss-50 border-loss-200'}`}>
            <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-base font-bold font-mono ${card.grew ? 'text-money-700' : 'text-loss-700'}`}>{card.a}</p>
            <p className="text-xs text-ink-400 mt-0.5">antes: {card.b}</p>
          </div>
        ))}
      </div>

      {/* Tabela completa */}
      <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Indicador</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-900 uppercase tracking-wider">
                  {formatDate(recordA.created_at)}
                  <span className="ml-1.5 text-[9px] font-bold bg-ink-900 text-white px-1.5 py-0.5 rounded-full">novo</span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">{formatDate(recordB.created_at)}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map(row => (
                <tr key={row.label} className={row.highlight ? 'bg-ink-50/50' : ''}>
                  <td className={`px-4 py-3 text-sm ${row.highlight ? 'font-bold text-ink-800' : 'text-ink-600'}`}>{row.label}</td>
                  <Cell value={row.a} highlight={row.highlight} />
                  <Cell value={row.b} highlight={false} />
                  <td className="px-4 py-3 text-right">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={onBack} className="btn-back w-full">← Voltar ao histórico</button>
    </div>
  );
}
