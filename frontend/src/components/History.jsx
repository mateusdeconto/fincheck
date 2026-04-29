import { calcMetrics, formatBRL } from '../lib/metrics.js';

const HEALTH_MAP = {
  'Saudável': { label: 'Saudável', dot: 'bg-money-500', text: 'text-money-700', bg: 'bg-money-50 border-money-200' },
  'Estável':  { label: 'Estável',  dot: 'bg-brand-500', text: 'text-brand-700', bg: 'bg-brand-50 border-brand-200' },
  'Atenção':  { label: 'Atenção',  dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'Crítica':  { label: 'Crítica',  dot: 'bg-loss-500',  text: 'text-loss-700',  bg: 'bg-loss-50 border-loss-200'  },
};

function extractHealth(text) {
  for (const key of Object.keys(HEALTH_MAP)) {
    if (text?.includes(key)) return HEALTH_MAP[key];
  }
  return null;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function DeltaBadge({ current, previous, format = 'brl', invertColor = false }) {
  if (previous == null || previous === 0) return null;
  const delta = current - previous;
  const pct = ((delta / Math.abs(previous)) * 100).toFixed(1);
  const positive = delta >= 0;
  const good = invertColor ? !positive : positive;
  const colorClass = good ? 'text-money-600 bg-money-50' : 'text-loss-600 bg-loss-50';
  const arrow = positive ? '↑' : '↓';
  const label = format === 'pct' ? `${Math.abs(pct)}pp` : `${Math.abs(pct)}%`;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass}`}>
      {arrow} {label}
    </span>
  );
}

export default function History({ records, onSelect, onCompare, onNewAnalysis, onBack }) {
  if (!records.length) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-16">
        <p className="text-ink-400 text-sm mb-4">Nenhum diagnóstico salvo ainda.</p>
        <button onClick={onNewAnalysis} className="btn-primary">Fazer primeira análise</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Histórico</h1>
          <p className="text-sm text-ink-400 mt-0.5">{records.length} {records.length === 1 ? 'análise' : 'análises'} salvas</p>
        </div>
        <button onClick={onNewAnalysis} className="btn-quiet text-sm">Nova análise →</button>
      </div>

      {records.map((rec, idx) => {
        const m = calcMetrics(rec.financial_data);
        const prev = records[idx + 1];
        const prevM = prev ? calcMetrics(prev.financial_data) : null;
        const health = extractHealth(rec.diagnosis_text);

        return (
          <div key={rec.id} className="bg-white border border-ink-200 rounded-xl overflow-hidden hover:border-ink-300 transition-colors">
            {/* Header do card */}
            <div className="flex items-start justify-between p-5 pb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-ink-400">{formatDate(rec.created_at)}</span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-900 text-white">mais recente</span>
                  )}
                </div>
                <p className="font-bold text-ink-900 mt-0.5 truncate">{rec.business_name}</p>
                <p className="text-xs text-ink-400 capitalize">{rec.segment}</p>
              </div>
              {health && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${health.bg} ${health.text} flex-shrink-0 ml-3`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                  {health.label}
                </div>
              )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-px bg-ink-100 border-t border-ink-100">
              {[
                { label: 'Receita',       value: formatBRL(m.revenue),              delta: prevM && <DeltaBadge current={m.revenue} previous={prevM.revenue} /> },
                { label: 'Lucro líquido', value: formatBRL(m.netProfit),            delta: prevM && <DeltaBadge current={m.netProfit} previous={prevM.netProfit} /> },
                { label: 'Margem líq.',   value: `${m.netMargin.toFixed(1)}%`,      delta: prevM && <DeltaBadge current={m.netMargin} previous={prevM.netMargin} format="pct" /> },
              ].map(col => (
                <div key={col.label} className="bg-white px-4 py-3">
                  <p className="text-[10px] text-ink-400 uppercase tracking-wider font-medium mb-1">{col.label}</p>
                  <p className="text-sm font-bold text-ink-800 font-mono">{col.value}</p>
                  {col.delta && <div className="mt-1">{col.delta}</div>}
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex gap-2 p-3 bg-ink-50 border-t border-ink-100">
              <button
                onClick={() => onSelect(rec)}
                className="flex-1 py-2 text-xs font-semibold text-ink-700 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 transition-colors"
              >
                Ver diagnóstico
              </button>
              {idx < records.length - 1 && (
                <button
                  onClick={() => onCompare(rec, records[idx + 1])}
                  className="flex-1 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Comparar com anterior
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button onClick={onBack} className="btn-back w-full">← Voltar</button>
    </div>
  );
}
