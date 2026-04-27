import { useState } from 'react';

export const SECTOR_BENCHMARKS = {
  restaurante: {
    grossMargin: [55, 70], netMargin: [3, 9], cmvPct: [30, 40],
    tip: 'Controle do CMV (custo dos insumos) é o maior alavancador de lucro no setor. Ideal: CMV abaixo de 35%.',
  },
  varejo: {
    grossMargin: [25, 42], netMargin: [2, 8], cmvPct: [55, 72],
    tip: 'Giro de estoque e negociação com fornecedores definem a rentabilidade no varejo.',
  },
  servicos: {
    grossMargin: [38, 55], netMargin: [8, 15], cmvPct: [28, 48],
    tip: 'Precificação correta e retenção de clientes são os maiores drivers de lucro em serviços.',
  },
  saude: {
    grossMargin: [45, 60], netMargin: [6, 12], cmvPct: [25, 40],
    tip: 'Fidelização de pacientes e gestão eficiente da agenda são os principais drivers de lucro.',
  },
  beleza: {
    grossMargin: [40, 58], netMargin: [7, 14], cmvPct: [18, 35],
    tip: 'Recorrência de clientes e ticket médio são os indicadores mais importantes.',
  },
  tecnologia: {
    grossMargin: [50, 70], netMargin: [5, 15], cmvPct: [15, 35],
    tip: 'Custo de aquisição de clientes (CAC) e churn são os maiores riscos para margem em tech.',
  },
  construcao: {
    grossMargin: [20, 32], netMargin: [5, 12], cmvPct: [62, 78],
    tip: 'Planejamento de obra e controle rigoroso de materiais evitam o estouro de custos.',
  },
  educacao: {
    grossMargin: [45, 58], netMargin: [4, 10], cmvPct: [20, 38],
    tip: 'Retenção de alunos e custo de captação (CAC) são os indicadores mais críticos do setor.',
  },
  industria: {
    grossMargin: [25, 42], netMargin: [5, 10], cmvPct: [52, 70],
    tip: 'Eficiência produtiva e negociação de insumos são os maiores determinantes de margem.',
  },
  outro: {
    grossMargin: [30, 45], netMargin: [5, 10], cmvPct: [40, 62],
    tip: 'Compare seus números com metas específicas do seu mercado para ter uma referência clara.',
  },
};

function Icon({ d, size = 20, strokeWidth = 1.6, ...rest }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth} {...rest}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const SEGMENTS = [
  { value: 'restaurante', label: 'Alimentação',  desc: 'Restaurante, bar, café',     d: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371' },
  { value: 'varejo',      label: 'Varejo',        desc: 'Loja, e-commerce',           d: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
  { value: 'servicos',    label: 'Serviços',      desc: 'Consultoria, B2B/B2C',       d: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38' },
  { value: 'saude',       label: 'Saúde',         desc: 'Clínica, consultório',       d: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { value: 'beleza',      label: 'Beleza',        desc: 'Salão, estética',            d: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
  { value: 'tecnologia',  label: 'Tecnologia',    desc: 'Software, agência',          d: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3' },
  { value: 'construcao',  label: 'Construção',    desc: 'Obras, reformas',            d: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75' },
  { value: 'educacao',    label: 'Educação',      desc: 'Escola, cursos',             d: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342' },
  { value: 'industria',   label: 'Indústria',     desc: 'Fabricação, manufatura',     d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737' },
  { value: 'outro',       label: 'Outro',         desc: 'Não está na lista',          d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z' },
];

function MetricPill({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-xl py-2.5 px-2 bg-white/60 border border-ink-100">
      <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight text-center mb-1 text-ink-400">
        {label}
      </span>
      <span className="text-sm font-bold text-ink-800 font-mono">{value}</span>
    </div>
  );
}

export default function Onboarding({ onComplete, onBack }) {
  const [businessName, setBusinessName] = useState('');
  const [segment, setSegment] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!businessName.trim() || !segment) return;
    onComplete({ businessName: businessName.trim(), segment });
  }

  const canProceed = businessName.trim().length > 0 && segment !== '';
  const selectedSeg = SEGMENTS.find(s => s.value === segment);
  const bench = segment ? SECTOR_BENCHMARKS[segment] : null;

  return (
    <div className="animate-slide-up">

      {/* Header — voltar + step indicator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-ink-400 hover:text-ink-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" size={16} strokeWidth={2} />
          Voltar
        </button>
        <span className="eyebrow-muted">Etapa 1 de 2</span>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 pill-accent mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
          Diagnóstico em ~5 minutos
        </span>

        <h1 className="font-display text-[2rem] sm:text-[2.4rem] font-semibold leading-[1.1] tracking-tighter text-ink-800 mb-3">
          Vamos começar pelo seu <em className="text-accent-600 font-medium italic">negócio</em>
        </h1>
        <p className="text-ink-500 text-[15px] leading-relaxed max-w-sm mx-auto">
          Conte sobre sua empresa para personalizarmos o diagnóstico com benchmarks do setor.
        </p>
      </div>

      {/* Form card */}
      <div className="card p-6 sm:p-7 space-y-6">

        {/* Nome */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-2">
            Nome do negócio
          </label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Ex: Padaria do João, Oficina Silva..."
            className="input-base px-4 py-3"
            autoComplete="organization"
            maxLength={80}
            autoFocus
          />
        </div>

        {/* Segmento */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-3">
            Segmento da empresa
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEGMENTS.map(seg => {
              const isSelected = segment === seg.value;
              return (
                <button
                  key={seg.value}
                  type="button"
                  onClick={() => setSegment(seg.value)}
                  className={`relative text-left rounded-xl p-3 transition-all duration-150 border ${
                    isSelected
                      ? 'border-accent-500 bg-accent-50 shadow-soft'
                      : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center bg-accent-500">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-accent-500 text-white' : 'bg-ink-100 text-ink-500'
                  }`}>
                    <Icon d={seg.d} size={18} />
                  </div>
                  <div className={`text-sm font-semibold mb-0.5 leading-tight ${isSelected ? 'text-accent-700' : 'text-ink-700'}`}>
                    {seg.label}
                  </div>
                  <div className="text-[11px] leading-tight text-ink-400">
                    {seg.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Benchmark card */}
          {bench && selectedSeg && (
            <div className="mt-4 rounded-2xl p-4 bg-ink-50 border border-ink-100 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="eyebrow text-[10px]">
                    Média setorial — {selectedSeg.label}
                  </span>
                  <p className="text-[11px] mt-0.5 text-ink-400">
                    Referência para PMEs brasileiras
                  </p>
                </div>
                <span className="pill text-[10px] py-1 px-2">Estimativa</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <MetricPill label="Margem Bruta"    value={`${bench.grossMargin[0]}–${bench.grossMargin[1]}%`} />
                <MetricPill label="Margem Líquida"  value={`${bench.netMargin[0]}–${bench.netMargin[1]}%`} />
                <MetricPill label="CMV / Rec."      value={`${bench.cmvPct[0]}–${bench.cmvPct[1]}%`} />
              </div>

              <div className="flex items-start gap-2 pt-3 border-t border-ink-200">
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                <p className="text-[11px] leading-relaxed text-ink-500">
                  {bench.tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button onClick={handleSubmit} disabled={!canProceed} className="btn-primary">
          <span className="flex items-center justify-center gap-2">
            Continuar para as perguntas
            <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={16} strokeWidth={2.5} />
          </span>
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 mt-4">
        Seus dados ficam apenas no seu dispositivo · Sem cadastro
      </p>
    </div>
  );
}
