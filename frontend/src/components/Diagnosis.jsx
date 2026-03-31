import { useMemo } from 'react';
import * as XLSX from 'xlsx';

function renderMarkdown(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
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
  if (text.includes('✅ Saudável') || text.includes('Saudável')) return { label: 'Saudável', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: '✅' };
  if (text.includes('🟢 Estável') || text.includes('Estável')) return { label: 'Estável', color: 'bg-teal-100 text-teal-700 border border-teal-200', dot: '🟢' };
  if (text.includes('🟡 Atenção') || text.includes('Atenção')) return { label: 'Atenção necessária', color: 'bg-amber-100 text-amber-700 border border-amber-200', dot: '🟡' };
  if (text.includes('🔴 Crítica') || text.includes('Crítica')) return { label: 'Situação crítica', color: 'bg-red-100 text-red-700 border border-red-200', dot: '🔴' };
  return null;
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// Extrai o primeiro item da seção "Pontos de Atenção"
function extractFirstAlert(text) {
  if (!text) return null;
  const section = text.split(/##\s*⚠️\s*Pontos de Atenção/)[1];
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

// Extrai a primeira recomendação da seção "Recomendações para essa semana"
function extractFirstRecommendation(text) {
  if (!text) return null;
  const section = text.split(/##\s*🎯\s*Recomendações/)[1];
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
  const status = healthStatus ? `${healthStatus.dot} ${healthStatus.label}` : '—';
  const alert  = extractFirstAlert(diagnosis);
  const rec    = extractFirstRecommendation(diagnosis);

  const lines = [
    `📊 *Diagnóstico FinCheck — ${businessData.businessName}*`,
    `📅 ${today}`,
    ``,
    `*Situação:* ${status}`,
    `💰 Receita: ${formatBRL(financialData.revenue)}`,
    `📈 Margem líquida: ${metrics.netMargin.toFixed(1)}%`,
    `💵 Saldo em caixa: ${formatBRL(financialData.cashBalance)}`,
    ``,
    ...(alert ? [`*Principal alerta:* ${alert}`, ``] : []),
    ...(rec   ? [`*Recomendação prioritária:* ${rec}`, ``] : []),
    `Análise completa em: https://fincheck-production-27bd.up.railway.app`,
  ];

  return lines.join('\n');
}

function calcProjection(f) {
  const cash       = f.cashBalance    || 0;
  const revenue    = f.revenue        || 0;
  const fixed      = f.fixedExpenses  || 0;
  const debt       = f.debtPayment    || 0;

  // Projeção conservadora: mantém receita igual, paga custos fixos + dívidas
  const projected  = cash + revenue - fixed - debt;
  const dailyCost  = fixed / 30;

  // Semáforo
  // 🔴 negativo  |  🟡 positivo mas < 1 mês de custo fixo  |  🟢 ≥ 1 mês de custo fixo
  const status = projected < 0 ? 'red' : projected < fixed ? 'yellow' : 'green';

  // Dias de operação cobertos
  const coverageDays = dailyCost > 0 && projected > 0
    ? Math.floor(projected / dailyCost)
    : 0;

  // Frase explicativa
  let sentence;
  if (status === 'green') {
    sentence = `No ritmo atual, você vai encerrar o mês com ${formatBRL(projected)} no caixa — suficiente para cobrir aproximadamente ${coverageDays} dias de operação.`;
  } else if (status === 'yellow') {
    sentence = `Caixa vai ficar positivo (${formatBRL(projected)}), mas abaixo de um mês de custos fixos. Qualquer imprevisto ou queda de receita pode comprometer as contas.`;
  } else {
    sentence = `Atenção: no ritmo atual, seu caixa ficará ${formatBRL(projected)} no vermelho. Será preciso cortar custos ou buscar receita extra para fechar o mês.`;
  }

  return { projected, coverageDays, status, sentence, cash, revenue, fixed, debt };
}

function calcMetrics(f) {
  const grossProfit = (f.revenue || 0) - (f.cogs || 0);
  const grossMargin = f.revenue > 0 ? ((grossProfit / f.revenue) * 100) : 0;
  const ebitda = grossProfit - (f.fixedExpenses || 0);
  const netProfit = ebitda - (f.debtPayment || 0) - (f.investments || 0);
  const netMargin = f.revenue > 0 ? ((netProfit / f.revenue) * 100) : 0;
  return { grossProfit, grossMargin, ebitda, netProfit, netMargin };
}

function downloadDRE(businessData, financialData) {
  const f = financialData;
  const { grossProfit, grossMargin, ebitda, netProfit, netMargin } = calcMetrics(f);

  const fmt = (n) => n;
  const pct = (n) => `${n.toFixed(1)}%`;
  const now = new Date().toLocaleDateString('pt-BR');

  const rows = [
    ['DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)', '', ''],
    ['', '', ''],
    ['Empresa:', businessData.businessName, ''],
    ['Segmento:', businessData.segment, ''],
    ['Gerado em:', now, ''],
    ['', '', ''],
    ['RECEITAS', '', ''],
    ['(+) Receita Bruta', fmt(f.revenue), ''],
    ['', '', ''],
    ['CUSTOS', '', ''],
    ['(-) Custo das Vendas / CMV', fmt(f.cogs), ''],
    ['', '', ''],
    ['= LUCRO BRUTO', fmt(grossProfit), `Margem: ${pct(grossMargin)}`],
    ['', '', ''],
    ['(-) DESPESAS FIXAS OPERACIONAIS', '', ''],
    ...(f.fixedExpensesItems && f.fixedExpensesItems.length > 0
      ? f.fixedExpensesItems.map(i => [`    • ${i.desc}`, fmt(i.value), ''])
      : [['    (Sem detalhamento por item)', fmt(f.fixedExpenses), '']]),
    ['  Subtotal Despesas Fixas', fmt(f.fixedExpenses), ''],
    ['', '', ''],
    ['= RESULTADO OPERACIONAL (EBITDA)', fmt(ebitda), `Margem: ${pct(f.revenue > 0 ? (ebitda / f.revenue) * 100 : 0)}`],
    ['', '', ''],
  ];

  if ((f.debtPayment || 0) > 0) {
    rows.push(['(-) DÍVIDAS / FINANCIAMENTOS', '', '']);
    if (f.debtPaymentItems && f.debtPaymentItems.length > 0) {
      f.debtPaymentItems.forEach(i => rows.push([`    • ${i.desc}`, fmt(i.value), '']));
    } else {
      rows.push(['    (Sem detalhamento por item)', fmt(f.debtPayment), '']);
    }
    rows.push(['  Subtotal Dívidas', fmt(f.debtPayment), '']);
    rows.push(['', '', '']);
  }

  if ((f.investments || 0) > 0) {
    rows.push(['(-) Investimentos na Empresa', fmt(f.investments), '']);
    rows.push(['', '', '']);
  }

  rows.push(['= LUCRO LÍQUIDO (O QUE VAI PRO SEU BOLSO)', fmt(netProfit), `Margem: ${pct(netMargin)}`]);
  rows.push(['', '', '']);
  rows.push(['OUTROS INDICADORES', '', '']);
  rows.push(['Saldo de Caixa Atual', fmt(f.cashBalance || 0), '']);
  rows.push(['Contas a Receber (inadimplência)', fmt(f.accountsReceivable || 0), '']);
  rows.push(['', '', '']);
  rows.push(['Gerado pelo FinCheck — fincheck.app', '', '']);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [{ wch: 50 }, { wch: 18 }, { wch: 18 }];

  // Style header row (bold)
  if (!ws['A1'].s) ws['A1'].s = {};

  XLSX.utils.book_append_sheet(wb, ws, 'DRE');

  const dateStr = now.replace(/\//g, '-');
  XLSX.writeFile(wb, `DRE_${businessData.businessName.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
}

function downloadPDF(businessData, diagnosis, renderedHtml, healthStatus) {
  const now = new Date().toLocaleDateString('pt-BR');

  const badgeHtml = healthStatus
    ? `<div style="margin:12px 0;"><span style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:100px;font-size:13px;font-weight:700;background:#f0f4fa;color:#1e3a5f;border:1px solid #dce6f5;">${healthStatus.dot} Saúde Financeira: ${healthStatus.label}</span></div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Diagnóstico Financeiro — ${businessData.businessName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 48px; color: #1e293b; background: white; }
    .header { border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #3a67a5; margin-bottom: 8px; }
    h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #64748b; }
    h2 { font-size: 15px; font-weight: 700; color: #1e3a5f; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    p { font-size: 13px; line-height: 1.65; color: #475569; margin-bottom: 10px; }
    ul { margin: 0 0 12px 0; padding: 0; list-style: none; }
    li { font-size: 13px; line-height: 1.65; color: #475569; padding: 3px 0 3px 14px; position: relative; }
    li::before { content: '•'; position: absolute; left: 0; color: #3a67a5; }
    strong { font-weight: 700; color: #0f172a; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 24px 32px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">FinCheck — Diagnóstico Financeiro</div>
    <h1>${businessData.businessName}</h1>
    <div class="meta">${businessData.segment} &nbsp;·&nbsp; Gerado em ${now}</div>
    ${badgeHtml}
  </div>
  <div class="content">${renderedHtml}</div>
  <div class="footer">Gerado pelo FinCheck — diagnóstico financeiro para pequenas empresas brasileiras</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Permita pop-ups para baixar o PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

export default function Diagnosis({ businessData, financialData, diagnosis, onOpenChat, onOpenTracking, onRestart }) {
  const renderedHtml  = useMemo(() => renderMarkdown(diagnosis),        [diagnosis]);
  const healthStatus  = useMemo(() => extractHealthStatus(diagnosis),   [diagnosis]);
  const metrics       = useMemo(() => calcMetrics(financialData),       [financialData]);
  const projection    = useMemo(() => calcProjection(financialData),    [financialData]);

  const netProfitPositive = metrics.netProfit >= 0;

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
             style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Diagnóstico Financeiro</h1>
        <p className="text-white/50 text-sm mt-1">{businessData.businessName}</p>
      </div>

      {/* Badge de saúde */}
      {healthStatus && (
        <div className="flex justify-center">
          <span className={`health-tag ${healthStatus.color} shadow-sm`}>
            {healthStatus.dot} Saúde Financeira: {healthStatus.label}
          </span>
        </div>
      )}

      {/* ── Alerta: mistura financeira ── */}
      {financialData.mixedAccounts && (
        <div className="rounded-2xl p-5 border-2 border-red-400"
             style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-700 mb-1">⚠️ Risco: Mistura financeira detectada</p>
              <p className="text-sm text-red-600 leading-relaxed">
                Misturar dinheiro pessoal com o do negócio é um dos principais motivos de falência de pequenas empresas no Brasil. Você não consegue saber se o negócio dá lucro de verdade, e pode ter problemas com a Receita Federal. Abra uma conta PJ separada — a maioria dos bancos digitais oferece isso gratuitamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card de Lucro Líquido — destaque principal */}
      <div className="net-profit-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
              Lucro Líquido do Mês
            </p>
            <p className="text-white/70 text-xs">O que vai para o seu bolso</p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${netProfitPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            {netProfitPositive ? '▲ Positivo' : '▼ Negativo'}
          </div>
        </div>
        <p className={`text-3xl font-black tracking-tight ${netProfitPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatBRL(metrics.netProfit)}
        </p>
        <p className={`text-sm mt-1 font-medium ${netProfitPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          Margem líquida: {metrics.netMargin.toFixed(1)}%
        </p>

        {/* Métricas auxiliares */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="metric-card">
            <p className="text-amber-400/70 text-xs mb-1">Lucro Bruto</p>
            <p className="text-white font-bold text-sm">{formatBRL(metrics.grossProfit)}</p>
            <p className="text-amber-400/50 text-xs">{metrics.grossMargin.toFixed(1)}%</p>
          </div>
          <div className="metric-card">
            <p className="text-amber-400/70 text-xs mb-1">EBITDA</p>
            <p className="text-white font-bold text-sm">{formatBRL(metrics.ebitda)}</p>
            <p className="text-white/40 text-xs">
              {financialData.revenue > 0 ? ((metrics.ebitda / financialData.revenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo do diagnóstico */}
      <div className="card p-6">
        <div className="diagnosis-content" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>

      {/* ── Projeção 30 dias ── */}
      {(() => {
        const p = projection;
        const statusMap = {
          green:  { bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700',  label: 'Saldo positivo',    icon: '🟢' },
          yellow: { bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-400',   text: 'text-amber-700',    label: 'Atenção',           icon: '🟡' },
          red:    { bg: 'bg-red-50',      border: 'border-red-200',     dot: 'bg-red-500',     text: 'text-red-700',      label: 'Caixa negativo',    icon: '🔴' },
        };
        const s = statusMap[p.status];

        return (
          <div className="card p-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Projeção dos próximos 30 dias</h3>
                <p className="text-xs text-slate-400">Com base nos dados do mês atual</p>
              </div>
            </div>

            {/* Semáforo + valor */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg} border ${s.border}`}>
                <div className={`w-5 h-5 rounded-full ${s.dot}`} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className={`text-2xl font-black tracking-tight ${s.text}`}>{formatBRL(p.projected)}</p>
                <p className="text-xs text-slate-400">saldo projetado</p>
              </div>
            </div>

            {/* Frase explicativa */}
            <div className={`rounded-xl p-3 mb-4 ${s.bg} border ${s.border}`}>
              <p className={`text-sm leading-relaxed ${s.text}`}>{p.sentence}</p>
            </div>

            {/* Breakdown da conta */}
            <div className="space-y-1.5 text-xs">
              <p className="text-slate-400 font-semibold uppercase tracking-wider mb-2">Como calculamos</p>
              {[
                { label: '(+) Caixa atual',      value: p.cash,     sign: '+' },
                { label: '(+) Receita do mês',   value: p.revenue,  sign: '+' },
                { label: '(−) Gastos fixos',      value: p.fixed,    sign: '−' },
                { label: '(−) Dívidas/parcelas',  value: p.debt,     sign: '−' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={`font-semibold tabular-nums ${row.sign === '−' ? 'text-slate-500' : 'text-slate-700'}`}>
                    {row.sign === '−' ? '−' : '+'} {formatBRL(row.value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1.5">
                <span className="font-bold text-slate-700">= Projeção 30 dias</span>
                <span className={`font-black tabular-nums ${s.text}`}>{formatBRL(p.projected)}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Exportações */}
      <div className="export-section">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar relatório
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => downloadPDF(businessData, diagnosis, renderedHtml, healthStatus)}
            className="btn-pdf text-sm py-3"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Baixar PDF
            </span>
          </button>
          <button
            onClick={() => downloadDRE(businessData, financialData)}
            className="btn-excel text-sm py-3"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-4.5h-17.25m17.25 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" />
              </svg>
              DRE Excel
            </span>
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <button
        onClick={() => {
          const msg = buildWhatsAppMessage(businessData, financialData, diagnosis, metrics, healthStatus);
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        }}
        className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white
                   flex items-center justify-center gap-2.5
                   active:scale-[0.98] transition-all duration-150"
        style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' }}
      >
        {/* WhatsApp logo SVG */}
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Compartilhar no WhatsApp
      </button>

      {/* Ações principais */}
      <div className="space-y-3">
        <button onClick={onOpenTracking} className="btn-primary">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Acompanhamento mensal
          </span>
        </button>
        <button onClick={onOpenChat} className="btn-secondary">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Tirar dúvidas com o consultor IA
          </span>
        </button>
        <button onClick={onRestart} className="btn-secondary">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Novo diagnóstico
          </span>
        </button>
      </div>

      <p className="text-center text-white/25 text-xs pb-4">
        FinCheck — diagnóstico em linguagem de dono
      </p>
    </div>
  );
}
