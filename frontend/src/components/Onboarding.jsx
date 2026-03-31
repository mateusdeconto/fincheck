import { useState } from 'react';

const SEGMENTS = [
  { value: 'restaurante', label: '🍽️ Restaurante / Alimentação' },
  { value: 'varejo', label: '🛍️ Varejo / Comércio' },
  { value: 'servicos', label: '🔧 Serviços' },
  { value: 'industria', label: '🏭 Indústria / Fabricação' },
  { value: 'outro', label: '💼 Outro' },
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">FinCheck</h1>
        <p className="text-navy-200 text-base">
          Descubra a saúde financeira do seu negócio em menos de 5 minutos
        </p>
      </div>

      {/* Card */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-navy-700 mb-1">Vamos começar!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Me conta um pouco sobre o seu negócio
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome do negócio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nome do negócio
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Padaria do João, Oficina Silva..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-navy-500
                         outline-none transition-colors text-slate-800 placeholder:text-slate-300 text-base"
              autoFocus
              maxLength={60}
            />
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Qual é o segmento?
            </label>
            <div className="space-y-2">
              {SEGMENTS.map((seg) => (
                <button
                  key={seg.value}
                  type="button"
                  onClick={() => setSegment(seg.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm font-medium
                    ${segment === seg.value
                      ? 'border-navy-600 bg-navy-50 text-navy-700'
                      : 'border-slate-200 text-slate-600 hover:border-navy-300 hover:bg-slate-50'
                    }`}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canProceed}
            className="btn-primary mt-2"
          >
            Começar diagnóstico →
          </button>
        </form>
      </div>

      <p className="text-center text-navy-300 text-xs mt-4">
        Seus dados ficam apenas no seu dispositivo
      </p>
    </div>
  );
}
