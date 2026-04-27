import { useMemo, useState } from 'react';
import { calcMetrics, formatBRL } from '../lib/metrics.js';

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
  if (text.includes('✅ Saudável') || text.includes('Saudável')) return { label: 'Saudável',            color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: '✅' };
  if (text.includes('🟢 Estável') || text.includes('Estável'))   return { label: 'Estável',             color: 'bg-teal-50 text-teal-700 border border-teal-200',          dot: '🟢' };
  if (text.includes('🟡 Atenção') || text.includes('Atenção'))   return { label: 'Atenção necessária',  color: 'bg-amber-50 text-amber-700 border border-amber-200',       dot: '🟡' };
  if (text.includes('🔴 Crítica') || text.includes('Crítica'))   return { label: 'Situação crítica',    color: 'bg-red-50 text-red-700 border border-red-200',             dot: '🔴' };
  return null;
}

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
    `Análise completa em: ${typeof window !== 'undefined' ? window.location.origin : ''}`,
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
  const status = projected < 0 ? 'red' : projected < fixed ? 'yellow' : 'green';
  const coverageDays = dailyCost > 0 && projected > 0 ? Math.floor(projected / dailyCost) : 0;

  let sentence;
  if (status === 'green') {
    sentence = `No ritmo atual, você vai encerrar o mês com ${formatBRL(projected)} no caixa — suficiente para cobrir aproximadamente ${coverageDays} dias de operação.`;
  } else if (status === 'yellow') {
    sentence = `Caixa vai ficar positivo (${formatBRL(projected)}), mas abaixo de um mês de custos fixos. Qualquer imprevisto pode comprometer as contas.`;
  } else {
    sentence = `Atenção: no ritmo atual, seu caixa ficará ${formatBRL(projected)} no vermelho. Será preciso cortar custos ou buscar receita extra para fechar o mês.`;
  }

  return { projected, coverageDays, status, sentence, cash, revenue, fixed, debt };
}

