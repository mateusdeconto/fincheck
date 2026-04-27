function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const FEATURES = [
  {
    title: 'Diagnóstico com IA',
    desc: 'Relatório em linguagem humana — fluxo de caixa, lucratividade, endividamento e os pontos críticos do seu negócio.',
    d: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  },
  {
    title: 'Benchmarks setoriais',
    desc: 'Compare suas margens com a média de PMEs do mesmo segmento. Saiba onde você está em relação ao mercado.',
    d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    title: 'DRE pronta em Excel',
    desc: 'Demonstração de Resultado do Exercício gerada automaticamente, formatada e pronta para mandar pro contador.',
    d: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    title: 'Consultor IA no chat',
    desc: 'Tire dúvidas com uma IA que conhece seus números e responde de forma específica para o seu negócio.',
    d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
  },
  {
    title: 'Alertas de risco',
    desc: 'Identificação automática dos riscos críticos: caixa negativo, margem abaixo do mínimo, endividamento excessivo.',
    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  {
    title: 'Acompanhamento mensal',
    desc: 'Veja a evolução do seu negócio mês a mês e meça se as melhorias realmente surtiram efeito.',
    d: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
];

const STEPS_FLOW = [
  {
    n: '01',
    title: 'Informe os números do mês',
    desc: 'Responda 7 perguntas simples sobre receita, custos e despesas. Em linguagem de dono, sem precisar ser contador.',
    d: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  },
  {
    n: '02',
    title: 'A IA analisa seu negócio',
    desc: 'Calculamos margens, lucro líquido real, ponto de equilíbrio — e comparamos com benchmarks do seu setor.',
    d: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
  },
  {
    n: '03',
    title: 'Receba diagnóstico + DRE',
    desc: 'Relatório completo em linguagem humana, exporta em PDF/Excel e ainda pode tirar dúvidas com o consultor IA.',
    d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const FAQS = [
  {
    q: 'Os meus dados ficam salvos em algum servidor?',
    a: 'Não. Tudo o que você digita roda no seu próprio dispositivo. O backend só recebe os números no momento de gerar o diagnóstico — sem armazenar nada. Histórico mensal e diagnósticos ficam no seu navegador (localStorage).',
  },
  {
    q: 'É realmente gratuito?',
    a: 'Sim, 100% gratuito e sem cadastro. O FinCheck foi feito para ajudar pequenos empresários a entender seus números — sem vender curso, sem upsell, sem coleta de dados.',
  },
  {
    q: 'Quanto tempo leva pra fazer?',
    a: 'Cerca de 5 minutos. São 7 perguntas curtas. Você precisa ter em mãos: faturamento do mês, custos da operação, gastos fixos, saldo da conta e parcelas de dívidas (se tiver).',
  },
  {
    q: 'O diagnóstico substitui um contador?',
    a: 'Não. O FinCheck é uma ferramenta de gestão e auto-diagnóstico — útil pra entender saúde financeira e tomar decisões rápidas. Um contador continua essencial para impostos, obrigações fiscais e estratégia de longo prazo.',
  },
  {
    q: 'Que tipo de empresa pode usar?',
    a: 'PMEs brasileiras de qualquer setor: restaurantes, varejo, serviços, saúde, beleza, tecnologia, construção, educação, indústria. Os benchmarks setoriais são adaptados para cada um.',
  },
];

export default function Landing({ onEnter }) {
  return (
    <div className="landing-root">

      {/* ── HEADER ── */}
      <header className="landing-header">
        <a href="#" className="landing-logo" onClick={(e) => e.preventDefault()}>
          <span className="landing-logo-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 6 L8 6 L8 18 L16 18 M8 12 L14 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="landing-logo-text">FinCheck</span>
        </a>
        <button onClick={onEnter} className="btn-quiet">Acessar →</button>
      </header>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-eyebrow">
          <span className="landing-eyebrow-dot" />
          Diagnóstico financeiro inteligente para PMEs
        </div>

        <h1 className="landing-hero-title">
          Saiba se seu negócio está
          <br />
          <em>saudável financeiramente</em>
        </h1>

        <p className="landing-hero-subtitle">
          7 perguntas simples. Diagnóstico completo gerado por IA. Benchmarks do seu setor,
          alertas de risco e recomendações práticas — em menos de 5 minutos.
        </p>

        <button onClick={onEnter} className="landing-cta">
          Iniciar diagnóstico gratuito
          <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={18} />
        </button>

        <p className="landing-cta-note">
          Sem cadastro · Sem cartão · Seus dados ficam no seu dispositivo
        </p>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="landing-trust">
        <div className="landing-trust-item">
          <Icon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" size={14} />
          Dados apenas no seu dispositivo
        </div>
        <div className="landing-trust-item">
          <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={14} />
          Benchmarks SEBRAE / IBGE
        </div>
        <div className="landing-trust-item">
          <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={14} />
          Diagnóstico gerado por IA Claude
        </div>
      </div>

      {/* ── COMO FUNCIONA ── */}
      <section className="landing-how">
        <div className="landing-container">
          <p className="landing-section-eyebrow">Como funciona</p>
          <h2 className="landing-section-title">Três passos para entender seus números</h2>
          <p className="landing-section-subtitle">
            Sem planilhas complicadas, sem consultor caro, sem espera.
          </p>

          <div className="landing-steps">
            {STEPS_FLOW.map((s) => (
              <div key={s.n} className="landing-step">
                <span className="landing-step-num">{s.n}</span>
                <div className="landing-step-icon">
                  <Icon d={s.d} size={20} />
                </div>
                <h3 className="landing-step-title">{s.title}</h3>
                <p className="landing-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-features">
        <div className="landing-container">
          <p className="landing-section-eyebrow">O que você recebe</p>
          <h2 className="landing-section-title">Tudo que seu negócio precisa para decidir melhor</h2>
          <p className="landing-section-subtitle">
            Um relatório completo, exportável, em linguagem que você entende.
          </p>

          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-feature">
                <div className="landing-feature-icon">
                  <Icon d={f.d} size={20} />
                </div>
                <div>
                  <h3 className="landing-feature-title">{f.title}</h3>
                  <p className="landing-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / QUOTE ── */}
      <section className="landing-proof">
        <div className="landing-container-narrow">
          <p className="landing-section-eyebrow">Por que FinCheck</p>
          <blockquote className="landing-quote">
            "60% das pequenas empresas no Brasil fecham antes de 5 anos — quase sempre por não saberem
            ler os próprios números. O FinCheck mostra, em 5 minutos, o que sua planilha esconde."
          </blockquote>
          <p className="landing-quote-author">
            <strong>Inspirado em dados SEBRAE</strong> — sobre mortalidade de PMEs brasileiras
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-faq">
        <div className="landing-container-narrow">
          <p className="landing-section-eyebrow">Perguntas frequentes</p>
          <h2 className="landing-section-title">Tudo que você quer saber antes de começar</h2>
          <div className="landing-faq-list" style={{ marginTop: '2.5rem' }}>
            {FAQS.map((item) => (
              <details key={item.q} className="landing-faq-item">
                <summary>{item.q}</summary>
                <div className="landing-faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-box">
          <h2 className="landing-cta-box-title">Pronto para conhecer seus números?</h2>
          <p className="landing-cta-box-subtitle">
            Gratuito, sem cadastro, sem jargão. Em 5 minutos você tem um diagnóstico completo do seu negócio.
          </p>
          <button onClick={onEnter} className="landing-cta-light">
            Começar agora
            <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-mark">
          <span style={{ width: '1.4rem', height: '1.4rem', borderRadius: '0.35rem', background: 'rgba(214,97,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M16 6 L8 6 L8 18 L16 18 M8 12 L14 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="landing-footer-text">FinCheck</span>
        </div>
        <p className="landing-footer-note">
          Seus dados ficam apenas no seu dispositivo · Nenhuma informação é armazenada em servidores
        </p>
      </footer>
    </div>
  );
}
