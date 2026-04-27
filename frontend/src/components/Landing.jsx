function Icon({ d, size = 18, className = '' }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} className={className}>
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
    desc: 'Suas margens versus a média de PMEs do mesmo segmento (dados SEBRAE/IBGE). Você sabe exatamente onde está.',
    d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    title: 'DRE pronta pro contador',
    desc: 'Demonstração de Resultado em Excel formatado, com totais e categorias. Manda pro seu contador sem precisar refazer nada.',
    d: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    title: 'Pergunte o que quiser',
    desc: 'Depois do diagnóstico, abre um chat com a IA que conhece seus números. "Como melhoro minha margem?" — ela responde com base nos seus dados.',
    d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
  },
  {
    title: 'Risco no caixa, antes de virar problema',
    desc: 'Identificamos automaticamente os pontos críticos: margem baixa, caixa apertado, dívidas demais, mistura conta PJ/PF.',
    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  {
    title: 'Veja a evolução mês a mês',
    desc: 'Refaça o diagnóstico todo mês. A gente guarda o histórico e mostra se você tá melhorando — sem precisar criar conta.',
    d: 'M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941',
  },
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
    q: 'Os meus números vão pra algum servidor?',
    a: 'Não armazenamos nada. Seus dados rodam no seu próprio navegador. O backend recebe os números só no momento de gerar o diagnóstico (pra processar com a IA) e descarta logo depois. Histórico mensal fica salvo só no seu dispositivo.',
  },
  {
    q: 'É realmente gratuito? Onde tá a pegadinha?',
    a: 'Sem pegadinha. É 100% gratuito hoje, sem cadastro, sem cartão. Foi feito por brasileiros que cansaram de ver pequenas empresas fechando por falta de visão financeira. Se um dia tiver versão paga, será opcional — você decide.',
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
    a: 'Pode. A análise é boa, mas é orientativa — não substitui julgamento humano. Use como ponto de partida pra suas decisões, não como verdade absoluta. Decisões importantes (corte de pessoal, empréstimos grandes) sempre confira com contador ou consultor.',
  },
];

export default function Landing({ onEnter }) {
  return (
    <div className="landing-root">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-ink-100">
        <div className="landing-container flex items-center justify-between h-14">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-ink-900 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M16 6 H8 V18 H16 M8 12 H14" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </span>
            <span className="font-bold text-ink-800 text-[15px] tracking-tight">FinCheck</span>
          </a>
          <button onClick={onEnter} className="btn-quiet">Começar →</button>
        </div>
      </header>

      {/* HERO */}
      <section className="landing-container pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-ink-100 text-ink-600 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-money-500" />
            100% gratuito · sem cadastro
          </div>

          <h1 className="text-[2.4rem] sm:text-5xl md:text-[3.5rem] font-extrabold text-ink-900 leading-[1.05] tracking-tightest mb-5">
            Seu negócio dá lucro
            <br />
            <span className="text-brand-500">de verdade?</span>
          </h1>

          <p className="text-lg text-ink-500 max-w-xl leading-relaxed mb-8">
            Em 5 minutos, o FinCheck olha seus números e te diz exatamente onde está o lucro,
            onde está sangrando dinheiro e o que fazer essa semana. Sem jargão de contador.
          </p>

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
            Não pedimos email. Não pedimos cartão. Seus números ficam no seu dispositivo.
          </p>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-y border-ink-200 bg-ink-50">
        <div className="landing-container py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <Icon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" size={16} className="text-ink-400 flex-shrink-0" />
            <span className="text-ink-600">Dados ficam no seu dispositivo</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" size={16} className="text-ink-400 flex-shrink-0" />
            <span className="text-ink-600">Benchmarks SEBRAE/IBGE</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" size={16} className="text-ink-400 flex-shrink-0" />
            <span className="text-ink-600">Análise gerada por IA Claude</span>
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="landing-container py-20 sm:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="section-label mb-3">Como funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter mb-4">
            Três passos simples. Cinco minutos.
          </h2>
          <p className="text-ink-500 text-base leading-relaxed">
            Sem planilha pra preencher. Sem consultor pra contratar. Sem cadastro pra fazer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded-xl overflow-hidden">
          {STEPS_FLOW.map((s) => (
            <div key={s.n} className="bg-white p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-md bg-ink-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                  {s.n}
                </span>
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Passo {s.n}</span>
              </div>
              <h3 className="text-base font-bold text-ink-800 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-ink-50 border-y border-ink-200 py-20 sm:py-28">
        <div className="landing-container">
          <div className="mb-12 max-w-2xl">
            <p className="section-label mb-3">O que você recebe</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter mb-4">
              Um relatório que seu contador respeitaria
            </h2>
            <p className="text-ink-500 text-base leading-relaxed">
              Mas escrito pra você ler num café, sem precisar de tradução.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-ink-200 rounded-xl p-6 hover:border-ink-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <Icon d={f.d} size={18} />
                </div>
                <h3 className="text-base font-semibold text-ink-800 mb-2">{f.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF — citação SEBRAE */}
      <section className="landing-container py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-4 text-center">Por que isso importa</p>
          <p className="text-2xl sm:text-3xl font-semibold text-ink-800 leading-snug tracking-tight text-center">
            6 em cada 10 pequenas empresas brasileiras fecham antes de completar 5 anos.
            A causa mais comum não é falta de cliente — é não saber ler os próprios números.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-ink-500">
            <div className="w-10 h-px bg-ink-300" />
            <span>Dados SEBRAE sobre mortalidade de PMEs no Brasil</span>
            <div className="w-10 h-px bg-ink-300" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ink-50 border-y border-ink-200 py-20 sm:py-28">
        <div className="landing-container-narrow">
          <div className="mb-10 text-center">
            <p className="section-label mb-3">Perguntas frequentes</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter">
              O que você quer saber antes de começar
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((item) => (
              <details key={item.q} className="group bg-white border border-ink-200 rounded-lg overflow-hidden hover:border-ink-300 transition-colors">
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="landing-container py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tighter mb-5">
            Pronto pra ver seus números com clareza?
          </h2>
          <p className="text-ink-500 text-lg leading-relaxed mb-8">
            Cinco minutos do seu tempo. Diagnóstico completo no fim.
            E zero email pra cancelar depois.
          </p>
          <button onClick={onEnter} className="btn-cta">
            Começar agora — gratuito
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-200 py-10">
        <div className="landing-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-ink-900 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M16 6 H8 V18 H16 M8 12 H14" strokeLinecap="square" strokeLinejoin="miter" />
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
