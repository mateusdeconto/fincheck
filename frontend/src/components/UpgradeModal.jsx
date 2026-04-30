const FEATURES = [
  { icon: '🤖', title: 'Consultor IA', desc: 'Tire dúvidas e simule cenários com IA treinada nos seus dados reais' },
  { icon: '📊', title: 'Histórico completo', desc: 'Acesse todos os diagnósticos anteriores e compare meses lado a lado' },
  { icon: '📅', title: 'Acompanhamento mensal', desc: 'Monitore a evolução do negócio mês a mês em um só lugar' },
  { icon: '📋', title: 'DRE comparativa', desc: 'Baixe DREs de múltiplos meses em um único arquivo Excel' },
  { icon: '🔮', title: 'Atualizações futuras', desc: 'Todas as novas funcionalidades incluídas sem custo adicional' },
];

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
        <div className="px-6 pb-6 space-y-3">
          <div className="w-full py-3 bg-ink-100 text-ink-400 text-sm font-semibold rounded-xl text-center cursor-default select-none">
            💳 Pagamento online em breve
          </div>
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
