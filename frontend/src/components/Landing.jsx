import React, { useState } from 'react';
import Reveal from './Reveal.jsx';
import UpgradeModal from './UpgradeModal.jsx';

/* ── Ícone inline ─────────────────────────────────────────── */
function Icon({ d, size = 18, className = '', strokeWidth = 1.7 }) {
  return (
    <svg
      width={size} height={size} fill="none"
      viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={strokeWidth} className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function ArrowRight({ size = 15 }) {
  return <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={size} strokeWidth={2.2} />;
}

/* ── Logo ─────────────────────────────────────────────────── */
function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-money-500 flex items-center justify-center shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7 5 V19 M7 5 H17" stroke="white" strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 12 H15" stroke="white" strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </svg>
      </div>
      <span className={`font-bold text-[15px] tracking-tight ${dark ? 'text-white' : 'text-ink-800'}`}>
        FinCheck
      </span>
    </div>
  );
}

/* ── Mock do relatório ────────────────────────────────────── */
function ReportCard() {
  return (
    <div className="relative">
      <div className="relative bg-white rounded-2xl shadow-md border border-ink-200 overflow-hidden">
        {/* Header do card */}
        <div className="bg-navy-900 px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="ml-2 text-[11px] text-white/30 font-mono">fincheck.ai/diagnóstico</span>
          </div>
          <p className="text-[11px] text-white/50 font-medium uppercase tracking-widest mb-1">
            Diagnóstico financeiro
          </p>
          <p className="text-lg font-bold text-white leading-tight">Padaria do João</p>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4">
          {/* Badge saúde */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-money-50 border border-money-200">
            <div className="w-7 h-7 rounded-lg bg-money-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-money-700 font-bold uppercase tracking-wider">
                Saúde financeira
              </p>
              <p className="text-sm font-bold text-money-800">Saudável ↑</p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-ink-50 rounded-xl p-3 border border-ink-200">
              <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide mb-1">
                Lucro líquido
              </p>
              <p className="text-[17px] font-bold text-money-600 font-mono">R$ 8.420</p>
              <p className="text-[10px] text-ink-400 mt-0.5">margem 14,2%</p>
            </div>
            <div className="bg-ink-50 rounded-xl p-3 border border-ink-200">
              <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide mb-1">
                Margem bruta
              </p>
              <p className="text-[17px] font-bold text-ink-800 font-mono">69,3%</p>
              <p className="text-[10px] text-money-600 mt-0.5">acima da média ✓</p>
            </div>
          </div>

          {/* Recomendação */}
          <div className="border-l-2 border-money-400 pl-3">
            <p className="text-[11px] text-money-700 font-bold uppercase tracking-wide mb-1">
              Ação esta semana
            </p>
            <p className="text-[12px] text-ink-600 leading-relaxed">
              Margem bruta acima da média do setor. Reinvista parte do lucro em equipamento — você tem fôlego.
            </p>
          </div>
        </div>
      </div>

      {/* Card flutuante menor */}
      <div className="absolute -right-6 -bottom-6 bg-white rounded-xl shadow-lg border border-ink-200 px-3.5 py-3 animate-float">
        <p className="text-[10px] text-ink-400 font-medium mb-0.5">Vs. setor (Alimentação)</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-money-500" />
          <p className="text-xs font-bold text-ink-800">Você está acima da média</p>
        </div>
      </div>
    </div>
  );
}

/* ── Dados de conteúdo ────────────────────────────────────── */

const PAIN_POINTS = [
  'Termina o mês sem saber se sobrou ou faltou de verdade',
  'Tira do bolso pra cobrir o caixa e perde a conta',
  'Vende muito mas não sente o lucro chegando',
  'Decide preço, contratação e investimento "no feeling"',
  'Não sabe se sua margem é boa ou ruim pro seu setor',
  'Vê dívida acumulando e não tem clareza se ainda tá no controle',
];

const STEPS_FLOW = [
  {
    n: '01',
    title: 'Você responde 7 perguntas',
    desc: 'Faturamento, custos, gastos fixos, dívidas. Em linguagem de dono — sem precisar saber contabilidade.',
  },
  {
    n: '02',
    title: 'A IA cruza com benchmarks do setor',
    desc: 'Calculamos margens, ponto de equilíbrio, saúde do caixa e comparamos com PMEs do mesmo segmento.',
  },
  {
    n: '03',
    title: 'Você recebe o relatório completo',
    desc: 'Diagnóstico, DRE em Excel pro contador, alertas de risco e ações práticas pra essa semana.',
  },
];

const FEATURES = [
  {
    title: 'Diagnóstico em linguagem de dono',
    desc: 'O que tá indo bem, o que tá sangrando, o que fazer essa semana. Sem jargão.',
    d: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    accent: 'bg-money-50 text-money-600',
  },
  {
    title: 'Benchmark do seu setor',
    desc: 'Suas margens versus PMEs do mesmo segmento. Você sabe exatamente onde está.',
    d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    accent: 'bg-brand-50 text-brand-600',
  },
  {
    title: 'DRE pronta pro contador',
    desc: 'Demonstração de Resultado em Excel, com totais e categorias. Manda sem refazer nada.',
    d: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Chat com IA que conhece seus números',
    desc: 'Pergunta sobre margem, dívida, qualquer coisa. A IA já tem contexto do seu diagnóstico.',
    d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Alertas antes do problema virar crise',
    desc: 'Margem baixa, caixa apertado, dívidas demais, mistura PJ/PF — identificamos automaticamente.',
    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    accent: 'bg-loss-50 text-loss-600',
  },
  {
    title: 'Evolução mês a mês',
    desc: 'Refaça o diagnóstico todo mês. Guardamos o histórico e mostramos se você tá melhorando.',
    d: 'M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941',
    accent: 'bg-money-50 text-money-600',
  },
];

const FAQS = [
  {
    q: 'Os meus números ficam salvos?',
    a: 'Sim. Seus diagnósticos ficam salvos na sua conta com segurança na nuvem. Você pode acessar de qualquer dispositivo. Os dados são usados pela IA apenas para gerar o diagnóstico e nunca são compartilhados com terceiros.',
  },
  {
    q: 'Tem versão gratuita e paga?',
    a: 'Sim. O plano gratuito inclui o diagnóstico completo e exportação de relatório. O plano Pro desbloqueia o consultor IA, histórico de análises, acompanhamento mensal e DRE comparativa. Você começa grátis e decide se quer mais.',
  },
  {
    q: 'Quanto tempo leva?',
    a: 'Cerca de 5 minutos. Tenha em mãos: faturamento do mês, custo da operação, gastos fixos, saldo da conta e parcelas de dívidas. Valores aproximados servem.',
  },
  {
    q: 'Substitui meu contador?',
    a: 'Não. Seu contador continua essencial pra impostos e estratégia de longo prazo. O FinCheck é gestão do dia a dia — pra você tomar decisões rápidas sem marcar reunião.',
  },
  {
    q: 'Pra que tipo de empresa serve?',
    a: 'PMEs brasileiras de qualquer setor — restaurante, varejo, serviços, clínica, salão, oficina, escola, indústria. Os benchmarks são adaptados pro seu segmento.',
  },
];

/* ── FAQ item com accordion ───────────────────────────────── */
function FaqItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={i * 50}>
      <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden
        ${open ? 'border-money-300 shadow-sm' : 'border-ink-200 hover:border-ink-300'}`}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="text-[15px] font-semibold text-ink-800">{q}</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
            ${open ? 'bg-money-100 text-money-700' : 'bg-ink-100 text-ink-500'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </button>
        {open && (
          <div className="px-6 pb-5 text-sm text-ink-500 leading-relaxed border-t border-ink-100 pt-4">
            {a}
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* ── Componente principal ─────────────────────────────────── */
export default function Landing({ onEnter, user, plan, onHistory }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  function handleHistoricoClick() {
    if (plan === 'paid' && onHistory) {
      onHistory();
    } else {
      setShowUpgrade(true);
    }
  }

  return (
    <div className="landing-root">

      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-200/80">
        <div className="landing-container flex items-center justify-between h-14">
          <Logo />
          <nav className="flex items-center gap-1">
            <a
              href="#como-funciona"
              className="hidden sm:block px-3 py-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors"
            >
              Como funciona
            </a>
            <button
              onClick={handleHistoricoClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Histórico
            </button>
            <button onClick={onEnter} className="ml-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-sm">
              {user ? 'Minha conta' : 'Começar grátis'}
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="landing-container relative z-10 pt-24 pb-28 sm:pt-36 sm:pb-36">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20 items-center">

            {/* Texto */}
            <div className="max-w-xl">
              <Reveal>
                <div className="inline-flex items-center gap-2.5 mb-7 px-4 py-1.5 rounded-full border border-forest-600/20 bg-forest-50">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-pulse" />
                  <span className="text-xs font-semibold text-forest-600 tracking-wide">
                    Grátis para começar · CFO Virtual para PMEs
                  </span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="font-serif font-bold text-ink-800
                               text-[2.8rem] sm:text-5xl md:text-[3.6rem]
                               leading-[1.05] tracking-tight mb-7">
                  Seu negócio
                  <br />
                  <span className="text-forest-600">dá lucro</span>
                  <br />
                  de verdade?
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-lg text-ink-500 leading-relaxed mb-10 max-w-md">
                  Em 5 minutos o FinCheck olha seus números e te diz onde está o lucro,
                  onde está sangrando dinheiro e o que fazer{' '}
                  <em className="text-ink-700 not-italic font-medium">essa semana</em>.
                  Sem jargão de contador.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="flex items-center gap-4 flex-wrap">
                  <button onClick={onEnter} className="btn-cta">
                    Fazer diagnóstico agora
                    <ArrowRight size={15} />
                  </button>
                  <a href="#como-funciona"
                    className="text-sm font-semibold text-ink-400 hover:text-ink-700 transition-colors py-2">
                    Ver como funciona →
                  </a>
                </div>
                <div className="flex items-center gap-6 mt-10 pt-8 border-t border-ink-200">
                  {[
                    { n: '5 min', label: 'para o diagnóstico' },
                    { n: '100%', label: 'gratuito para começar' },
                    { n: 'IA', label: 'com dados do seu setor' },
                  ].map(s => (
                    <div key={s.n}>
                      <p className="text-xl font-bold text-ink-800 font-mono">{s.n}</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Preview flutuante */}
            <div className="hidden lg:block">
              <Reveal delay={280}>
                <ReportCard />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────── */}
      <div className="bg-white border-b border-ink-200">
        <div className="landing-container py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x divide-ink-200">
            {[
              { d: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', text: 'Dados salvos com segurança na nuvem' },
              { d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', text: 'Benchmark real do seu setor' },
              { d: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', text: 'Análise gerada com IA avançada' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 80}
                className="flex items-center gap-3 sm:px-8 first:pl-0 last:pr-0">
                <div className="w-8 h-8 rounded-lg bg-money-50 text-money-600 flex items-center justify-center flex-shrink-0">
                  <Icon d={item.d} size={16} />
                </div>
                <span className="text-sm font-medium text-ink-600">{item.text}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAIN ────────────────────────────────────────── */}
      <section className="landing-container py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <Reveal className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="accent-line" />
              <span className="text-xs font-bold text-money-600 uppercase tracking-widest">
                Você se reconhece?
              </span>
            </div>
            <h2 className="text-3xl sm:text-[2.6rem] font-bold text-ink-800 tracking-tighter leading-tight">
              Tocar um negócio sem ler<br className="hidden sm:block" /> os números é dirigir de olhos fechados.
            </h2>
          </Reveal>

          <div className="space-y-2">
            {PAIN_POINTS.map((p, i) => (
              <Reveal key={p} delay={i * 55}>
                <div className="group flex items-start gap-4 p-4 bg-white border border-ink-200
                               rounded-2xl hover:border-loss-200 hover:shadow-sm transition-all duration-200">
                  <div className="w-6 h-6 rounded-full bg-loss-50 border border-loss-200
                                  flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-loss-400" />
                  </div>
                  <p className="text-[15px] text-ink-700 leading-relaxed">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-10 p-5 bg-money-50 border border-money-200 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-money-500 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-ink-700">
                Se marcou pelo menos um, é exatamente pra isso que o FinCheck existe.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CUSTO DE NÃO SABER ──────────────────────────── */}
      <section className="hero-section py-24 sm:py-32">
        <div className="noise-overlay" />
        <div className="landing-container-narrow relative z-10 text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="accent-line" />
              <span className="text-xs font-bold text-money-400 uppercase tracking-widest">
                O custo de não saber
              </span>
              <span className="accent-line" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tightest mb-6 leading-tight text-white">
              <span className="text-money-400">6 em cada 10</span>
              <br />
              pequenas empresas brasileiras
              <br />
              fecham antes dos 5 anos.
            </h2>
            <p className="text-white/55 text-lg leading-relaxed max-w-lg mx-auto mb-10">
              A causa mais comum não é falta de cliente. É{' '}
              <strong className="text-white font-semibold">não saber ler os próprios números</strong>{' '}
              — vender muito e não sentir o lucro, decidir no chute, descobrir o problema tarde.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="inline-flex items-center gap-3 text-sm text-white/30">
              <div className="w-8 h-px bg-white/20" />
              <span>Fonte: SEBRAE — mortalidade de PMEs brasileiras</span>
              <div className="w-8 h-px bg-white/20" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── COMO FUNCIONA ───────────────────────────────── */}
      <section id="como-funciona" className="landing-container py-24 sm:py-32">
        <Reveal className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="accent-line" />
            <span className="text-xs font-bold text-money-600 uppercase tracking-widest">
              Como funciona
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-800 tracking-tighter mb-3">
            Três passos. Cinco minutos.
          </h2>
          <p className="text-ink-500 text-base leading-relaxed max-w-lg">
            Sem planilha pra preencher. Sem consultor pra contratar. Sem precisar saber contabilidade.
          </p>
        </Reveal>

        <div className="relative">
          {/* Linha conectora */}
          <div className="hidden md:block absolute top-10 left-[calc(16.5%+1px)] right-[calc(16.5%+1px)] h-px bg-ink-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {STEPS_FLOW.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="bg-white rounded-2xl border border-ink-200 p-7 shadow-card hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 text-money-400 font-bold
                                    text-sm flex items-center justify-center font-mono tracking-tight">
                      {s.n}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-ink-800 mb-2.5 leading-snug">{s.title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────── */}
      <section className="bg-white border-y border-ink-200 py-24 sm:py-32">
        <div className="landing-container">
          <Reveal className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="accent-line" />
              <span className="text-xs font-bold text-money-600 uppercase tracking-widest">
                O que você recebe
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-800 tracking-tighter mb-3">
              Um relatório que seu contador respeitaria.
            </h2>
            <p className="text-ink-500 text-base leading-relaxed">
              Mas escrito pra você ler num café, sem precisar de tradução.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 70}>
                <div className="group p-6 rounded-2xl border border-ink-200 bg-ink-50
                               hover:bg-white hover:border-ink-300 hover:shadow-card
                               transition-all duration-200 cursor-default">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.accent}`}>
                    <Icon d={f.d} size={18} />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink-800 mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARAÇÃO ──────────────────────────────────── */}
      <section className="landing-container py-24 sm:py-32">
        <Reveal className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="accent-line" />
            <span className="text-xs font-bold text-money-600 uppercase tracking-widest">
              Por que FinCheck
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-800 tracking-tighter mb-3">
            Como você cuidaria do seu financeiro hoje?
          </h2>
          <p className="text-ink-500 text-base leading-relaxed max-w-lg">
            Tem várias opções. A maioria é cara, demorada ou inacessível pra empresa pequena.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="overflow-x-auto rounded-2xl border border-ink-200 shadow-card">
            <table className="w-full bg-white text-sm">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-200">
                  <th className="text-left px-6 py-4 font-semibold text-ink-600 text-xs uppercase tracking-wider">Opção</th>
                  <th className="text-left px-6 py-4 font-semibold text-ink-600 text-xs uppercase tracking-wider">Custo</th>
                  <th className="text-left px-6 py-4 font-semibold text-ink-600 text-xs uppercase tracking-wider">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { opt: 'Contador (reunião extra)', cost: 'R$ 300 – 800/h', time: 'Dias até semanas' },
                  { opt: 'Consultor financeiro', cost: 'R$ 5k – 15k/projeto', time: 'Semanas até meses' },
                  { opt: 'Sistema ERP financeiro', cost: 'R$ 200 – 800/mês', time: 'Meses pra implementar' },
                  { opt: 'Planilha do cunhado', cost: '"De graça"', time: 'Provavelmente nunca' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-ink-100 text-ink-600">
                    <td className="px-6 py-4">{row.opt}</td>
                    <td className="px-6 py-4 font-mono text-ink-700">{row.cost}</td>
                    <td className="px-6 py-4">{row.time}</td>
                  </tr>
                ))}
                <tr className="bg-money-50 border-t-2 border-money-300">
                  <td className="px-6 py-5 font-bold text-ink-900 flex items-center gap-2">
                    <Logo />
                  </td>
                  <td className="px-6 py-5 font-bold text-money-700 font-mono">Gratuito</td>
                  <td className="px-6 py-5 font-bold text-ink-800">5 minutos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={160} className="text-center mt-8">
          <p className="text-sm text-ink-500">
            Não substitui contador — mas responde a pergunta diária:{' '}
            <strong className="text-ink-800">"Como tá meu negócio agora?"</strong>
          </p>
        </Reveal>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-ink-200 py-24 sm:py-32">
        <div className="landing-container-narrow">
          <Reveal className="mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="accent-line" />
              <span className="text-xs font-bold text-money-600 uppercase tracking-widest">
                Perguntas frequentes
              </span>
              <span className="accent-line" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-800 tracking-tighter">
              O que você quer saber antes de começar
            </h2>
          </Reveal>

          <div className="space-y-2">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────── */}
      <section className="hero-section py-24 sm:py-32">
        <div className="noise-overlay" />
        <div className="landing-container-narrow relative z-10 text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="accent-line" />
              <span className="text-xs font-bold text-money-400 uppercase tracking-widest">
                Comece agora
              </span>
              <span className="accent-line" />
            </div>
            <h2 className="text-3xl sm:text-[2.8rem] font-extrabold text-white tracking-tighter mb-5 leading-tight">
              Cinco minutos agora podem te
              <br />
              poupar meses no escuro.
            </h2>
            <p className="text-white/55 text-lg leading-relaxed mb-10">
              Crie sua conta, responda 7 perguntas e receba seu diagnóstico completo.
              Grátis para começar.
            </p>
            <button onClick={onEnter} className="btn-cta">
              Começar diagnóstico — grátis
              <ArrowRight size={15} />
            </button>
            <p className="text-xs text-white/30 mt-6">
              Diagnóstico grátis. Plano Pro para quem quer mais.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-navy-950 border-t border-white/5 py-12">
        <div className="landing-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo dark />
            <div className="text-center sm:text-right">
              <p className="text-xs text-white/25 leading-relaxed">
                Feito pra empresas brasileiras · Dados salvos com segurança
              </p>
              <p className="text-xs text-white/20 mt-1">
                Dúvidas?{' '}
                <a href="mailto:finchecks@gmail.com"
                  className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors">
                  finchecks@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
