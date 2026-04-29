import { useState } from 'react';
import { calcMetrics, formatBRL } from '../lib/metrics.js';
import { downloadDRE, downloadPDF, recordToEntry, formatReferenceMonth } from '../lib/export.js';

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

function DeltaBadge({ current, previous }) {
  if (previous == null || previous === 0) return null;
  const delta = current - previous;
  const pct = ((delta / Math.abs(previous)) * 100).toFixed(1);
  const positive = delta >= 0;
  const colorClass = positive ? 'text-money-600 bg-money-50' : 'text-loss-600 bg-loss-50';
  const arrow = positive ? '↑' : '↓';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass}`}>
      {arrow} {Math.abs(pct)}%
    </span>
  );
}

function recordLabel(rec) {
  const refMonth = rec.financial_data?.referenceMonth;
  return refMonth
    ? formatReferenceMonth(refMonth)
    : formatDate(rec.created_at);
}

export default function History({ records, onSelect, onCompare, onNewAnalysis, onBack }) {
  const [selected, setSelected]       = useState(new Set());
  const [loadingId, setLoadingId]     = useState(null); // 'pdf-<id>' | 'dre-<id>'
  const [loadingMulti, setLoadingMulti] = useState(false);

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(prev => prev.size === records.length ? new Set() : new Set(records.map(r => r.id)));
  }

  async function handleDownloadPDF(rec) {
    setLoadingId(`pdf-${rec.id}`);
    try {
      await downloadPDF(
        { businessName: rec.business_name, segment: rec.segment, referenceMonth: rec.financial_data?.referenceMonth },
        rec.diagnosis_text,
        rec.financial_data,
      );
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar PDF.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDownloadDRE(rec) {
    setLoadingId(`dre-${rec.id}`);
    try {
      const entry = recordToEntry(rec);
      const safeName = rec.business_name.replace(/\s+/g, '_');
      await downloadDRE([entry], `DRE_${safeName}_${entry.sheetLabel.replace(/\s+/g, '_')}.xlsx`);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar DRE.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDownloadMultiDRE() {
    const selectedRecords = records.filter(r => selected.has(r.id));
    if (selectedRecords.length < 2) return;
    setLoadingMulti(true);
    try {
      const entries = selectedRecords.map(recordToEntry);
      const safeName = selectedRecords[0].business_name.replace(/\s+/g, '_');
      await downloadDRE(entries, `DRE_${safeName}_comparativo_${selectedRecords.length}meses.xlsx`);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar DRE combinada.');
    } finally {
      setLoadingMulti(false);
    }
  }

  if (!records.length) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-16">
        <p className="text-ink-400 text-sm mb-4">Nenhum diagnóstico salvo ainda.</p>
        <button onClick={onNewAnalysis} className="btn-primary">Fazer primeira análise</button>
      </div>
    );
  }

  const selectedCount = selected.size;
  const allSelected   = selectedCount === records.length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Histórico de análises</h1>
          <p className="text-sm text-ink-400 mt-0.5">{records.length} {records.length === 1 ? 'análise' : 'análises'} salvas</p>
        </div>
        <button onClick={onNewAnalysis} className="btn-quiet text-sm">Nova análise →</button>
      </div>

      {/* Barra de seleção múltipla */}
      <div className="flex items-center justify-between bg-white border border-ink-200 rounded-xl px-4 py-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-ink-900"
          />
          <span className="text-sm font-medium text-ink-700">
            {selectedCount === 0 ? 'Selecionar para DRE comparativa' : `${selectedCount} ${selectedCount === 1 ? 'mês selecionado' : 'meses selecionados'}`}
          </span>
        </label>

        {selectedCount >= 2 && (
          <button
            onClick={handleDownloadMultiDRE}
            disabled={loadingMulti}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-ink-900 text-white text-xs font-semibold rounded-lg hover:bg-ink-800 disabled:opacity-60 transition-colors"
          >
            {loadingMulti ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Baixar DRE comparativa ({selectedCount} meses)
          </button>
        )}
      </div>

      {/* Cards */}
      {records.map((rec, idx) => {
        const m      = calcMetrics(rec.financial_data);
        const prev   = records[idx + 1];
        const prevM  = prev ? calcMetrics(prev.financial_data) : null;
        const health = extractHealth(rec.diagnosis_text);
        const isSelected = selected.has(rec.id);

        return (
          <div
            key={rec.id}
            className={`bg-white border-2 rounded-xl overflow-hidden transition-colors ${isSelected ? 'border-ink-900' : 'border-ink-200 hover:border-ink-300'}`}
          >
            {/* Header do card */}
            <div className="flex items-start gap-3 p-5 pb-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(rec.id)}
                className="mt-1 w-4 h-4 rounded accent-ink-900 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-ink-600">{recordLabel(rec)}</span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-900 text-white">mais recente</span>
                  )}
                </div>
                <p className="font-bold text-ink-900 mt-0.5 truncate">{rec.business_name}</p>
                <p className="text-xs text-ink-400 capitalize">{rec.segment}</p>
              </div>
              {health && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${health.bg} ${health.text} flex-shrink-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                  {health.label}
                </div>
              )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-px bg-ink-100 border-t border-ink-100">
              {[
                { label: 'Receita',       value: formatBRL(m.revenue),         delta: prevM && <DeltaBadge current={m.revenue} previous={prevM.revenue} /> },
                { label: 'Lucro líquido', value: formatBRL(m.netProfit),       delta: prevM && <DeltaBadge current={m.netProfit} previous={prevM.netProfit} /> },
                { label: 'Margem líq.',   value: `${m.netMargin.toFixed(1)}%`, delta: prevM && <DeltaBadge current={m.netMargin} previous={prevM.netMargin} /> },
              ].map(col => (
                <div key={col.label} className="bg-white px-4 py-3">
                  <p className="text-[10px] text-ink-400 uppercase tracking-wider font-medium mb-1">{col.label}</p>
                  <p className="text-sm font-bold text-ink-800 font-mono">{col.value}</p>
                  {col.delta && <div className="mt-1">{col.delta}</div>}
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2 p-3 bg-ink-50 border-t border-ink-100">
              <button
                onClick={() => onSelect(rec)}
                className="flex-1 min-w-[110px] py-2 text-xs font-semibold text-ink-700 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 transition-colors"
              >
                Ver diagnóstico
              </button>
              {idx < records.length - 1 && (
                <button
                  onClick={() => onCompare(rec, records[idx + 1])}
                  className="flex-1 min-w-[110px] py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Comparar com anterior
                </button>
              )}
              <button
                onClick={() => handleDownloadPDF(rec)}
                disabled={loadingId === `pdf-${rec.id}`}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-600 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 disabled:opacity-50 transition-colors"
              >
                {loadingId === `pdf-${rec.id}` ? (
                  <span className="w-3 h-3 rounded-full border-2 border-ink-300 border-t-ink-700 animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                )}
                PDF
              </button>
              <button
                onClick={() => handleDownloadDRE(rec)}
                disabled={loadingId === `dre-${rec.id}`}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-money-700 bg-money-50 border border-money-200 rounded-lg hover:bg-money-100 disabled:opacity-50 transition-colors"
              >
                {loadingId === `dre-${rec.id}` ? (
                  <span className="w-3 h-3 rounded-full border-2 border-money-200 border-t-money-600 animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625" />
                  </svg>
                )}
                DRE
              </button>
            </div>
          </div>
        );
      })}

      <button onClick={onBack} className="btn-back w-full">← Voltar</button>
    </div>
  );
}
