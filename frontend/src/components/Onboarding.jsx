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

const SEGMENTS = [
  { value: 'restaurante', label: 'Alimentação',  desc: 'Restaurante, bar, café',     d: 'M6 2v6m12-6v6M6 13h12M9 13v9m6-9v9' },
  { value: 'varejo',      label: 'Varejo',        desc: 'Loja, e-commerce',           d: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
  { value: 'servicos',    label: 'Serviços',      desc: 'Consultoria, B2B/B2C',       d: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22' },
  { value: 'saude',       label: 'Saúde',         desc: 'Clínica, consultório',       d: 'M12 6v12m6-6H6' },
  { value: 'beleza',      label: 'Beleza',        desc: 'Salão, estética',            d: 'M12 2l2.5 7h7.5l-6 4.5 2.5 7-6.5-4.5-6.5 4.5 2.5-7-6-4.5h7.5z' },
  { value: 'tecnologia',  label: 'Tecnologia',    desc: 'Software, agência',          d: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3' },
  { value: 'construcao',  label: 'Construção',    desc: 'Obras, reformas',            d: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75' },
  { value: 'educacao',    label: 'Educação',      desc: 'Escola, cursos',             d: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342' },
  { value: 'industria',   label: 'Indústria',     desc: 'Fabricação, manufatura',     d: 'M3 21h18M3 21V8l6 4V8l6 4V8l6 4v9' },
  { value: 'outro',       label: 'Outro',         desc: 'Não está na lista',          d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z' },
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

  return (
    <div className="animate-slide-up">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-7">
        <button
          onClick={onBack}
          className="text-ink-400 hover:text-ink-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" size={15} strokeWidth={2} />
          Voltar
        </button>
        <span className="text-xs font-medium text-ink-400">1 / 2</span>
      </div>

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-[1.7rem] font-bold text-ink-900 tracking-tighter mb-2">
          Conta um pouco do seu negócio
        </h1>
        <p className="text-ink-500 text-[15px] leading-relaxed">
          Vamos personalizar o diagnóstico com benchmarks do seu setor.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">

        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-2">
            Nome do negócio
          </label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Ex: Padaria do João"
            className="input-base"
            autoComplete="organization"
            maxLength={80}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-3">
            Segmento
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEGMENTS.map(seg => {
              const isSelected = segment === seg.value;
              return (
                <button
                  key={seg.value}
                  type="button"
                  onClick={() => setSegment(seg.value)}
                  className={`relative text-left rounded-lg p-3 transition-all duration-100 border ${
                    isSelected
                      ? 'border-ink-800 bg-ink-50 shadow-xs'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-ink-800 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-ink-800 text-white' : 'bg-ink-100 text-ink-500'
                  }`}>
                    <Icon d={seg.d} size={16} />
                  </div>
                  <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-ink-900' : 'text-ink-700'}`}>
                    {seg.label}
                  </div>
                  <div className="text-[11px] leading-tight text-ink-400 mt-0.5">
                    {seg.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {bench && selectedSeg && (
            <div className="mt-4 rounded-lg p-4 bg-ink-50 border border-ink-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-ink-700">
                  Média do setor — {selectedSeg.label}
                </p>
                <span className="text-[10px] font-medium text-ink-400 uppercase tracking-wide">
                  PMEs Brasil
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <MetricPill label="Margem Bruta"   value={`${bench.grossMargin[0]}–${bench.grossMargin[1]}%`} />
                <MetricPill label="Margem Líquida" value={`${bench.netMargin[0]}–${bench.netMargin[1]}%`} />
                <MetricPill label="CMV / Rec."     value={`${bench.cmvPct[0]}–${bench.cmvPct[1]}%`} />
              </div>
              <p className="text-xs leading-relaxed text-ink-500 pt-2.5 border-t border-ink-200">
                {bench.tip}
              </p>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={!canProceed} className="btn-primary">
          <span className="flex items-center justify-center gap-2">
            Continuar
            <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={15} strokeWidth={2.5} />
          </span>
        </button>
      </div>

      <p className="text-center text-xs text-ink-400 mt-5">
        Seus dados ficam no seu dispositivo
      </p>
    </div>
  );
}
