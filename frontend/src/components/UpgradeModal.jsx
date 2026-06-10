import { useState } from 'react';
import { trackEvent } from '../lib/analytics.js';

const ALL_PLANS = [
  {
    id: 'free',
    name: 'Grátis',
    prices: { trimestral: 'R$ 0', anual: 'R$ 0' },
    suffix: { trimestral: 'para sempre', anual: 'para sempre' },
    savings: null,
    tag: null,
    features: [
      '1 empresa',
      '1 diagnóstico total',
      'Relatório básico',
      'Exportação PDF',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    prices: { trimestral: 'R$ 49', anual: 'R$ 39' },
    suffix: { trimestral: '/mês', anual: '/mês' },
    savings: 'Economize R$ 120/ano',
    tag: null,
    features: [
      '1 empresa',
      '3 diagnósticos mensais',
      'Relatório + benchmarks SEBRAE',
      'DRE Excel e PDF',
      'Plano semanal (4x/mês)',
      'Histórico de análises',
      'Chat IA (limitado)',
    ],
  },
  {
    id: 'max',
    name: 'Max',
    prices: { trimestral: 'R$ 129', anual: 'R$ 119' },
    suffix: { trimestral: '/mês', anual: '/mês' },
    savings: 'Economize R$ 120/ano',
    tag: 'Melhor valor',
    features: [
      'Até 5 empresas',
      'Diagnósticos ilimitados',
      'Tudo do plano Pro',
      'Plano semanal (8x/mês)',
      'Chat IA com mais créditos',
      'Pode ou Não Pode',
      'Histórico ilimitado',
      'Todas as atualizações futuras',
    ],
  },
];

function CheckIcon({ gold }) {
  return (
    <svg
      className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${gold ? 'text-gold-400' : 'text-money-400'}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function UpgradeModal({ onClose, currentPlan = 'free' }) {
  const [period, setPeriod] = useState('trimestral');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(3,8,16,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: 'linear-gradient(160deg, #0e1e38 0%, #0a1628 60%, #080e1c 100%)', border: '1px solid rgba(255,255,255,0.10)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow decorativo */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] opacity-30"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.25) 0%, transparent 70%)' }}
        />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="relative z-10 pt-10 pb-5 px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-px" style={{ background: 'rgba(245,158,11,0.5)' }} />
            <StarIcon />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400/80">Planos</span>
            <StarIcon />
            <span className="w-6 h-px" style={{ background: 'rgba(245,158,11,0.5)' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            De Fôlego a{' '}
            <span className="text-gold-400">sua empresa</span>
          </h2>
          <p className="text-sm text-white/45 mt-2">
            Escolha o plano que melhor acompanha o crescimento do seu negócio.
          </p>
        </div>

        {/* Toggle período */}
        <div className="relative z-10 flex justify-center mb-5">
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <button
              onClick={() => setPeriod('trimestral')}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                period === 'trimestral'
                  ? { background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#080604' }
                  : { color: 'rgba(255,255,255,0.50)' }
              }
            >
              Trimestral
            </button>
            <button
              onClick={() => setPeriod('anual')}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                period === 'anual'
                  ? { background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#080604' }
                  : { color: 'rgba(255,255,255,0.50)' }
              }
            >
              Anual
              {period !== 'anual' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-money-500/20 text-money-400">
                  -20%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cards de planos */}
        <div className="relative z-10 px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALL_PLANS.map(p => {
            const isMax = p.id === 'max';
            const isCurrent = p.id === currentPlan;

            return (
              <div
                key={p.id}
                className="relative rounded-2xl flex flex-col"
                style={
                  isMax
                    ? {
                        background: 'linear-gradient(160deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)',
                        border: '1.5px solid rgba(245,158,11,0.55)',
                        boxShadow: '0 0 32px rgba(245,158,11,0.12)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }
                }
              >
                {p.tag && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-ink-900"
                    style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
                  >
                    <StarIcon />
                    {p.tag}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Nome + preço */}
                  <div className="mb-4">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isMax ? 'text-gold-400' : 'text-white/40'}`}>
                      {p.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold tracking-tight ${isMax ? 'text-gold-300' : 'text-white'}`}>
                        {p.prices[period]}
                      </span>
                      <span className="text-xs text-white/35 font-medium">{p.suffix[period]}</span>
                    </div>
                    {period === 'anual' && p.savings && (
                      <p className="text-[10px] font-semibold text-money-400 mt-1">{p.savings}</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckIcon gold={isMax} />
                        <span className={`text-xs leading-relaxed ${isMax ? 'text-white/80' : 'text-white/50'}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-5">
                    {isCurrent ? (
                      <div
                        className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-white/30"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Plano atual
                      </div>
                    ) : isMax ? (
                      <button
                        onClick={() => trackEvent('upgrade_plan_clicked', { plan: p.id, period })}
                        className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-ink-900 cursor-pointer"
                        style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
                      >
                        💳 Em breve
                      </button>
                    ) : (
                      <button
                        onClick={() => trackEvent('upgrade_plan_clicked', { plan: p.id, period })}
                        className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-white/40 cursor-pointer hover:text-white/60 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        💳 Em breve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="relative z-10 px-8 pb-7 text-center">
          <button
            onClick={onClose}
            className="text-xs text-white/30 hover:text-white/55 transition-colors"
          >
            Continuar no plano atual
          </button>
        </div>
      </div>
    </div>
  );
}
