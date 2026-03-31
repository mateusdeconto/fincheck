import { useState } from 'react';

const SEGMENTS = [
  { value: 'restaurante', label: 'Restaurante / Alimentação', icon: '🍽️' },
  { value: 'varejo', label: 'Varejo / Comércio', icon: '🛍️' },
  { value: 'servicos', label: 'Serviços', icon: '🔧' },
  { value: 'industria', label: 'Indústria / Fabricação', icon: '🏭' },
  { value: 'outro', label: 'Outro', icon: '💼' },
];

export default function Onboarding({ onComplete }) {
  const [businessName, setBusinessName] = useState('');
  const [segment, setSegment] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!businessName.trim() || !segment) return;
    onComplete({ businessName: businessName.trim(), segment });
  }

  const canProceed = businessName.trim().length > 0 && segment !== '';

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
             style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">FinCheck</h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
          Descubra a saúde financeira do seu negócio em menos de 5 minutos
        </p>
      </div>

      {/* Card */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Vamos começar!</h2>
          <p className="text-slate-400 text-sm">Conte um pouco sobre o seu negócio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome do negócio */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nome do negócio
            </label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Ex: Padaria do João, Oficina Silva..."
              className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200
                         focus:border-navy-500 focus:bg-navy-50/30
                         outline-none transition-all text-slate-800 placeholder:text-slate-300 text-sm font-medium"
              autoFocus
              maxLength={60}
            />
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Segmento
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SEGMENTS.map(seg => (
                <button
                  key={seg.value}
                  type="button"
                  onClick={() => setSegment(seg.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm font-medium
                              flex items-center gap-3
                    ${segment === seg.value
                      ? 'border-navy-500 bg-navy-50 text-navy-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-navy-300 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-base">{seg.icon}</span>
                  {seg.label}
                  {segment === seg.value && (
                    <svg className="ml-auto w-4 h-4 text-navy-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={!canProceed} className="btn-primary mt-2">
            <span className="flex items-center justify-center gap-2">
              Começar diagnóstico
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </button>
        </form>
      </div>

      <p className="text-center text-white/25 text-xs mt-4">
        Seus dados ficam apenas no seu dispositivo
      </p>
    </div>
  );
}
