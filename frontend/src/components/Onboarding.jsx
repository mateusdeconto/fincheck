import { useState } from 'react';

// Médias setoriais para PMEs brasileiras (fontes: SEBRAE, Deloitte SME, dados setoriais IBGE/FGV)
// Fontes: SEBRAE (restaurante/CMV), StartupHero/dados públicos empresas brasileiras (demais setores)
// Ajustados para refletir PMEs, não grandes empresas de capital aberto
export const SECTOR_BENCHMARKS = {
  restaurante: {
    grossMargin: [55, 70], netMargin: [3, 9], cmvPct: [30, 40],
    tip: 'Controle do CMV (custo dos insumos) é o maior alavancador de lucro no setor. Ideal: CMV abaixo de 35%.',
    color: 'orange',
  },
  varejo: {
    grossMargin: [25, 42], netMargin: [2, 8], cmvPct: [55, 72],
    tip: 'Giro de estoque e negociação com fornecedores definem a rentabilidade no varejo.',
    color: 'blue',
  },
  servicos: {
    grossMargin: [38, 55], netMargin: [8, 15], cmvPct: [28, 48],
    tip: 'Precificação correta e retenção de clientes são os maiores drivers de lucro em serviços.',
    color: 'indigo',
  },
  saude: {
    grossMargin: [45, 60], netMargin: [6, 12], cmvPct: [25, 40],
    tip: 'Fidelização de pacientes e gestão eficiente da agenda são os principais drivers de lucro.',
    color: 'red',
  },
  beleza: {
    grossMargin: [40, 58], netMargin: [7, 14], cmvPct: [18, 35],
    tip: 'Recorrência de clientes e ticket médio são os indicadores mais importantes.',
    color: 'pink',
  },
  tecnologia: {
    grossMargin: [50, 70], netMargin: [5, 15], cmvPct: [15, 35],
    tip: 'Custo de aquisição de clientes (CAC) e churn são os maiores riscos para margem em tech.',
    color: 'violet',
  },
  construcao: {
    grossMargin: [20, 32], netMargin: [5, 12], cmvPct: [62, 78],
    tip: 'Planejamento de obra e controle rigoroso de materiais evitam o estouro de custos.',
    color: 'amber',
  },
  educacao: {
    grossMargin: [45, 58], netMargin: [4, 10], cmvPct: [20, 38],
    tip: 'Retenção de alunos e custo de captação (CAC) são os indicadores mais críticos do setor.',
    color: 'emerald',
  },
  industria: {
    grossMargin: [25, 42], netMargin: [5, 10], cmvPct: [52, 70],
    tip: 'Eficiência produtiva e negociação de insumos são os maiores determinantes de margem.',
    color: 'slate',
  },
  outro: {
    grossMargin: [30, 45], netMargin: [5, 10], cmvPct: [40, 62],
    tip: 'Compare seus números com metas específicas do seu mercado para ter uma referência clara.',
    color: 'gray',
  },
};

