import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-money-500 flex items-center justify-center shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 5 V19 M7 5 H17" stroke="white" strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 12 H15" stroke="white" strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </svg>
      </div>
      <span className="font-bold text-ink-800 text-[17px] tracking-tight">FinCheck</span>
    </div>
  );
}

export default function Auth({ onComplete }) {
  const [tab, setTab]         = useState('register');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (tab === 'register') {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.session) {
          onComplete(data.session);
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar e depois entre.');
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onComplete(data.session);
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-ink-200">
          {[
            { id: 'register', label: 'Criar conta' },
            { id: 'login',    label: 'Entrar' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
              className={`py-4 text-sm font-semibold transition-all duration-150 relative ${
                tab === t.id
                  ? 'text-ink-900 bg-white'
                  : 'text-ink-400 bg-ink-50 hover:text-ink-700 hover:bg-ink-100'
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-money-500" />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ink-900 mb-1">
              {tab === 'register' ? 'Crie sua conta grátis' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-sm text-ink-400">
              {tab === 'register'
                ? 'Diagnóstico financeiro completo em 5 minutos.'
                : 'Continue de onde parou.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 border border-ink-200 rounded-xl text-sm text-ink-900
                           placeholder:text-ink-300 bg-ink-50
                           focus:outline-none focus:ring-2 focus:ring-money-300 focus:border-money-400
                           focus:bg-white transition-all duration-150"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  className="w-full px-4 py-3 pr-11 border border-ink-200 rounded-xl text-sm text-ink-900
                             placeholder:text-ink-300 bg-ink-50
                             focus:outline-none focus:ring-2 focus:ring-money-300 focus:border-money-400
                             focus:bg-white transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={1.8}>
                    {showPwd
                      ? <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      : <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-loss-50 border border-loss-100 rounded-xl">
                <svg className="w-4 h-4 text-loss-500 flex-shrink-0 mt-0.5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-loss-700">{error}</p>
              </div>
            )}

            {/* Sucesso */}
            {success && (
              <div className="flex items-start gap-2.5 p-3.5 bg-money-50 border border-money-200 rounded-xl">
                <svg className="w-4 h-4 text-money-600 flex-shrink-0 mt-0.5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-money-800">{success}</p>
              </div>
            )}

            {/* Botão submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-money-500 hover:bg-money-600 text-white text-sm font-bold rounded-xl
                         active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150 shadow-money flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {tab === 'register' ? 'Criando conta…' : 'Entrando…'}
                </>
              ) : (
                tab === 'register' ? 'Criar conta grátis →' : 'Entrar na minha conta →'
              )}
            </button>
          </form>

          <p className="text-xs text-ink-400 text-center mt-5 leading-relaxed">
            Seus dados financeiros nunca são compartilhados com terceiros.
          </p>
        </div>
      </div>
    </div>
  );
}

function translateError(msg) {
  if (!msg) return 'Erro desconhecido. Tente novamente.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed'))
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  if (m.includes('user already registered') || m.includes('already registered'))
    return 'Este e-mail já tem uma conta. Use a aba "Entrar".';
  if (m.includes('password should be at least'))
    return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('rate limit'))
    return 'Muitas tentativas. Aguarde alguns minutos.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Erro de conexão. Verifique sua internet.';
  return msg;
}
