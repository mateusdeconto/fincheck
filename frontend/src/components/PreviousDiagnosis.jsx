function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-money-500 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7 5 V19 M7 5 H17" stroke="white" strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 12 H15" stroke="white" strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </svg>
      </div>
      <span className="font-bold text-ink-800 text-[15px] tracking-tight">FinCheck</span>
    </div>
  );
}

export default function PreviousDiagnosis({ record, onView, onNew, onHistory, onLogout }) {
  const date = new Date(record.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Logo />
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-semibold text-ink-500 bg-white border border-ink-200 rounded-xl hover:bg-ink-100 transition-colors"
          >
            Sair
          </button>
        )}
      </div>

      <div className="bg-white border border-ink-200 rounded-2xl p-7 shadow-card">
        {/* Ícone */}
        <div className="w-14 h-14 rounded-2xl bg-money-50 border border-money-200 flex items-center justify-center mb-5 mx-auto">
          <svg className="w-7 h-7 text-money-600" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-ink-900 text-center mb-1">
          Bem-vindo de volta!
        </h2>
        <p className="text-sm text-ink-400 text-center mb-6">
          Você tem um diagnóstico salvo.
        </p>

        {/* Preview do último diagnóstico */}
        <div className="bg-ink-50 border border-ink-200 rounded-xl p-4 mb-6">
          <p className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold mb-1.5">
            Último diagnóstico
          </p>
          <p className="text-base font-bold text-ink-800">{record.business_name}</p>
          <p className="text-sm text-ink-400 capitalize mt-0.5">{record.segment} · {date}</p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onView}
            className="w-full py-3 bg-money-500 hover:bg-money-600 text-white text-sm font-bold rounded-xl transition-all duration-150 shadow-money"
          >
            Ver diagnóstico salvo →
          </button>
          {onHistory && (
            <button
              onClick={onHistory}
              className="w-full py-3 border border-money-300 text-money-700 bg-money-50 hover:bg-money-100 text-sm font-semibold rounded-xl transition-all duration-150"
            >
              Ver histórico de análises
            </button>
          )}
          <button
            onClick={onNew}
            className="w-full py-3 border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-semibold rounded-xl transition-all duration-150"
          >
            Fazer nova análise
          </button>
        </div>
      </div>
    </div>
  );
}