// ─── DRE em Excel ──────────────────────────────────────────────────────────
async function downloadDRE(businessData, financialData) {
  const ExcelJS = (await import('exceljs')).default;
  const m = calcMetrics(financialData);
  const now = new Date().toLocaleDateString('pt-BR');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'FinCheck';
  wb.created = new Date();

  const ws = wb.addWorksheet('DRE', { views: [{ showGridLines: false }] });
  ws.columns = [{ width: 50 }, { width: 22 }, { width: 22 }];

  const styleTitle = {
    font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2620' } },
    alignment: { horizontal: 'left', vertical: 'middle', indent: 1 },
  };
  const styleSection = {
    font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFD6612A' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF3EC' } },
  };
  const styleTotal = {
    font: { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1A1814' } },
    border: { top: { style: 'thin', color: { argb: 'FF8A8273' } } },
  };
  const styleMoney = { numFmt: '"R$" #,##0.00' };
  const styleMoneyBold = { numFmt: '"R$" #,##0.00', font: { bold: true } };
  const stylePct = { font: { italic: true, color: { argb: 'FF5B5547' } } };

  function addRow([a, b, c], opts = {}) {
    const row = ws.addRow([a, b, c]);
    if (opts.titleStyle) {
      row.height = 28;
      row.eachCell((cell) => { Object.assign(cell, styleTitle); });
      ws.mergeCells(`A${row.number}:C${row.number}`);
    }
    if (opts.section) {
      row.eachCell((cell) => { Object.assign(cell, styleSection); });
    }
    if (opts.money) row.getCell(2).style = { ...row.getCell(2).style, ...styleMoney };
    if (opts.moneyBold) row.getCell(2).style = { ...row.getCell(2).style, ...styleMoneyBold };
    if (opts.pct) row.getCell(3).style = { ...row.getCell(3).style, ...stylePct };
    if (opts.total) row.eachCell((cell) => { Object.assign(cell, styleTotal); });
    return row;
  }

  addRow([`DRE — ${businessData.businessName}`, '', ''], { titleStyle: true });
  ws.addRow([]);
  addRow([`Segmento: ${businessData.segment}`, `Gerado em: ${now}`, '']);
  ws.addRow([]);

  addRow(['RECEITAS', '', ''], { section: true });
  addRow(['(+) Receita Bruta', m.revenue, ''], { money: true });
  ws.addRow([]);

  addRow(['CUSTOS DIRETOS', '', ''], { section: true });
  addRow(['(−) CMV — Custo das Vendas', m.cogs, ''], { money: true });
  ws.addRow([]);
  addRow(['= LUCRO BRUTO', m.grossProfit, `Margem: ${m.grossMargin.toFixed(1)}%`], { moneyBold: true, pct: true, total: true });
  ws.addRow([]);

  addRow(['DESPESAS FIXAS OPERACIONAIS', '', ''], { section: true });
  if (financialData.fixedExpensesItems?.length) {
    financialData.fixedExpensesItems.forEach(i => addRow([`    • ${i.desc}`, i.value, ''], { money: true }));
  } else {
    addRow(['    (sem detalhamento)', m.fixedExpenses, ''], { money: true });
  }
  addRow(['  Subtotal', m.fixedExpenses, ''], { moneyBold: true });
  ws.addRow([]);
  addRow(['= EBITDA / Resultado Operacional', m.ebitda, `Margem: ${(m.revenue > 0 ? (m.ebitda / m.revenue) * 100 : 0).toFixed(1)}%`], { moneyBold: true, pct: true, total: true });
  ws.addRow([]);

  if (m.debtPayment > 0) {
    addRow(['DÍVIDAS / FINANCIAMENTOS', '', ''], { section: true });
    if (financialData.debtPaymentItems?.length) {
      financialData.debtPaymentItems.forEach(i => addRow([`    • ${i.desc}`, i.value, ''], { money: true }));
    } else {
      addRow(['    (sem detalhamento)', m.debtPayment, ''], { money: true });
    }
    addRow(['  Subtotal', m.debtPayment, ''], { moneyBold: true });
    ws.addRow([]);
  }

  if (m.investments > 0) {
    addRow(['(−) Investimentos na Empresa', m.investments, ''], { money: true });
    ws.addRow([]);
  }

  addRow(['= LUCRO LÍQUIDO (vai pro seu bolso)', m.netProfit, `Margem: ${m.netMargin.toFixed(1)}%`], { moneyBold: true, pct: true, total: true });
  ws.addRow([]);

  addRow(['OUTROS INDICADORES', '', ''], { section: true });
  addRow(['Saldo de Caixa Atual', m.cashBalance, ''], { money: true });
  addRow(['Contas a Receber', m.accountsReceivable, ''], { money: true });
  addRow(['Ponto de Equilíbrio', m.breakEven, 'Faturamento mínimo p/ não ter prejuízo'], { money: true, pct: true });
  ws.addRow([]);

  ws.addRow(['Gerado pelo FinCheck']);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DRE_${businessData.businessName.replace(/\s+/g, '_')}_${now.replace(/\//g, '-')}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── PDF gerado direto no client (sem print dialog) ────────────────────────
async function downloadPDF(businessData, diagnosis, renderedHtml, healthStatus, metrics) {
  const html2pdf = (await import('html2pdf.js')).default;
  const now = new Date().toLocaleDateString('pt-BR');

  const badgeHtml = healthStatus
    ? `<div class="badge">${healthStatus.dot} Saúde Financeira: ${healthStatus.label}</div>`
    : '';

  // Container offscreen — html2pdf renderiza esse elemento
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:white;';
  container.innerHTML = `
    <style>
      .fc-pdf { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 48px; color: #2a2620; background: white; }
      .fc-pdf * { box-sizing: border-box; }
      .fc-pdf .header { border-bottom: 2px solid #d6612a; padding-bottom: 18px; margin-bottom: 22px; }
      .fc-pdf .logo { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #d6612a; margin-bottom: 6px; }
      .fc-pdf h1 { font-size: 28px; font-weight: 800; color: #1a1814; margin: 0 0 4px; }
      .fc-pdf .meta { font-size: 13px; color: #5b5547; }
      .fc-pdf .badge { display: inline-block; margin-top: 10px; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; background: #fdf3ec; color: #8d3a1a; border: 1px solid #fae0d0; }
      .fc-pdf .summary { display: flex; gap: 12px; margin: 18px 0 24px; }
      .fc-pdf .summary-card { flex: 1; background: #f8f6f1; border: 1px solid #e3ddd0; border-radius: 8px; padding: 12px; }
      .fc-pdf .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #8a8273; font-weight: 600; }
      .fc-pdf .summary-card .value { font-size: 18px; font-weight: 800; color: #1a1814; margin-top: 4px; }
      .fc-pdf h2 { font-size: 15px; font-weight: 700; color: #d6612a; margin: 22px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #e3ddd0; }
      .fc-pdf p { font-size: 13px; line-height: 1.65; color: #3f3a30; margin: 0 0 9px; }
      .fc-pdf ul { margin: 0 0 12px; padding: 0; list-style: none; }
      .fc-pdf li { font-size: 13px; line-height: 1.65; color: #3f3a30; padding: 3px 0 3px 14px; position: relative; }
      .fc-pdf li::before { content: '•'; position: absolute; left: 0; color: #d6612a; font-weight: 700; }
      .fc-pdf strong { font-weight: 700; color: #1a1814; }
      .fc-pdf .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e3ddd0; font-size: 11px; color: #8a8273; text-align: center; }
    </style>
    <div class="fc-pdf">
      <div class="header">
        <div class="logo">FinCheck — Diagnóstico Financeiro</div>
        <h1>${escapeHtml(businessData.businessName)}</h1>
        <div class="meta">${escapeHtml(businessData.segment)} &nbsp;·&nbsp; Gerado em ${now}</div>
        ${badgeHtml}
      </div>
      ${metrics ? `
      <div class="summary">
        <div class="summary-card"><div class="label">Lucro Líquido</div><div class="value">${formatBRL(metrics.netProfit)}</div></div>
        <div class="summary-card"><div class="label">Margem Líquida</div><div class="value">${metrics.netMargin.toFixed(1)}%</div></div>
        <div class="summary-card"><div class="label">Saldo em Caixa</div><div class="value">${formatBRL(metrics.cashBalance)}</div></div>
      </div>` : ''}
      <div class="content">${renderedHtml}</div>
      <div class="footer">Gerado pelo FinCheck — diagnóstico financeiro para pequenas empresas brasileiras</div>
    </div>
  `;
  document.body.appendChild(container);

  const fileName = `Diagnostico_${businessData.businessName.replace(/\s+/g, '_')}_${now.replace(/\//g, '-')}.pdf`;

  try {
    await html2pdf()
      .set({
        margin:       [10, 10, 10, 10],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container.querySelector('.fc-pdf'))
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

export default function Diagnosis({ businessData, financialData, diagnosis, onOpenChat, onOpenTracking, onRestart }) {
  const renderedHtml  = useMemo(() => renderMarkdown(diagnosis),      [diagnosis]);
  const healthStatus  = useMemo(() => extractHealthStatus(diagnosis), [diagnosis]);
  const metrics       = useMemo(() => calcMetrics(financialData),     [financialData]);
  const projection    = useMemo(() => calcProjection(financialData, metrics), [financialData, metrics]);
  const [exporting, setExporting] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  const netProfitPositive = metrics.netProfit >= 0;

  async function handleExcel() {
    setExporting(true);
    try { await downloadDRE(businessData, financialData); }
    catch (e) { console.error(e); alert('Erro ao gerar Excel. Tente novamente.'); }
    finally { setExporting(false); }
  }

  async function handlePDF() {
    setPdfExporting(true);
    try { await downloadPDF(businessData, diagnosis, renderedHtml, healthStatus, metrics); }
    catch (e) { console.error(e); alert('Erro ao gerar PDF. Tente novamente.'); }
    finally { setPdfExporting(false); }
  }

  const statusMap = {
    green:  { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Saldo positivo' },
    yellow: { bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Atenção' },
    red:    { bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500',     text: 'text-red-700',     label: 'Caixa negativo' },
  };
  const s = statusMap[projection.status];

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header */}
      <div className="text-center mb-1">
        <p className="eyebrow mb-2">Diagnóstico financeiro</p>
        <h1 className="font-display text-3xl font-semibold text-ink-800 tracking-tighter">
          {businessData.businessName}
        </h1>
        <p className="text-ink-400 text-sm mt-1 capitalize">{businessData.segment}</p>
      </div>

      {/* Badge de saúde */}
      {healthStatus && (
        <div className="flex justify-center">
          <span className={`health-tag ${healthStatus.color}`}>
            {healthStatus.dot} Saúde Financeira: {healthStatus.label}
          </span>
        </div>
      )}

      {/* Alerta: mistura financeira */}
      {financialData.mixedAccounts && (
        <div className="rounded-2xl p-5 border border-red-200 bg-gradient-to-br from-red-50 to-amber-50">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-700 mb-1">⚠ Risco: mistura financeira detectada</p>
              <p className="text-sm text-red-600 leading-relaxed">
                Misturar dinheiro pessoal com o do negócio é uma das principais causas de falência de pequenas empresas no Brasil.
                Você não consegue saber se o negócio dá lucro de verdade, e pode ter problemas com a Receita.
                Abra uma conta PJ separada — a maioria dos bancos digitais oferece gratuitamente.
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
              Lucro líquido do mês
            </p>
            <p className="text-white/70 text-xs">O que vai para o seu bolso</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${netProfitPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            {netProfitPositive ? '▲ Positivo' : '▼ Negativo'}
          </div>
        </div>
        <p className={`text-[2.25rem] font-bold tracking-tighter font-mono ${netProfitPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatBRL(metrics.netProfit)}
        </p>
        <p className={`text-sm mt-1 font-medium ${netProfitPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          Margem líquida: {metrics.netMargin.toFixed(1)}%
        </p>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <div className="metric-card">
            <p className="text-accent-300/80 text-[11px] mb-1 uppercase tracking-wider font-semibold">Lucro Bruto</p>
            <p className="text-white font-bold text-sm font-mono">{formatBRL(metrics.grossProfit)}</p>
            <p className="text-accent-300/50 text-xs">{metrics.grossMargin.toFixed(1)}%</p>
          </div>
          <div className="metric-card">
            <p className="text-accent-300/80 text-[11px] mb-1 uppercase tracking-wider font-semibold">EBITDA</p>
            <p className="text-white font-bold text-sm font-mono">{formatBRL(metrics.ebitda)}</p>
            <p className="text-white/40 text-xs">
              {financialData.revenue > 0 ? ((metrics.ebitda / financialData.revenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo do diagnóstico */}
      <div className="card p-6 sm:p-7">
        <div className="diagnosis-content" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>

      {/* Projeção 30 dias */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-800 leading-tight">Projeção dos próximos 30 dias</h3>
            <p className="text-xs text-ink-400">Com base nos dados do mês atual</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg} border ${s.border}`}>
            <div className={`w-5 h-5 rounded-full ${s.dot}`} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-0.5">{s.label}</p>
            <p className={`text-2xl font-bold tracking-tighter font-mono ${s.text}`}>{formatBRL(projection.projected)}</p>
            <p className="text-xs text-ink-400">saldo projetado</p>
          </div>
        </div>

        <div className={`rounded-xl p-3 mb-4 ${s.bg} border ${s.border}`}>
          <p className={`text-sm leading-relaxed ${s.text}`}>{projection.sentence}</p>
        </div>

        <div className="space-y-1 text-xs">
          <p className="text-ink-400 font-semibold uppercase tracking-wider mb-2">Como calculamos</p>
          {[
            { label: '(+) Caixa atual',     value: projection.cash,     sign: '+' },
            { label: '(+) Receita do mês',  value: projection.revenue,  sign: '+' },
            { label: '(−) Gastos fixos',    value: projection.fixed,    sign: '−' },
            { label: '(−) Dívidas/parcelas',value: projection.debt,     sign: '−' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-ink-100">
              <span className="text-ink-500">{row.label}</span>
              <span className={`font-semibold tabular-nums font-mono ${row.sign === '−' ? 'text-ink-500' : 'text-ink-700'}`}>
                {row.sign === '−' ? '−' : '+'} {formatBRL(row.value)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-ink-700">= Projeção 30 dias</span>
            <span className={`font-bold tabular-nums font-mono ${s.text}`}>{formatBRL(projection.projected)}</span>
          </div>
        </div>
      </div>

      {/* Exportações */}
      <div className="export-section">
        <p className="eyebrow-muted mb-3 flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar relatório
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handlePDF} disabled={pdfExporting} className="btn-pdf disabled:opacity-50">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {pdfExporting ? 'Gerando…' : 'Baixar PDF'}
            </span>
          </button>
          <button onClick={handleExcel} disabled={exporting} className="btn-excel disabled:opacity-50">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125" />
              </svg>
              {exporting ? 'Gerando…' : 'DRE Excel'}
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
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white text-[15px]
                   flex items-center justify-center gap-2.5
                   active:scale-[0.985] transition-all duration-150 shadow-soft"
        style={{ background: 'linear-gradient(180deg, #25d366 0%, #128c7e 100%)' }}
      >
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
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
        <button onClick={onRestart} className="btn-back">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Novo diagnóstico
          </span>
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 pb-4">
        FinCheck — diagnóstico em linguagem de dono
      </p>
    </div>
  );
}
