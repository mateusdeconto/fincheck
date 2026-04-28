import { useState } from 'react';

export const SECTOR_BENCHMARKS = {
  restaurante: { grossMargin: [55, 70], netMargin: [3, 9],  cmvPct: [30, 40], tip: 'Controle de CMV (custo dos insumos) é o que define lucro no setor. Ideal: CMV abaixo de 35%.' },
  varejo:      { grossMargin: [25, 42], netMargin: [2, 8],  cmvPct: [55, 72], tip: 'Giro de estoque e negociação com fornecedores definem a rentabilidade.' },
  servicos:    { grossMargin: [38, 55], netMargin: [8, 15], cmvPct: [28, 48], tip: 'Precificação e retenção de clientes são os maiores drivers de lucro.' },
  saude:       { grossMargin: [45, 60], netMargin: [6, 12], cmvPct: [25, 40], tip: 'Fidelização de pacientes e gestão da agenda definem o resultado.' },
  beleza:      { grossMargin: [40, 58], netMargin: [7, 14], cmvPct: [18, 35], tip: 'Recorrência e ticket médio são os indicadores mais importantes.' },
  tecnologia:  { grossMargin: [50, 70], netMargin: [5, 15], cmvPct: [15, 35], tip: 'CAC e churn são os maiores riscos para a margem em tech.' },
  construcao:  { grossMargin: [20, 32], netMargin: [5, 12], cmvPct: [62, 78], tip: 'Planejamento de obra e controle de materiais evitam estouro de custos.' },
  educacao:    { grossMargin: [45, 58], netMargin: [4, 10], cmvPct: [20, 38], tip: 'Retenção de alunos e custo de captação são os indicadores críticos.' },
  industria:   { grossMargin: [25, 42], netMargin: [5, 10], cmvPct: [52, 70], tip: 'Eficiência produtiva e negociação de insumos determinam a margem.' },
  outro:       { grossMargin: [30, 45], netMargin: [5, 10], cmvPct: [40, 62], tip: 'Compare seus números com metas específicas do seu mercado.' },
};

function Icon({ d, size = 18, strokeWidth = 1.6, ...rest }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth} {...rest}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

