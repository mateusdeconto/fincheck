import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Formata BRL
function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);
}

// Constrói HTML do email
function buildEmailHtml({ businessData, financialData, diagnosis, metrics }) {
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const month = businessData.referenceMonth
    ? new Date(businessData.referenceMonth + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : date;

  // Converte markdown simples para HTML
  const diagHtml = (diagnosis || '')
    .split('\n')
    .map(line => {
      const t = line.trim();
      if (t.startsWith('## ')) return `<h3 style="color:#111827;font-size:15px;margin:20px 0 6px;">${t.slice(3)}</h3>`;
      if (t.startsWith('• ') || t.startsWith('- ')) return `<li style="color:#374151;font-size:14px;margin-bottom:4px;">${t.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`;
      if (!t) return '';
      return `<p style="color:#374151;font-size:14px;margin:6px 0;">${t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr><td style="background:#111827;padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="display:inline-flex;align-items:center;gap:8px;">
                  <span style="display:inline-block;width:28px;height:28px;background:#111827;border:1.5px solid #374151;border-radius:6px;text-align:center;line-height:28px;font-weight:bold;font-size:14px;color:#10b981;">F</span>
                  <span style="color:#ffffff;font-weight:700;font-size:16px;letter-spacing:-0.3px;">FinCheck</span>
                </span>
              </td>
              <td align="right">
                <span style="color:#6b7280;font-size:12px;">${date}</span>
              </td>
            </tr>
          </table>
          <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:16px 0 4px;letter-spacing:-0.5px;">
            Diagnóstico financeiro
          </h1>
          <p style="color:#9ca3af;font-size:14px;margin:0;">${businessData.businessName} · ${businessData.segment} · ${month}</p>
        </td></tr>

        <!-- Métricas principais -->
        <tr><td style="padding:28px 32px 0;">
          <p style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 16px;">Resumo do mês</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:16px;border-right:1px solid #e5e7eb;text-align:center;">
                <p style="font-size:11px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;">Receita</p>
                <p style="font-size:18px;font-weight:700;color:#111827;margin:0;font-variant-numeric:tabular-nums;">${fmt(financialData.revenue)}</p>
              </td>
              <td style="padding:16px;border-right:1px solid #e5e7eb;text-align:center;">
                <p style="font-size:11px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;">Lucro líquido</p>
                <p style="font-size:18px;font-weight:700;color:${metrics.netProfit >= 0 ? '#10b981' : '#ef4444'};margin:0;font-variant-numeric:tabular-nums;">${fmt(metrics.netProfit)}</p>
              </td>
              <td style="padding:16px;text-align:center;">
                <p style="font-size:11px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;">Margem líquida</p>
                <p style="font-size:18px;font-weight:700;color:#111827;margin:0;">${metrics.netMargin.toFixed(1)}%</p>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;" width="50%">
                <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;">Caixa atual</p>
                <p style="font-size:16px;font-weight:700;color:#111827;margin:0;font-variant-numeric:tabular-nums;">${fmt(financialData.cashBalance)}</p>
              </td>
              <td width="8px"></td>
              <td style="padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;" width="50%">
                <p style="font-size:11px;color:#6b7280;margin:0 0 2px;text-transform:uppercase;">Ponto de equilíbrio</p>
                <p style="font-size:16px;font-weight:700;color:#111827;margin:0;font-variant-numeric:tabular-nums;">${fmt(metrics.breakEven)}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Diagnóstico -->
        <tr><td style="padding:28px 32px 0;">
          <p style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 16px;">Diagnóstico completo</p>
          <div style="font-size:14px;color:#374151;line-height:1.6;">${diagHtml}</div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:28px 32px;border-top:1px solid #f3f4f6;margin-top:24px;">
          <p style="font-size:12px;color:#9ca3af;margin:0 0 4px;">Este relatório foi gerado automaticamente pelo FinCheck.</p>
          <p style="font-size:12px;color:#9ca3af;margin:0;">Dúvidas? Responda este e-mail ou acesse <a href="https://fincheck-production-94bb.up.railway.app" style="color:#6b7280;">fincheck-production-94bb.up.railway.app</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

router.post('/', async (req, res) => {
  const { toEmail, businessData, financialData, diagnosis, metrics } = req.body;

  if (!toEmail || !businessData || !financialData || !diagnosis) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error('[email] GMAIL_USER ou GMAIL_APP_PASSWORD não configurados');
    return res.status(503).json({ error: 'Serviço de e-mail não configurado.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log('[email] verificando conexão SMTP...');
    await transporter.verify();
    console.log('[email] SMTP ok, enviando para:', toEmail);

    const month = businessData.referenceMonth
      ? new Date(businessData.referenceMonth + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    await transporter.sendMail({
      from: `FinCheck <${gmailUser}>`,
      to: toEmail,
      subject: `Diagnóstico financeiro — ${businessData.businessName} · ${month}`,
      html: buildEmailHtml({ businessData, financialData, diagnosis, metrics }),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[email] erro ao enviar:', err.message);
    res.status(500).json({ error: 'Falha ao enviar e-mail. Tente novamente.' });
  }
});

export default router;
