import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Auth({ onComplete }) {
  const [tab, setTab] = useState('register'); // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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
      const msg = translateError(err.message);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <span className="w-8 h-8 rounded-md bg-ink-900 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M7 5 V19 M7 5 H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 12 H17" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-bold text-ink-800 text-lg tracking-tight">FinCheck</span>
      </div>

      <div className="bg-white border border-ink-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink-900 mb-1">
          {tab === 'register' ? 'Crie sua conta' : 'Entre na sua conta'}
        </h1>
        <p className="text-sm text-ink-500 mb-6">
          {tab === 'register'
            ? 'Gratuito. Salve seu diagnóstico e acompanhe sua evolução.'
            : 'Continue de onde parou.'}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-ink-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === 'register'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            Criar conta
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === 'login'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            Entrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3.5 py-2.5 border border-ink-300 rounded-lg text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              className="w-full px-3.5 py-2.5 border border-ink-300 rounded-lg text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-loss-50 border border-loss-100 rounded-lg">
              <svg className="w-4 h-4 text-loss-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-loss-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3 bg-money-50 border border-money-100 rounded-lg">
              <svg className="w-4 h-4 text-money-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-money-700">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ink-900 text-white text-sm font-semibold rounded-lg hover:bg-ink-800 active:bg-ink-950 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {tab === 'register' ? 'Criando conta…' : 'Entrando…'}
              </>
            ) : (
              tab === 'register' ? 'Criar conta grátis' : 'Entrar'
            )}
          </button>
        </form>

        <p className="text-xs text-ink-400 text-center mt-5 leading-relaxed">
          Seus dados financeiros nunca são compartilhados.
        </p>
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
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Erro de conexão. Verifique sua internet.';
  return msg;
}