// Cada segmento ganha sua própria cor pastel — quando selecionado.
// Cores pensadas pra ter contraste/identidade mas não competir com o resto da UI.
const SEGMENTS = [
  { value: 'restaurante', label: 'Alimentação',  desc: 'Restaurante, bar, café',     color: 'bg-orange-50 border-orange-300 text-orange-700',  icon: 'bg-orange-500',  d: 'M6 2v6m12-6v6M6 13h12M9 13v9m6-9v9' },
  { value: 'varejo',      label: 'Varejo',        desc: 'Loja, e-commerce',           color: 'bg-blue-50 border-blue-300 text-blue-700',        icon: 'bg-blue-500',    d: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
  { value: 'servicos',    label: 'Serviços',      desc: 'Consultoria, B2B/B2C',       color: 'bg-violet-50 border-violet-300 text-violet-700',  icon: 'bg-violet-500',  d: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22' },
  { value: 'saude',       label: 'Saúde',         desc: 'Clínica, consultório',       color: 'bg-rose-50 border-rose-300 text-rose-700',        icon: 'bg-rose-500',    d: 'M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z' },
  { value: 'beleza',      label: 'Beleza',        desc: 'Salão, estética',            color: 'bg-pink-50 border-pink-300 text-pink-700',        icon: 'bg-pink-500',    d: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z' },
  { value: 'tecnologia',  label: 'Tecnologia',    desc: 'Software, agência',          color: 'bg-cyan-50 border-cyan-300 text-cyan-700',        icon: 'bg-cyan-500',    d: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3' },
  { value: 'construcao',  label: 'Construção',    desc: 'Obras, reformas',            color: 'bg-amber-50 border-amber-300 text-amber-700',     icon: 'bg-amber-500',   d: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z' },
  { value: 'educacao',    label: 'Educação',      desc: 'Escola, cursos',             color: 'bg-emerald-50 border-emerald-300 text-emerald-700', icon: 'bg-emerald-500', d: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342' },
  { value: 'industria',   label: 'Indústria',     desc: 'Fabricação, manufatura',     color: 'bg-slate-100 border-slate-400 text-slate-700',    icon: 'bg-slate-600',   d: 'M3 21h18M3 21V8l6 4V8l6 4V8l6 4v9' },
  { value: 'outro',       label: 'Outro',         desc: 'Não está na lista',          color: 'bg-ink-100 border-ink-400 text-ink-700',          icon: 'bg-ink-600',     d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z' },
];

function MetricPill({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-md py-2 px-2 bg-white border border-ink-200">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{label}</span>
      <span className="text-sm font-bold text-ink-800 font-mono mt-0.5">{value}</span>
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
  const greeting = businessName.trim().length > 1 ? `Prazer, ${businessName.trim().split(' ')[0]}.` : null;

  return (
    <div className="animate-slide-up">

      {/* Top bar minimalista */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-ink-400 hover:text-ink-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" size={15} strokeWidth={2} />
          Voltar
        </button>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-1 rounded-full bg-ink-800" />
          <span className="w-6 h-1 rounded-full bg-ink-200" />
        </div>
      </div>

      {/* Saudação calorosa + headline */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-money-50 border border-money-100">
          <span className="w-1.5 h-1.5 rounded-full bg-money-500 animate-pulse" />
          <span className="text-xs font-semibold text-money-700">Vamos começar</span>
        </div>

        <h1 className="text-[2rem] sm:text-[2.4rem] font-bold text-ink-900 tracking-tighter leading-[1.1] mb-3">
          {greeting ? (
            <>
              {greeting}<br />
              <span className="text-ink-400">Conta sobre seu negócio.</span>
            </>
          ) : (
            <>
              Antes de mergulhar nos números,<br />
              <span className="text-ink-400">conta sobre seu negócio.</span>
            </>
          )}
        </h1>

        <p className="text-ink-500 text-base leading-relaxed">
          Cada setor tem realidades diferentes — sabendo o seu, comparamos com PMEs parecidas com a sua.
        </p>
      </div>

      {/* Card de promessa — o que ele recebe no fim */}
      <div className="mb-8 p-4 rounded-xl bg-ink-900 text-white flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={20} className="text-money-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Em ~5 minutos você recebe</p>
          <p className="text-xs text-ink-300 mt-0.5">
            Diagnóstico completo · DRE em Excel · Plano de ação prático
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-7">

        {/* Nome */}
        <div>
          <label className="block text-base font-semibold text-ink-800 mb-2">
            Como chama seu negócio?
          </label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Padaria do João, Oficina Silva..."
            className="input-base text-base py-3"
            autoComplete="organization"
            maxLength={80}
            autoFocus
          />
        </div>

        {/* Segmento */}
        <div>
          <label className="block text-base font-semibold text-ink-800 mb-1">
            E o que vocês fazem?
          </label>
          <p className="text-sm text-ink-400 mb-4">Escolha o segmento mais próximo do seu.</p>

          <div className="grid grid-cols-2 gap-2.5">
            {SEGMENTS.map(seg => {
              const isSelected = segment === seg.value;
              return (
                <button
                  key={seg.value}
                  type="button"
                  onClick={() => setSegment(seg.value)}
                  className={`relative text-left rounded-xl p-3.5 transition-all duration-150 border-2
                    ${isSelected
                      ? `${seg.color} shadow-md -translate-y-0.5`
                      : 'border-ink-200 bg-white hover:border-ink-300 hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                >
                  {isSelected && (
                    <span className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full ${seg.icon} flex items-center justify-center`}>
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                    isSelected ? `${seg.icon} text-white` : 'bg-ink-100 text-ink-500'
                  }`}>
                    <Icon d={seg.d} size={18} />
                  </div>
                  <div className={`text-sm font-bold leading-tight ${isSelected ? '' : 'text-ink-800'}`}>
                    {seg.label}
                  </div>
                  <div className={`text-[11px] leading-tight mt-0.5 ${isSelected ? 'opacity-80' : 'text-ink-400'}`}>
                    {seg.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {bench && selectedSeg && (
            <div className={`mt-4 rounded-xl p-4 border-2 animate-fade-in ${selectedSeg.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSeg.icon}`} />
                  <p className="text-xs font-bold">
                    Média de PMEs em {selectedSeg.label}
                  </p>
                </div>
                <span className="text-[10px] font-medium opacity-60 uppercase tracking-wide">
                  Brasil
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <MetricPill label="Margem Bruta"   value={`${bench.grossMargin[0]}–${bench.grossMargin[1]}%`} />
                <MetricPill label="Margem Líquida" value={`${bench.netMargin[0]}–${bench.netMargin[1]}%`} />
                <MetricPill label="CMV / Rec."     value={`${bench.cmvPct[0]}–${bench.cmvPct[1]}%`} />
              </div>
              <p className="text-xs leading-relaxed pt-2.5 border-t border-current opacity-80">
                {bench.tip}
              </p>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={!canProceed} className="btn-primary">
          <span className="flex items-center justify-center gap-2">
            {canProceed ? 'Bora começar' : 'Preencha pra continuar'}
            {canProceed && <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={15} strokeWidth={2.5} />}
          </span>
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 mt-5">
        Seus dados ficam só no seu navegador
      </p>
    </div>
  );
}