// SVG icons por segmento
function IconRestaurant({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.048 1.837 2.13v.214M3 19.5v-2.26c0-1.082.768-1.97 1.837-2.13.386-.058.773-.111 1.163-.16" />
    </svg>
  );
}
function IconRetail({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
function IconServices({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}
function IconHealth({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}
function IconBeauty({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}
function IconTech({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
    </svg>
  );
}
function IconConstruction({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  );
}
function IconEducation({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}
function IconIndustry({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconOther({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

const SEGMENTS = [
  { value: 'restaurante', label: 'Alimentação', desc: 'Restaurante, bar, café, delivery', Icon: IconRestaurant },
  { value: 'varejo',      label: 'Varejo',       desc: 'Loja física, e-commerce, mercado', Icon: IconRetail },
  { value: 'servicos',    label: 'Serviços',     desc: 'Consultoria, manutenção, B2B/B2C', Icon: IconServices },
  { value: 'saude',       label: 'Saúde',        desc: 'Clínica, consultório, academia', Icon: IconHealth },
  { value: 'beleza',      label: 'Beleza',       desc: 'Salão, barbearia, estética', Icon: IconBeauty },
  { value: 'tecnologia',  label: 'Tecnologia',   desc: 'Software, agência digital, apps', Icon: IconTech },
  { value: 'construcao',  label: 'Construção',   desc: 'Construtora, reformas, empreiteira', Icon: IconConstruction },
  { value: 'educacao',    label: 'Educação',     desc: 'Escola, cursos, treinamentos', Icon: IconEducation },
  { value: 'industria',   label: 'Indústria',    desc: 'Fabricação, manufatura, confecção', Icon: IconIndustry },
  { value: 'outro',       label: 'Outro',        desc: 'Meu negócio não está na lista', Icon: IconOther },
];

// Paleta de ícones por segmento (tom claro sobre fundo branco)
const ICON_COLORS = {
  restaurante: { bg: '#fff7ed', color: '#ea580c' },
  varejo:      { bg: '#eff6ff', color: '#2563eb' },
  servicos:    { bg: '#eef2ff', color: '#4f46e5' },
  saude:       { bg: '#fff1f2', color: '#e11d48' },
  beleza:      { bg: '#fdf4ff', color: '#a21caf' },
  tecnologia:  { bg: '#f5f3ff', color: '#7c3aed' },
  construcao:  { bg: '#fffbeb', color: '#d97706' },
  educacao:    { bg: '#f0fdf4', color: '#16a34a' },
  industria:   { bg: '#f8fafc', color: '#475569' },
  outro:       { bg: '#f9fafb', color: '#6b7280' },
};

function BenchmarkChip({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-xl py-2.5 px-2"
         style={{ background: 'rgba(30,58,95,0.06)', border: '1px solid rgba(30,58,95,0.1)' }}>
      <span className="text-[10px] font-semibold text-navy-600 uppercase tracking-wide leading-tight text-center mb-1">{label}</span>
      <span className="text-sm font-bold text-navy-800">{value}</span>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
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
    <div className="animate-slide-up space-y-5">

      {/* ── HERO ── */}
      <div className="text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
             style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">FinCheck</h1>
        <p className="text-white/55 text-sm leading-relaxed max-w-xs mx-auto mb-5">
          Descubra a saúde financeira do seu negócio em menos de 5 minutos
        </p>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { icon: '⚡', text: '5 minutos' },
            { icon: '🔒', text: 'Privado' },
            { icon: '✓', text: 'Gratuito' },
          ].map(f => (
            <span key={f.text}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
              <span>{f.icon}</span>
              {f.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── CARD ── */}
      <div className="card p-6">

        {/* Card header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Sobre o seu negócio</h2>
          <p className="text-slate-400 text-sm">Essas informações personalizam o diagnóstico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nome do negócio */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nome do negócio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Ex: Padaria do João, Oficina Silva..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200
                           focus:border-navy-500 focus:bg-navy-50/20
                           outline-none transition-all text-slate-800 placeholder:text-slate-300 text-sm font-medium"
                autoComplete="organization"
                maxLength={60}
              />
            </div>
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Segmento da empresa
            </label>

            {/* Grid 2 colunas */}
            <div className="grid grid-cols-2 gap-2">
              {SEGMENTS.map(seg => {
                const ic = ICON_COLORS[seg.value];
                const isSelected = segment === seg.value;
                return (
                  <button
                    key={seg.value}
                    type="button"
                    onClick={() => setSegment(seg.value)}
                    className={`relative text-left rounded-xl border-2 p-3 transition-all duration-150
                      ${isSelected
                        ? 'border-navy-500 bg-navy-50 shadow-sm'
                        : 'border-slate-200 hover:border-navy-300 hover:bg-slate-50'
                      }`}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-navy-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                         style={{ background: ic.bg }}>
                      <seg.Icon className="w-4 h-4" style={{ color: ic.color }} />
                    </div>

                    <div className={`text-sm font-semibold mb-0.5 leading-tight ${isSelected ? 'text-navy-700' : 'text-slate-700'}`}>
                      {seg.label}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {seg.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Benchmark card animado ── */}
            {bench && selectedSeg && (
              <div className="mt-4 rounded-2xl p-4 animate-fade-in"
                   style={{ background: 'rgba(30,58,95,0.05)', border: '1px solid rgba(30,58,95,0.12)' }}>

                {/* Header benchmark */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-navy-700 uppercase tracking-wider">
                      Média setorial — {selectedSeg.label}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Referência para PMEs brasileiras</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                       style={{ background: 'rgba(30,58,95,0.08)' }}>
                    <svg className="w-3 h-3 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <span className="text-[10px] font-bold text-navy-600">Estimativa</span>
                  </div>
                </div>

                {/* 3 métricas */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <BenchmarkChip label="Margem Bruta" value={`${bench.grossMargin[0]}–${bench.grossMargin[1]}%`} />
                  <BenchmarkChip label="Margem Líquida" value={`${bench.netMargin[0]}–${bench.netMargin[1]}%`} />
                  <BenchmarkChip label="CMV / Receita" value={`${bench.cmvPct[0]}–${bench.cmvPct[1]}%`} />
                </div>

                {/* Dica do setor */}
                <div className="flex items-start gap-2 pt-2 border-t border-navy-100">
                  <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{bench.tip}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <button type="submit" disabled={!canProceed} className="btn-primary">
            <span className="flex items-center justify-center gap-2">
              Iniciar diagnóstico
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-white/25 text-xs">
        Seus dados ficam apenas no seu dispositivo · Nenhuma conta necessária
      </p>
    </div>
  );
}
