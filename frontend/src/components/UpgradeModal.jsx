const FEATURES = [
  { icon: '🤖', title: 'Consultor IA', desc: 'Tire dúvidas e simule cenários com IA treinada nos seus dados reais' },
  { icon: '📊', title: 'Histórico completo', desc: 'Acesse todos os diagnósticos anteriores e compare meses lado a lado' },
  { icon: '📅', title: 'Acompanhamento mensal', desc: 'Monitore a evolução do negócio mês a mês em um só lugar' },
  { icon: '📋', title: 'DRE comparativa', desc: 'Baixe DREs de múltiplos meses em um único arquivo Excel' },
  { icon: '🔮', title: 'Atualizações futuras', desc: 'Todas as novas funcionalidades incluídas sem custo adicional' },
];

// Atualize esse número com o WhatsApp do seu negócio
const WHATSAPP_NUMBER = '5500000000000';
const WHATSAPP_MSG = encodeURIComponent('Olá! Quero assinar o FinCheck Pro.');

export default function UpgradeModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-ink-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-ink-900 px-6 py-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">FinCheck</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Versão Pro</h2>
          <p className="text-sm text-ink-300 mt-1">Tudo que você precisa para crescer com clareza</p>
        </div>

        {/* Features */}
        <div className="px-6 py-5 space-y-3.5">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink-800">{f.title}</p>
                <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-ink-900 text-white text-sm font-semibold rounded-xl hover:bg-ink-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Quero assinar o Pro
          </a>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
          >
            Continuar grátis
          </button>
        </div>
      </div>
    </div>
  );
}
