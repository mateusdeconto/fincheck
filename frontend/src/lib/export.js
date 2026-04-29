import { calcMetrics, formatBRL } from './metrics.js';

export function formatReferenceMonth(referenceMonth) {
  if (!referenceMonth) return new Date().toLocaleDateString('pt-BR');
  const [year, month] = referenceMonth.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function applyInlineMarkdown(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function stripLeadingEmoji(text) {
  return text.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️]+\s*/u, '');
}

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
    if (!trimmed) { if (inList) { html += '</ul>'; inList = false; } continue; }
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p>${applyInlineMarkdown(trimmed)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

function extractHealthStatus(text) {
  if (!text) return null;
  if (text.includes('Saudável')) return { label: 'Saudável' };
  if (text.includes('Estável'))  return { label: 'Estável' };
  if (text.includes('Atenção'))  return { label: 'Atenção' };
  if (text.includes('Crítica'))  return { label: 'Crítica' };
  return null;
}

// ─── DRE em Excel ─────────────────────────────────────────────────────────
export async function downloadDRE(entries, filename) {
  const ExcelJS = (await import('exceljs')).default;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'FinCheck';
  wb.created = new Date();

  for (const entry of entries) {
    const m = calcMetrics(entry.fData);
    const sheetName = entry.sheetLabel.slice(0, 31);
    const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 50 }, { width: 22 }, { width: 22 }];

    const styleTitle    = { font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2433' } }, alignment: { horizontal: 'left', vertical: 'middle', indent: 1 } };
    const styleSection  = { font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF2C5DEB' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } } };
    const styleTotal    = { font: { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF13172A' } }, border: { top: { style: 'thin', color: { argb: 'FF7A8294' } } } };
    const styleMoney    = { numFmt: '"R$" #,##0.00' };
    const styleMoneyBold = { numFmt: '"R$" #,##0.00', font: { bold: true } };
    const stylePct      = { font: { italic: true, color: { argb: 'FF535B6E' } } };

    function addRow([a, b, c], opts = {}) {
      const row = ws.addRow([a, b, c]);
      if (opts.titleStyle) { row.height = 28; row.eachCell(cell => { Object.assign(cell, styleTitle); }); ws.mergeCells(`A${row.number}:C${row.number}`); }
      if (opts.section)   row.eachCell(cell => { Object.assign(cell, styleSection); });
      if (opts.money)     row.getCell(2).style = { ...row.getCell(2).style, ...styleMoney };
      if (opts.moneyBold) row.getCell(2).style = { ...row.getCell(2).style, ...styleMoneyBold };
      if (opts.pct)       row.getCell(3).style = { ...row.getCell(3).style, ...stylePct };
      if (opts.total)     row.eachCell(cell => { Object.assign(cell, styleTotal); });
      return row;
    }

    addRow([`DRE — ${entry.businessName}`, '', ''], { titleStyle: true });
    ws.addRow([]);
    addRow([`Segmento: ${entry.segment}`, entry.sheetLabel, '']);
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
    if (entry.fData.fixedExpensesItems?.length) {
      entry.fData.fixedExpensesItems.forEach(i => addRow([`    • ${i.desc}`, i.value, ''], { money: true }));
    } else {
      addRow(['    (sem detalhamento)', m.fixedExpenses, ''], { money: true });
    }
    addRow(['  Subtotal', m.fixedExpenses, ''], { moneyBold: true });
    ws.addRow([]);
    addRow(['= EBITDA', m.ebitda, `Margem: ${(m.revenue > 0 ? (m.ebitda / m.revenue) * 100 : 0).toFixed(1)}%`], { moneyBold: true, pct: true, total: true });
    ws.addRow([]);

    if (m.debtPayment > 0) {
      addRow(['DÍVIDAS / FINANCIAMENTOS', '', ''], { section: true });
      if (entry.fData.debtPaymentItems?.length) {
        entry.fData.debtPaymentItems.forEach(i => addRow([`    • ${i.desc}`, i.value, ''], { money: true }));
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

    addRow(['= LUCRO LÍQUIDO', m.netProfit, `Margem: ${m.netMargin.toFixed(1)}%`], { moneyBold: true, pct: true, total: true });
    ws.addRow([]);
    addRow(['OUTROS INDICADORES', '', ''], { section: true });
    addRow(['Saldo de Caixa', m.cashBalance, ''], { money: true });
    addRow(['Contas a Receber', m.accountsReceivable, ''], { money: true });
    addRow(['Ponto de Equilíbrio', m.breakEven, 'Faturamento mínimo'], { money: true, pct: true });
    ws.addRow([]);
    ws.addRow(['Gerado pelo FinCheck']);
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Converte um record do Supabase num entry para downloadDRE
export function recordToEntry(record) {
  const refMonth = record.financial_data?.referenceMonth;
  const label = refMonth
    ? formatReferenceMonth(refMonth)
    : new Date(record.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return {
    sheetLabel: label,
    businessName: record.business_name,
    segment: record.segment,
    fData: record.financial_data,
  };
}

// Converte businessData + financialData atuais num entry para downloadDRE
export function currentToEntry(businessData, financialData) {
  const refMonth = businessData.referenceMonth || financialData?.referenceMonth;
  const label = refMonth ? formatReferenceMonth(refMonth) : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return {
    sheetLabel: label,
    businessName: businessData.businessName,
    segment: businessData.segment,
    fData: financialData,
  };
}

// ─── PDF ──────────────────────────────────────────────────────────────────
export async function downloadPDF(businessData, diagnosisText, financialData) {
  const html2pdf = (await import('html2pdf.js')).default;
  const m = calcMetrics(financialData);
  const healthStatus = extractHealthStatus(diagnosisText);
  const renderedHtml = renderMarkdown(diagnosisText);
  const refMonth = businessData.referenceMonth || financialData?.referenceMonth;
  const dateLabel = refMonth ? formatReferenceMonth(refMonth) : new Date().toLocaleDateString('pt-BR');

  const badgeHtml = healthStatus
    ? `<div class="badge">Saúde Financeira: ${healthStatus.label}</div>`
    : '';

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:white;';
  container.innerHTML = `
    <style>
      .fc-pdf { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 48px; color: #13172a; background: white; }
      .fc-pdf * { box-sizing: border-box; }
      .fc-pdf .header { border-bottom: 2px solid #1f2433; padding-bottom: 18px; margin-bottom: 22px; }
      .fc-pdf .logo { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2c5deb; margin-bottom: 6px; }
      .fc-pdf h1 { font-size: 28px; font-weight: 800; color: #13172a; margin: 0 0 4px; letter-spacing: -0.022em; }
      .fc-pdf .meta { font-size: 13px; color: #535b6e; }
      .fc-pdf .badge { display: inline-block; margin-top: 10px; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #eef2ff; color: #1a3aa6; border: 1px solid #dbe5ff; }
      .fc-pdf .summary { display: flex; gap: 12px; margin: 18px 0 24px; }
      .fc-pdf .summary-card { flex: 1; background: #f7f8fa; border: 1px solid #dde0e6; border-radius: 8px; padding: 14px; }
      .fc-pdf .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #7a8294; font-weight: 600; }
      .fc-pdf .summary-card .value { font-size: 20px; font-weight: 800; color: #13172a; margin-top: 4px; font-family: ui-monospace, monospace; }
      .fc-pdf h2 { font-size: 15px; font-weight: 700; color: #13172a; margin: 22px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #dde0e6; }
      .fc-pdf p { font-size: 13px; line-height: 1.65; color: #363c4d; margin: 0 0 9px; }
      .fc-pdf ul { margin: 0 0 12px; padding: 0; list-style: none; }
      .fc-pdf li { font-size: 13px; line-height: 1.65; color: #363c4d; padding: 3px 0 3px 14px; position: relative; }
      .fc-pdf li::before { content: ''; position: absolute; left: 0; top: 11px; width: 4px; height: 4px; background: #2c5deb; border-radius: 50%; }
      .fc-pdf strong { font-weight: 700; color: #13172a; }
      .fc-pdf .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #dde0e6; font-size: 11px; color: #7a8294; text-align: center; }
    </style>
    <div class="fc-pdf">
      <div class="header">
        <div class="logo">FinCheck — Diagnóstico Financeiro</div>
        <h1>${escapeHtml(businessData.businessName)}</h1>
        <div class="meta">${escapeHtml(businessData.segment)} &nbsp;·&nbsp; ${escapeHtml(dateLabel)}</div>
        ${badgeHtml}
      </div>
      <div class="summary">
        <div class="summary-card"><div class="label">Lucro Líquido</div><div class="value">${formatBRL(m.netProfit)}</div></div>
        <div class="summary-card"><div class="label">Margem Líquida</div><div class="value">${m.netMargin.toFixed(1)}%</div></div>
        <div class="summary-card"><div class="label">Caixa</div><div class="value">${formatBRL(m.cashBalance)}</div></div>
      </div>
      <div class="content">${renderedHtml}</div>
      <div class="footer">Gerado pelo FinCheck — diagnóstico financeiro para pequenas empresas brasileiras</div>
    </div>
  `;
  document.body.appendChild(container);

  const safeName = businessData.businessName.replace(/\s+/g, '_');
  const safeDate = dateLabel.replace(/\s+/g, '_');
  const fileName = `Diagnostico_${safeName}_${safeDate}.pdf`;

  try {
    await html2pdf()
      .set({
        margin:      [10, 10, 10, 10],
        filename:    fileName,
        image:       { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container.querySelector('.fc-pdf'))
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
