import Reveal from './Reveal.jsx';

function Icon({ d, size = 18, className = '', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function ArrowRight({ size = 16 }) {
  return <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={size} />;
}

const FEATURES = [
  {
    title: 'Diagnóstico em linguagem de dono',
    desc: 'Lemos seus números e devolvemos um relatório direto: o que tá indo bem, o que tá sangrando, o que fazer essa semana.',
    d: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  },
  {
    title: 'Comparado com o seu setor',
    desc: 'Suas margens versus a média de PMEs do mesmo segmento. Você sabe exatamente onde está.',
    d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    title: 'DRE pronta pro contador',
    desc: 'Demonstração de Resultado em Excel formatado, com totais e categorias. Manda pro seu contador sem refazer nada.',
    d: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    title: 'Pergunte o que quiser',
    desc: 'Depois do diagnóstico, abre um chat com a IA que conhece seus números. Pergunta sobre margem, dívida, qualquer coisa.',
    d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
  },
  {
    title: 'Risco antes de virar problema',
    desc: 'Identificamos automaticamente os pontos críticos: margem baixa, caixa apertado, dívidas demais, mistura PJ/PF.',
    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  {
    title: 'Evolução mês a mês',
    desc: 'Refaça o diagnóstico todo mês. Guardamos o histórico e mostramos se você tá melhorando — sem criar conta.',
    d: 'M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941',
  },
];

const PAIN_POINTS = [
  'Termina o mês sem saber se sobrou ou faltou dinheiro de verdade',
  'Tira do bolso pra cobrir o caixa e perde a conta de quanto deve a si mesmo',
  'Vende muito mas não sente o lucro chegando',
  'Decide preço, contratação e investimento "no feeling"',
  'Não sabe se a margem do seu negócio é boa ou ruim pro seu setor',
  'Vê dívida acumulando e não tem clareza se ainda tá no controle',
];

const STEPS_FLOW = [
  {
    n: '1',
    title: 'Você responde 7 perguntas',
    desc: 'Sobre faturamento, custos, gastos fixos, dívidas. Em linguagem de dono — sem precisar saber contabilidade.',
  },
  {
    n: '2',
    title: 'A IA cruza com benchmarks do setor',
    desc: 'Calculamos margens, ponto de equilíbrio, saúde do caixa — e comparamos com PMEs do mesmo segmento.',
  },
  {
    n: '3',
    title: 'Você recebe o relatório',
    desc: 'Diagnóstico completo, DRE em Excel pro contador, alertas de risco e ações práticas pra essa semana.',
  },
];

const FAQS = [
  {
    q: 'Os meus números ficam salvos?',
    a: 'Sim. Seus diagnósticos ficam salvos na sua conta com segurança na nuvem. Você pode acessar de qualquer dispositivo a qualquer momento. Os dados são usados pela IA apenas para gerar o diagnóstico e nunca são compartilhados com terceiros.',
  },
  {
    q: 'É realmente gratuito? Onde tá a pegadinha?',
    a: 'Sem pegadinha. É 100% gratuito hoje, sem cartão. Você cria uma conta simples com e-mail e senha — e pronto. Foi feito por brasileiros que cansaram de ver pequenas empresas fechando por falta de visão financeira. Se um dia tiver versão paga, será opcional — você decide.',
  },
  {
    q: 'Quanto tempo leva?',
    a: 'Cerca de 5 minutos. Tenha em mãos: faturamento do mês, custo da operação (matéria-prima, mercadoria), gastos fixos (aluguel, folha, etc), saldo da conta e parcelas de dívidas (se tiver). Tudo em valores aproximados serve.',
  },
  {
    q: 'Substitui meu contador?',
    a: 'Não. Seu contador continua essencial pra impostos, obrigações fiscais e estratégia de longo prazo. O FinCheck é uma ferramenta de gestão — pra você entender seus números no dia a dia e tomar decisões rápidas sem precisar marcar reunião.',
  },
  {
    q: 'Pra que tipo de empresa serve?',
    a: 'Pequenas e médias empresas brasileiras de qualquer setor — restaurante, varejo, prestador de serviço, clínica, salão, oficina, escola, indústria pequena. Os benchmarks são adaptados pro seu segmento.',
  },
  {
    q: 'A IA pode errar?',
    a: 'Pode. A análise é boa, mas é orientativa — não substitui julgamento humano. Use como ponto de partida pras suas decisões, não como verdade absoluta. Decisões importantes (corte de pessoal, empréstimos grandes) sempre confira com contador ou consultor.',
  },
];

// Mockup de relatório — preview visual da entrega
function ReportPreview() {
  return (
    <div className="bg-white border border-ink-200 rounded-xl shadow-lg overflow-hidden">
      {/* Mock window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-ink-50 border-b border-ink-200">
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="ml-3 text-[11px] text-ink-400 font-mono">fincheck.com/diagnóstico</span>
      </div>
      {/* Conteúdo do mock */}
      <div className="p-5">
        <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-1">Diagnóstico financeiro</p>
        <p className="text-base font-bold text-ink-900 mb-3">Padaria do João</p>

        <div className="flex items-center gap-2 p-2.5 rounded-md bg-money-50 border border-money-100 mb-4">
          <span className="w-2 h-2 rounded-full bg-money-500" />
          <p className="text-xs font-bold text-money-700">Saúde financeira: Saudável</p>
        </div>

        <div className="card-dark p-4 mb-4">
          <p className="text-[10px] text-ink-300 uppercase tracking-wider font-medium mb-1">Lucro líquido</p>
          <p className="text-xl font-bold text-money-500 font-mono">R$ 8.420,00</p>
          <p className="text-xs text-ink-300 mt-0.5">Margem: 14,2%</p>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-ink-400">Receita</span>
            <span className="font-mono font-semibold text-ink-700">R$ 59.300</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-ink-400">CMV</span>
            <span className="font-mono font-semibold text-ink-700">R$ 18.200</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-ink-400">Margem bruta</span>
            <span className="font-mono font-semibold text-money-700">69,3% ✓</span>
          </div>
        </div>

        <div className="border-t border-ink-100 pt-3">
          <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-1.5">Recomendação</p>
          <p className="text-xs text-ink-600 leading-relaxed">
            Sua margem bruta está acima da média do setor (55–70%). Considere reinvestir parte do lucro em equipamento — você tem fôlego.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onEnter }) {
  return (
    <div className="landing-root">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-ink-100">
        <div className="landing-container flex items-center justify-between h-14">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-ink-900 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                {/* F: barra vertical + topo (branco) */}
                <path d="M7 5 V19 M7 5 H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* barra do meio (verde) */}
                <path d="M7 12 H17" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-bold text-ink-800 text-[15px] tracking-tight">FinCheck</span>
          </a>
          <button onClick={onEnter} className="btn-quiet">Começar →</button>
        </div>
      </header>

      {/* HERO */}
      <section className="landing-container pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="max-w-2xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-ink-100 text-ink-600 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-money-500" />
                100% gratuito · conta em segundos
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-[2.4rem] sm:text-5xl md:text-[3.5rem] font-extrabold text-ink-900 leading-[1.05] tracking-tightest mb-5">
                Seu negócio dá lucro
                <br />
                <span className="text-brand-500">de verdade?</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-lg text-ink-500 max-w-xl leading-relaxed mb-8">
                Em 5 minutos, o FinCheck olha seus números e te diz exatamente onde está o lucro,
                onde está sangrando dinheiro e o que fazer essa semana. Sem jargão de contador.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={onEnter} className="btn-cta">
                  Fazer diagnóstico agora
                  <ArrowRight size={16} />
                </button>
                <a href="#como-funciona" className="text-sm font-semibold text-ink-600 hover:text-ink-900 px-2 py-2 transition-colors">
                  Ver como funciona →
                </a>
              </div>

              <p className="text-xs text-ink-400 mt-5">
                Crie sua conta grátis em segundos. Não pedimos cartão.
              </p>
            </Reveal>
          </div>

          {/* Preview do relatório */}
          <div className="hidden lg:block">
            <Reveal delay={300}>
              <ReportPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-y border-ink-200 bg-ink-50">
        <div className="landing-container py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <Reveal className="flex items-center gap-2.5">
            <Icon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" size={16} className="text-ink-400 flex-shrink-0" />
            <span className="text-ink-600">Dados ficam no seu dispositivo</span>
          </Reveal>
          <Reveal delay={80} className="flex items-center gap-2.5">
            <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" size={16} className="text-ink-400 flex-shrink-0" />
            <span className="text-ink-600">Comparamos com a média do seu setor</span>
          </Reveal>
          <Reveal delay={160} className="flex items-center gap-2.5">
            <Icon d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" size={16} className="text-ink-400 flex-shrink-0" />
            <span className="text-ink-600">Análise feita com auxílio de IA</span>
          </Reveal>
        </div>
      </div>

      {/* PAIN — você se identifica? */}
      <section className="landing-container py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 text-center">
              Você se reconhece em alguma dessas?
            </p>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-ink-900 tracking-tighter text-center mb-12 leading-tight">
              Tocar um negócio sem ler os números<br />
              é dirigir de olhos fechados.
            </h2>
          </Reveal>

          <div className="space-y-2.5">
            {PAIN_POINTS.map((p, i) => (
              <Reveal key={p} delay={i * 60} className="flex items-start gap-3 p-4 bg-white border border-ink-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-loss-50 border border-loss-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-loss-500" />
                </span>
                <p className="text-[15px] text-ink-700 leading-relaxed">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="text-center text-ink-500 mt-10 text-base leading-relaxed">
              Se marcou pelo menos um, é exatamente pra isso que o FinCheck existe.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CUSTO DE NÃO SABER — bloco escuro de impacto */}
      <section className="bg-ink-900 text-white py-20 sm:py-28">
        <div className="landing-container-narrow text-center">
          <Reveal>
            <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider mb-4">
              O custo de não saber
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-6 leading-tight">
              <span className="text-brand-300">6 em cada 10</span><br />
              pequenas empresas brasileiras
              <br />
              fecham antes dos 5 anos.
            </h2>
            <p className="text-ink-300 text-lg leading-relaxed max-w-xl mx-auto mb-10">
              A causa mais comum não é falta de cliente. É <strong className="text-white font-semibold">não saber ler os próprios números</strong> —
              vender muito e não sentir o lucro, decidir no chute, descobrir o problema tarde demais.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="inline-flex items-center gap-3 text-sm text-ink-400">
              <div className="w-8 h-px bg-ink-700" />
              <span>Dados SEBRAE — mortalidade de PMEs</span>
              <div className="w-8 h-px bg-ink-700" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="landing-container py-20 sm:py-28">
        <Reveal className="mb-12 max-w-2xl">
          <p className="section-label mb-3">Como funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter mb-4">
            Três passos. Cinco minutos.
          </h2>
          <p className="text-ink-500 text-base leading-relaxed">
            Sem planilha pra preencher. Sem consultor pra contratar. Cria sua conta em segundos.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded-xl overflow-hidden">
          {STEPS_FLOW.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} className="bg-white p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-md bg-ink-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                  {s.n}
                </span>
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Passo {s.n}</span>
              </div>
              <h3 className="text-base font-bold text-ink-800 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMPARAÇÃO COM ALTERNATIVAS */}
      <section className="bg-ink-50 border-y border-ink-200 py-20 sm:py-28">
        <div className="landing-container">
          <Reveal className="mb-12 max-w-2xl">
            <p className="section-label mb-3">Por que FinCheck</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter mb-4">
              Como você cuidaria do seu financeiro hoje?
            </h2>
            <p className="text-ink-500 text-base leading-relaxed">
              Tem várias opções. A maioria é cara, demorada ou inacessível pra empresa pequena.
            </p>
          </Reveal>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-ink-200 rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-200">
                  <th className="text-left px-5 py-4 font-semibold text-ink-700 text-xs uppercase tracking-wider">Opção</th>
                  <th className="text-left px-5 py-4 font-semibold text-ink-700 text-xs uppercase tracking-wider">Custo médio</th>
                  <th className="text-left px-5 py-4 font-semibold text-ink-700 text-xs uppercase tracking-wider">Tempo até ver resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                <Reveal as="tr" className="text-ink-600">
                  <td className="px-5 py-4">Contador pra reunião extra</td>
                  <td className="px-5 py-4 font-mono text-ink-700">R$ 300 – 800/h</td>
                  <td className="px-5 py-4">Dias até semanas</td>
                </Reveal>
                <Reveal as="tr" delay={80} className="text-ink-600">
                  <td className="px-5 py-4">Consultor financeiro</td>
                  <td className="px-5 py-4 font-mono text-ink-700">R$ 5k – 15k/projeto</td>
                  <td className="px-5 py-4">Semanas até meses</td>
                </Reveal>
                <Reveal as="tr" delay={160} className="text-ink-600">
                  <td className="px-5 py-4">Sistema ERP financeiro</td>
                  <td className="px-5 py-4 font-mono text-ink-700">R$ 200 – 800/mês</td>
                  <td className="px-5 py-4">Meses pra implementar</td>
                </Reveal>
                <Reveal as="tr" delay={240} className="text-ink-600">
                  <td className="px-5 py-4">Planilha do cunhado</td>
                  <td className="px-5 py-4 font-mono text-ink-700">"De graça"</td>
                  <td className="px-5 py-4">Provavelmente nunca</td>
                </Reveal>
                <Reveal as="tr" delay={320} className="bg-money-50 border-t-2 border-money-200">
                  <td className="px-5 py-4 font-bold text-ink-900">FinCheck</td>
                  <td className="px-5 py-4 font-mono font-bold text-money-700">Gratuito</td>
                  <td className="px-5 py-4 font-bold text-ink-900">5 minutos</td>
                </Reveal>
              </tbody>
            </table>
          </div>

          <Reveal delay={200} className="text-center mt-8">
            <p className="text-sm text-ink-500">
              Não substitui contador nem consultor — mas resolve a pergunta diária:<br />
              <strong className="text-ink-800">"Como tá meu negócio agora?"</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-container py-20 sm:py-28">
        <Reveal className="mb-12 max-w-2xl">
          <p className="section-label mb-3">O que você recebe</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter mb-4">
            Um relatório que seu contador respeitaria
          </h2>
          <p className="text-ink-500 text-base leading-relaxed">
            Mas escrito pra você ler num café, sem precisar de tradução.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80} className="bg-white border border-ink-200 rounded-xl p-6 hover:border-ink-300 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Icon d={f.d} size={18} />
              </div>
              <h3 className="text-base font-semibold text-ink-800 mb-2">{f.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ink-50 border-y border-ink-200 py-20 sm:py-28">
        <div className="landing-container-narrow">
          <Reveal className="mb-10 text-center">
            <p className="section-label mb-3">Perguntas frequentes</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter">
              O que você quer saber antes de começar
            </h2>
          </Reveal>

          <div className="space-y-2">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} delay={i * 50}>
                <details className="group bg-white border border-ink-200 rounded-lg overflow-hidden hover:border-ink-300 transition-colors">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                    <span className="text-[15px] font-semibold text-ink-800">{item.q}</span>
                    <svg className="w-4 h-4 text-ink-400 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-ink-500 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="landing-container py-20 sm:py-28">
        <Reveal className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-[2.6rem] font-bold text-ink-900 tracking-tighter mb-5 leading-tight">
            Cinco minutos agora<br />
            podem te poupar meses no escuro.
          </h2>
          <p className="text-ink-500 text-lg leading-relaxed mb-8">
            Crie sua conta grátis, responda 7 perguntas e receba seu diagnóstico completo.
          </p>
          <button onClick={onEnter} className="btn-cta">
            Começar diagnóstico — gratuito
            <ArrowRight size={16} />
          </button>
          <p className="text-xs text-ink-400 mt-5">
            Sem letra miúda. Sem upsell escondido.
          </p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-200 py-10">
        <div className="landing-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-ink-900 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M7 5 V19 M7 5 H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 12 H17" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-bold text-ink-800 text-sm">FinCheck</span>
          </div>
          <p className="text-xs text-ink-400 text-center">
            Feito pra empresas brasileiras · Dados não saem do seu dispositivo
          </p>
        </div>
      </footer>
    </div>
  );
}
