export default function Landing({ onEnter }) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════
          HERO — fundo navy escuro
      ══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f2442 45%, #0d1a36 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* glow top */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
        }} />

        {/* ── Header ── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.1rem 2rem', maxWidth: '1100px', margin: '0 auto',
          position: 'relative', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '2.1rem', height: '2.1rem', borderRadius: '0.55rem',
              background: 'linear-gradient(135deg, #3a67a5, #1e3a5f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(58,103,165,0.4)',
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'white', letterSpacing: '-0.02em' }}>
              FinCheck
            </span>
          </div>

          <button onClick={onEnter} style={{
            padding: '0.55rem 1.25rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
            fontSize: '0.82rem', fontWeight: 600, transition: 'background 0.15s',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            Acessar →
          </button>
        </header>

        {/* ── Hero content ── */}
        <div style={{
          maxWidth: '760px', margin: '0 auto', padding: '5rem 1.5rem 6rem',
          textAlign: 'center', position: 'relative', zIndex: 10,
        }}>
          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(96,165,250,0.3)',
            padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '2rem',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#93c5fd', letterSpacing: '0.03em' }}>
              Diagnóstico financeiro inteligente para PMEs
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)',
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-0.035em', color: 'white',
            marginBottom: '1.4rem',
          }}>
            Saiba se seu negócio está{' '}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              saudável financeiramente
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.75,
            color: 'rgba(148,163,184,0.9)', maxWidth: '560px', margin: '0 auto 2.5rem',
          }}>
            7 perguntas simples. Diagnóstico completo com IA. Benchmarks do seu setor,
            alertas de risco e recomendações — em menos de 5 minutos, sem jargão contábil.
          </p>

          {/* CTA principal */}
          <button onClick={onEnter} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
            padding: '1rem 2.2rem', borderRadius: '0.85rem', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white', fontSize: '1.05rem', fontWeight: 700,
            boxShadow: '0 4px 24px rgba(37,99,235,0.45), 0 1px 0 rgba(255,255,255,0.12) inset',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.45)'; }}>
            Acessar a FinCheck
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <p style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.45)', marginTop: '0.9rem' }}>
            Sem cadastro · 100% gratuito · Seus dados ficam no seu dispositivo
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0',
            marginTop: '3.5rem', flexWrap: 'wrap',
          }}>
            {[
              { value: '7', label: 'perguntas' },
              { value: '5 min', label: 'diagnóstico' },
              { value: '10+', label: 'segmentos' },
              { value: '100%', label: 'gratuito' },
            ].map((s, i) => (
              <div key={s.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0 2rem',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.55)', fontWeight: 500, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════ */}
      <div style={{
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
        padding: '1rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '2rem', flexWrap: 'wrap',
        }}>
          {[
            { icon: '🔒', text: 'Dados apenas no seu dispositivo' },
            { icon: null, text: 'Benchmarks baseados em dados SEBRAE e IBGE' },
            { icon: null, text: 'Diagnóstico gerado por IA Claude (Anthropic)' },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
            }}>
              {i > 0 && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {i === 0 && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          COMO FUNCIONA — 3 passos
      ══════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Como funciona
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em',
            marginBottom: '3rem',
          }}>
            Três passos para entender seus números
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                step: '01',
                title: 'Informe os dados do negócio',
                desc: 'Responda 7 perguntas simples sobre receita, custos e despesas. Sem precisar ser contador.',
                color: '#2563eb', bg: '#eff6ff',
                icon: (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'A IA analisa sua empresa',
                desc: 'Nossa IA processa os dados, calcula indicadores financeiros e compara com benchmarks do seu setor.',
                color: '#7c3aed', bg: '#f5f3ff',
                icon: (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Receba o diagnóstico completo',
                desc: 'Leia o relatório em linguagem humana, exporte a DRE em Excel e tire dúvidas com o consultor IA.',
                color: '#059669', bg: '#ecfdf5',
                icon: (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '1.15rem', padding: '1.75rem',
                position: 'relative', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#e2e8f0', letterSpacing: '-0.05em', lineHeight: 1 }}>
                    {item.step}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.97rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.83rem', lineHeight: 1.65, color: '#64748b' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES — o que você recebe
      ══════════════════════════════════════ */}
      <section style={{ background: '#f8fafc', padding: '5rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            O que você recebe
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em',
            marginBottom: '0.75rem',
          }}>
            Tudo que seu negócio precisa para decidir melhor
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#64748b', marginBottom: '3rem', maxWidth: '520px', margin: '0 auto 3rem' }}>
            Sem planilhas complicadas, sem consultor caro, sem espera.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.1rem' }}>
            {[
              { color: '#2563eb', bg: '#eff6ff', title: 'Diagnóstico com IA', desc: 'Relatório completo em linguagem humana: fluxo de caixa, lucratividade, endividamento e pontos críticos do seu negócio.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg> },
              { color: '#7c3aed', bg: '#f5f3ff', title: 'Benchmarks Setoriais', desc: 'Compare suas margens com a média de PMEs do mesmo segmento. Saiba exatamente onde você está em relação ao mercado.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
              { color: '#059669', bg: '#ecfdf5', title: 'DRE em Excel', desc: 'Gere automaticamente a Demonstração de Resultado do Exercício e exporte para Excel com um clique.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
              { color: '#d97706', bg: '#fffbeb', title: 'Consultor IA no Chat', desc: 'Após o diagnóstico, converse com uma IA que conhece os seus números e responde dúvidas específicas do seu negócio.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
              { color: '#dc2626', bg: '#fef2f2', title: 'Alertas de Risco', desc: 'Identificação automática dos riscos mais críticos: caixa negativo, margem abaixo do mínimo, endividamento excessivo.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> },
              { color: '#0891b2', bg: '#ecfeff', title: 'Acompanhamento Mensal', desc: 'Acompanhe a evolução financeira mês a mês e veja se as melhorias estão surtindo efeito no seu negócio.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem',
                padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.65rem', flexShrink: 0,
                  background: f.bg, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#64748b' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA FINAL — navy
      ══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f2442 100%)',
        padding: '5rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '300px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900,
            color: 'white', letterSpacing: '-0.03em', marginBottom: '0.85rem',
          }}>
            Pronto para conhecer seus números?
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.8)', marginBottom: '2.25rem', lineHeight: 1.65 }}>
            Gratuito, sem cadastro e sem jargão contábil. Em 5 minutos você tem um diagnóstico completo.
          </p>
          <button onClick={onEnter} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
            padding: '1.05rem 2.4rem', borderRadius: '0.85rem', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white', fontSize: '1.05rem', fontWeight: 700,
            boxShadow: '0 4px 24px rgba(37,99,235,0.5)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.5)'; }}>
            Acessar a FinCheck agora
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ background: '#0a1628', padding: '1.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '1.4rem', height: '1.4rem', borderRadius: '0.35rem', background: 'rgba(58,103,165,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>FinCheck</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.3)' }}>
          Seus dados ficam apenas no seu dispositivo · Nenhuma informação é armazenada em servidores
        </p>
      </footer>

    </div>
  );
}
