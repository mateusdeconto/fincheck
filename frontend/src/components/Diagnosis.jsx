import { useMemo } from 'react';

/**
 * Converte o texto markdown simples do diagnóstico em HTML para renderização
 * Suporta: ## cabeçalhos, **negrito**, • listas, parágrafos
 */
function renderMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Cabeçalho H2
    if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      const content = trimmed.slice(3);
      html += `<h2>${escapeHtml(content)}</h2>`;
      continue;
    }

    // Item de lista (começa com • ou -)
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      const content = applyInlineMarkdown(trimmed.slice(2));
      html += `<li>${content}</li>`;
      continue;
    }

    // Linha em branco
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }

    // Parágrafo normal
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p>${applyInlineMarkdown(trimmed)}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}

function applyInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Extrai o status de saúde financeira do texto do diagnóstico
 */
function extractHealthStatus(text) {
  if (!text) return null;
  if (text.includes('✅ Saudável') || text.includes('Saudável')) return { label: 'Saudável', color: 'bg-green-100 text-green-700', dot: '✅' };
  if (text.includes('🟢 Estável') || text.includes('Estável')) return { label: 'Estável', color: 'bg-emerald-100 text-emerald-700', dot: '🟢' };
  if (text.includes('🟡 Atenção') || text.includes('Atenção')) return { label: 'Atenção', color: 'bg-amber-100 text-amber-700', dot: '🟡' };
  if (text.includes('🔴 Crítica') || text.includes('Crítica')) return { label: 'Crítica', color: 'bg-red-100 text-red-700', dot: '🔴' };
  return null;
}

export default function Diagnosis({ businessData, diagnosis, onOpenChat, onRestart }) {
  const renderedHtml = useMemo(() => renderMarkdown(diagnosis), [diagnosis]);
  const healthStatus = useMemo(() => extractHealthStatus(diagnosis), [diagnosis]);

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Diagnóstico Financeiro</h1>
        <p className="text-navy-200 text-sm mt-1">{businessData.businessName}</p>
      </div>

      {/* Badge de saúde (se encontrado) */}
      {healthStatus && (
        <div className="flex justify-center">
          <span className={`health-tag ${healthStatus.color}`}>
            {healthStatus.dot} Saúde Financeira: {healthStatus.label}
          </span>
        </div>
      )}

      {/* Conteúdo do diagnóstico */}
      <div className="card p-6">
        <div
          className="diagnosis-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {/* Ações */}
      <div className="space-y-3">
        <button onClick={onOpenChat} className="btn-primary">
          💬 Tirar dúvidas sobre meus números
        </button>
        <button onClick={onRestart} className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
          🔄 Fazer novo diagnóstico
        </button>
      </div>

      <p className="text-center text-navy-300 text-xs pb-4">
        FinCheck — diagnóstico em linguagem de dono
      </p>
    </div>
  );
}
