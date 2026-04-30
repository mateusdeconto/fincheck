import { useMemo, useState } from 'react';
import { calcMetrics, formatBRL } from '../lib/metrics.js';
import { downloadDRE, downloadPDF, currentToEntry, recordToEntry, formatReferenceMonth } from '../lib/export.js';
import { SECTOR_BENCHMARKS } from './Onboarding.jsx';
import UpgradeModal from './UpgradeModal.jsx';

function renderMarkdown(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${escapeHtml(stripLeadingEmoji(trimmed.slice(3)))}</h2>`;
      continue;
    }
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${applyInlineMarkdown(trimmed.slice(2))}</li>`;
      continue;
    }
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p>${applyInlineMarkdown(trimmed)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

// Remove emojis decorativos do início de headings (🏢 ⚠️ ✅ 🎯)
function stripLeadingEmoji(text) {
  return text.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️]+\s*/u, '');
}

function applyInlineMarkdown(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function extractHealthStatus(text) {
  if (!text) return null;
  if (text.includes('Saudável')) return { label: 'Saudável',         tone: 'money',  desc: 'Margem confortável e caixa positivo' };
  if (text.includes('Estável'))  return { label: 'Estável',          tone: 'brand',  desc: 'Operação equilibrada' };
  if (text.includes('Atenção'))  return { label: 'Atenção',          tone: 'warn',   desc: 'Indicadores precisam de cuidado' };
  if (text.includes('Crítica'))  return { label: 'Crítica',          tone: 'loss',   desc: 'Risco financeiro elevado' };
  return null;
}

function extractFirstAlert(text) {
  if (!text) return null;
  const section = text.split(/##\s*[^\n]*Pontos de Atenção/)[1];
  if (!section) return null;
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (t.startsWith('##')) break;
    if (t.startsWith('• ') || t.startsWith('- ')) {
      return t.slice(2).replace(/\*\*/g, '').trim().slice(0, 120);
    }
  }
  return null;
}

function extractFirstRecommendation(text) {
  if (!text) return null;
  const section = text.split(/##\s*[^\n]*Recomendações/)[1];
  if (!section) return null;
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (t.startsWith('##')) break;
    if (/^\*?\*?1\./.test(t)) {
      return t.replace(/^\*?\*?1\.\s*/, '').replace(/\*\*/g, '').trim().slice(0, 140);
    }
  }
  return null;
}

function buildWhatsAppMessage(businessData, financialData, diagnosis, metrics, healthStatus) {
  const today  = new Date().toLocaleDateString('pt-BR');
  const status = healthStatus ? healthStatus.label : '—';
  const alert  = extractFirstAlert(diagnosis);
  const rec    = extractFirstRecommendation(diagnosis);

  const lines = [
    `*Diagnóstico FinCheck — ${businessData.businessName}*`,
    `${today}`,
    ``,
    `*Saúde:* ${status}`,
    `Receita: ${formatBRL(financialData.revenue)}`,
    `Margem líquida: ${metrics.netMargin.toFixed(1)}%`,
    `Caixa: ${formatBRL(financialData.cashBalance)}`,
    ``,
    ...(alert ? [`*Principal alerta:* ${alert}`, ``] : []),
    ...(rec   ? [`*Recomendação prioritária:* ${rec}`, ``] : []),
    `Faça o seu em: ${typeof window !== 'undefined' ? window.location.origin : ''}`,
  ];

  return lines.join('\n');
}

function calcProjection(f, m) {
  const cash       = m.cashBalance;
  const revenue    = m.revenue;
  const fixed      = m.fixedExpenses;
  const debt       = m.debtPayment;

  const projected  = cash + revenue - fixed - debt;
  const dailyCost  = fixed / 30;
  const status = projected < 0 ? 'loss' : projected < fixed ? 'warn' : 'money';
  const coverageDays = dailyCost > 0 && projected > 0 ? Math.floor(projected / dailyCost) : 0;

  let sentence;
  if (status === 'money') {
    sentence = `Mantendo o ritmo atual, você vai fechar o mês com ${formatBRL(projected)} em caixa — cobre cerca de ${coverageDays} dias de operação.`;
  } else if (status === 'warn') {
    sentence = `Caixa positivo (${formatBRL(projected)}), mas abaixo de um mês de custos fixos. Imprevistos podem virar problema.`;
  } else {
    sentence = `No ritmo atual, seu caixa vai ficar ${formatBRL(projected)} no vermelho. Precisa cortar custos ou buscar receita extra.`;
  }

  return { projected, coverageDays, status, sentence, cash, revenue, fixed, debt };
}

function BenchmarkChart({ metrics, segment }) {
  const bench = SECTOR_BENCHMARKS[segment] || SECTOR_BENCHMARKS.outro;
  const userCmvPct = metrics.revenue > 0 ? (metrics.cogs / metrics.revenue) * 100 : 0;

  const rows = [
    { label: 'Margem Bruta',   user: metrics.grossMargin, range: bench.grossMargin, higherBetter: true  },
    { label: 'Margem Líquida', user: metrics.netMargin,   range: bench.netMargin,   higherBetter: true  },
    { label: 'CMV %',          user: userCmvPct,           range: bench.cmvPct,      higherBetter: false },
  ];

  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4">Você vs. média do setor</p>
      <div className="space-y-4">
        {rows.map(row => {
          const maxVal = Math.max(row.user, row.range[1]) * 1.3 || 100;
          const userW  = Math.min(Math.max(row.user, 0) / maxVal * 100, 100);
          const sectW  = Math.min(((row.range[0] + row.range[1]) / 2) / maxVal * 100, 100);
          const isGood = row.higherBetter ? row.user >= row.range[0] : row.user <= row.range[1];
          const userColor = row.user === 0 ? 'bg-ink-200' : isGood ? 'bg-money-500' : 'bg-amber-500';

          return (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ink-700">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isGood ? 'text-money-600' : 'text-amber-600'}`}>
                    {row.user.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-ink-400">setor: {row.range[0]}–{row.range[1]}%</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-400 w-8 shrink-0">Você</span>
                  <div className="flex-1 h-2.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${userColor}`} style={{ width: `${userW}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-400 w-8 shrink-0">Setor</span>
                  <div className="flex-1 h-2.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-300" style={{ width: `${sectW}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-ink-400 mt-4">Referência: benchmarks Sebrae/IBGE para {segment || 'seu setor'}</p>
    </div>
  );
}

// Mapeia tom de saúde para classes
const TONE_CLASSES = {
  money: { bg: 'bg-money-50', border: 'border-money-200', text: 'text-money-700', dot: 'bg-money-500' },
  brand: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', dot: 'bg-brand-500' },
  warn:  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  loss:  { bg: 'bg-loss-50',  border: 'border-loss-200',  text: 'text-loss-700',  dot: 'bg-loss-500' },
};

export default function Diagnosis({ businessData, financialData, diagnosis, allDiagnoses = [], plan = 'free', user, onOpenChat, onOpenTracking, onOpenHistory, onRestart }) {
  const renderedHtml  = useMemo(() => renderMarkdown(diagnosis),      [diagnosis]);
  const healthStatus  = useMemo(() => extractHealthStatus(diagnosis), [diagnosis]);
  const metrics       = useMemo(() => calcMetrics(financialData),     [financialData]);
  const projection    = useMemo(() => calcProjection(financialData, metrics), [financialData, metrics]);
  const [exporting, setExporting] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isPaid = plan === 'paid';

  const netProfitPositive = metrics.netProfit >= 0;
  const healthTone = healthStatus ? TONE_CLASSES[healthStatus.tone] : TONE_CLASSES.brand;
  const projTone = TONE_CLASSES[projection.status];

  async function handleExcel() {
    setExporting(true);
    try {
      const entries = [currentToEntry(businessData, financialData), ...allDiagnoses.map(recordToEntry)];
      const safeName = businessData.businessName.replace(/\s+/g, '_');
      const now = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      await downloadDRE(entries, `DRE_${safeName}_${now}.xlsx`);
    }
    catch (e) { console.error(e); alert('Erro ao gerar Excel. Tente novamente.'); }
    finally { setExporting(false); }
  }

  async function handlePDF() {
    setPdfExporting(true);
    try { await downloadPDF(businessData, diagnosis, financialData); }
    catch (e) { console.error(e); alert('Erro ao gerar PDF. Tente novamente.'); }
    finally { setPdfExporting(false); }
  }

  async function handleSendEmail() {
    if (!user?.email) return;
    setEmailSending(true);
    setEmailSent(false);
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: user.email,
          businessData,
          financialData,
          diagnosis,
          metrics,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro desconhecido');
      }
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (e) {
      console.error(e);
      alert(`Erro ao enviar e-mail: ${e.message}`);
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header */}
      <div className="mb-1">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
          Diagnóstico financeiro
        </p>
        <h1 className="text-3xl font-bold text-ink-900 tracking-tighter">
          {businessData.businessName}
        </h1>
        <p className="text-ink-500 text-sm mt-0.5 capitalize">
          {businessData.segment}
          {businessData.referenceMonth && (
            <span className="ml-2 text-ink-400">· {formatReferenceMonth(businessData.referenceMonth)}</span>
          )}
        </p>
      </div>

      {/* Health badge */}
      {healthStatus && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${healthTone.bg} ${healthTone.border}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${healthTone.dot}`} />
          <div className="flex-1">
            <p className={`text-sm font-bold ${healthTone.text}`}>Saúde financeira: {healthStatus.label}</p>
            <p className="text-xs text-ink-500 mt-0.5">{healthStatus.desc}</p>
          </div>
        </div>
      )}

      {/* Mistura financeira */}
      {financialData.mixedAccounts && (
        <div className="rounded-lg p-4 border border-loss-200 bg-loss-50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-loss-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-loss-700 mb-1">Risco: mistura conta pessoal e PJ</p>
              <p className="text-sm text-loss-600 leading-relaxed">
                Misturar dinheiro pessoal com o do negócio é uma das principais causas de falência de pequenas empresas no Brasil.
                Você não enxerga se o negócio dá lucro de verdade, e pode ter problema com a Receita.
                Abra uma conta PJ separada — quase todo banco digital faz gratuitamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card hero — Lucro líquido */}
      <div className="card-dark p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-ink-300 uppercase tracking-wider mb-1">
              Lucro líquido do mês
            </p>
            <p className="text-xs text-ink-400">O que sobra pra você no fim</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${netProfitPositive ? 'bg-money-500/15 text-money-500' : 'bg-loss-500/15 text-loss-500'}`}>
            {netProfitPositive ? 'Positivo' : 'Negativo'}
          </span>
        </div>
        <p className={`text-4xl font-bold tracking-tighter font-mono ${netProfitPositive ? 'text-money-500' : 'text-loss-500'}`}>
          {formatBRL(metrics.netProfit)}
        </p>
        <p className="text-sm mt-1 text-ink-300 font-medium">
          Margem líquida: {metrics.netMargin.toFixed(1)}%
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-ink-800">
          <div>
            <p className="text-[11px] text-ink-400 uppercase tracking-wider font-medium mb-1">Lucro Bruto</p>
            <p className="text-base font-bold font-mono">{formatBRL(metrics.grossProfit)}</p>
            <p className="text-xs text-ink-400 mt-0.5">{metrics.grossMargin.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-400 uppercase tracking-wider font-medium mb-1">EBITDA</p>
            <p className="text-base font-bold font-mono">{formatBRL(metrics.ebitda)}</p>
            <p className="text-xs text-ink-400 mt-0.5">
              {financialData.revenue > 0 ? ((metrics.ebitda / financialData.revenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="card p-6">
        <div className="diagnosis-content" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>

      {/* Benchmark */}
      <BenchmarkChart metrics={metrics} segment={businessData.segment} />

      {/* Ponto de equilíbrio destacado */}
      {metrics.breakEven > 0 && (
        <div className="card p-5 border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">Ponto de Equilíbrio</p>
          <p className="text-[11px] text-ink-400 mb-3">Faturamento mínimo para não perder dinheiro</p>
          <p className="text-4xl font-bold text-ink-900 font-mono tracking-tighter">{formatBRL(metrics.breakEven)}</p>
          <p className="text-xs text-ink-500 mt-2 leading-relaxed">
            Você precisa faturar pelo menos <strong>{formatBRL(metrics.breakEven)}/mês</strong> para cobrir todos os custos.
          </p>
          {metrics.revenue > 0 && (
            <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${
              metrics.revenue >= metrics.breakEven ? 'text-money-600' : 'text-loss-600'
            }`}>
              <span>{metrics.revenue >= metrics.breakEven ? '✓' : '⚠'}</span>
              {metrics.revenue >= metrics.breakEven
                ? `Você está ${formatBRL(metrics.revenue - metrics.breakEven)} acima do ponto de equilíbrio`
                : `Você está ${formatBRL(metrics.breakEven - metrics.revenue)} abaixo do ponto de equilíbrio`
              }
            </div>
          )}
        </div>
      )}

      {/* Projeção 30 dias */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-ink-800">Projeção dos próximos 30 dias</p>
            <p className="text-xs text-ink-400 mt-0.5">Mantendo o ritmo atual</p>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${projTone.dot}`} />
        </div>

        <p className={`text-2xl font-bold tracking-tighter font-mono mb-1 ${projTone.text}`}>
          {formatBRL(projection.projected)}
        </p>
        <p className="text-xs text-ink-400 mb-4">saldo projetado</p>

        <div className={`rounded-md p-3 mb-4 ${projTone.bg} border ${projTone.border}`}>
          <p className={`text-sm leading-relaxed ${projTone.text}`}>{projection.sentence}</p>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">Como calculamos</p>
          {[
            { label: '(+) Caixa atual',     value: projection.cash,     pos: true  },
            { label: '(+) Receita do mês',  value: projection.revenue,  pos: true  },
            { label: '(−) Gastos fixos',    value: projection.fixed,    pos: false },
            { label: '(−) Dívidas',         value: projection.debt,     pos: false },
          ].map(row => (
            <div key={row.label} className="data-row text-xs">
              <span className="data-label">{row.label}</span>
              <span className="data-value text-ink-600">
                {row.pos ? '+' : '−'} {formatBRL(row.value)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 mt-1">
            <span className="text-xs font-bold text-ink-700">= Projeção 30 dias</span>
            <span className={`text-sm font-bold font-mono ${projTone.text}`}>{formatBRL(projection.projected)}</span>
          </div>
        </div>
      </div>

      {/* Exportações */}
      <div className="card p-5">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-3">Exportar relatório</p>
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button onClick={handlePDF} disabled={pdfExporting} className="btn-pdf disabled:opacity-50">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {pdfExporting ? 'Gerando…' : 'Baixar PDF'}
            </span>
          </button>
          <button onClick={handleExcel} disabled={exporting} className="btn-excel disabled:opacity-50">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625" />
              </svg>
              {exporting ? 'Gerando…' : 'DRE em Excel'}
            </span>
          </button>
        </div>
        {user?.email && (
          <button
            onClick={handleSendEmail}
            disabled={emailSending || emailSent}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-ink-200 text-sm font-semibold text-ink-700 bg-white hover:bg-ink-50 disabled:opacity-60 transition-colors"
          >
            {emailSent ? (
              <>
                <svg className="w-4 h-4 text-money-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enviado para {user.email}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {emailSending ? 'Enviando…' : `Enviar para ${user.email}`}
              </>
            )}
          </button>
        )}
      </div>

      {/* Compartilhar */}
      <button
        onClick={() => {
          const msg = buildWhatsAppMessage(businessData, financialData, diagnosis, metrics, healthStatus);
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        }}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-semibold text-white text-[15px] active:scale-[0.99] transition-all"
        style={{ background: '#25d366' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Compartilhar no WhatsApp
      </button>

      {/* Ações — pro features com lock para free */}
      <div className="space-y-2.5">
        {allDiagnoses.length > 0 && (
          <button
            onClick={isPaid ? onOpenHistory : () => setShowUpgrade(true)}
            className={`btn-secondary w-full ${!isPaid ? 'opacity-80' : ''}`}
          >
            <span className="flex items-center justify-center gap-2">
              {!isPaid && <svg className="w-3.5 h-3.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver histórico ({allDiagnoses.length} {allDiagnoses.length === 1 ? 'análise' : 'análises'})
              {!isPaid && <span className="ml-auto text-[10px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">PRO</span>}
            </span>
          </button>
        )}
        <button
          onClick={isPaid ? onOpenTracking : () => setShowUpgrade(true)}
          className={`btn-primary w-full ${!isPaid ? 'opacity-80' : ''}`}
        >
          <span className="flex items-center justify-center gap-2">
            {!isPaid && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Acompanhamento mensal
            {!isPaid && <span className="ml-auto text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded">PRO</span>}
          </span>
        </button>
        <button
          onClick={isPaid ? onOpenChat : () => setShowUpgrade(true)}
          className={`btn-secondary w-full ${!isPaid ? 'opacity-80' : ''}`}
        >
          <span className="flex items-center justify-center gap-2">
            {!isPaid && <svg className="w-3.5 h-3.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Consultor IA
            {!isPaid && <span className="ml-auto text-[10px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">PRO</span>}
          </span>
        </button>
        <button onClick={onRestart} className="btn-back">
          Começar novo diagnóstico
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 pb-4">FinCheck — diagnóstico em linguagem de dono</p>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
