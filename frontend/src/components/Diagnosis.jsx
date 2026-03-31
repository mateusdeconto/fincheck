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

export default function Diagnosis({ businessData, financialData, diagnosis, onOpenChat, onRestart }) {
  const renderedHtml = useMemo(() => renderMarkdown(diagnosis), [diagnosis]);
  const healthStatus = useMemo(() => extractHealthStatus(diagnosis), [diagnosis]);
  const metrics = useMemo(() => calcMetrics(financialData), [financialData]);

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

      {/* Ações principais */}
      <div className="space-y-3">
        <button onClick={onOpenChat} className="btn-primary">
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
