import { useCallback, useEffect, useRef, useState } from 'react';

const LOADING_MESSAGES = [
  'Lendo seus números…',
  'Calculando margens e indicadores…',
  'Comparando com benchmarks do setor…',
  'Identificando pontos de atenção…',
  'Preparando recomendações práticas…',
  'Quase pronto — finalizando o relatório…',
];

const MAX_AUTO_RETRIES = 4;

function isOverloadedMsg(msg) {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return lower.includes('sobrecarregad') || lower.includes('overload');
}

export default function Loading({ businessData, financialData, onComplete, onError }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError]               = useState(null);
  const [countdown, setCountdown]       = useState(null);
  const autoRetryCount                  = useRef(0);
  const fetchedRef                      = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchDiagnosis = useCallback(async () => {
    setError(null);
    setCountdown(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s — espaço para retry interno do backend

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...businessData, ...financialData }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('Você gerou muitos diagnósticos seguidos. Aguarde alguns minutos e tente novamente.');
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            clearTimeout(timeout);
            if (fullText) onComplete(fullText);
            else throw new Error('Resposta vazia da IA. Tente novamente.');
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) fullText += parsed.text;
          } catch (parseErr) {
            if (parseErr.message && !parseErr.message.toLowerCase().includes('json')) throw parseErr;
          }
        }
      }

      clearTimeout(timeout);
      if (fullText) onComplete(fullText);
      else throw new Error('Conexão interrompida antes do fim. Tente novamente.');
    } catch (err) {
      clearTimeout(timeout);
      console.error('Erro no diagnóstico:', err);
      const msg = err.name === 'AbortError'
        ? 'Tempo esgotado. Verifique sua conexão e tente novamente.'
        : err.message || 'Erro desconhecido';

      if (isOverloadedMsg(msg) && autoRetryCount.current < MAX_AUTO_RETRIES) {
        autoRetryCount.current += 1;
        let secs = 15;
        setCountdown(secs);
        const tick = setInterval(() => {
          secs -= 1;
          if (secs <= 0) {
            clearInterval(tick);
            setCountdown(null);
            fetchDiagnosis();
          } else {
            setCountdown(secs);
          }
        }, 1000);
      } else {
        setError(msg);
      }
    }
  }, [businessData, financialData, onComplete]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchDiagnosis();
  }, [fetchDiagnosis]);

  if (countdown !== null) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-50 border border-accent-100 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-accent-600 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-2">A IA está sobrecarregada</h2>
        <p className="text-ink-500 text-sm mb-6 leading-relaxed">
          Muitas pessoas usando ao mesmo tempo. Tentando novamente em…
        </p>
        <div className="w-16 h-16 rounded-full border-2 border-accent-200 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-black text-accent-600 font-mono">{countdown}</span>
        </div>
        <button onClick={() => { setCountdown(null); fetchDiagnosis(); }} className="btn-back">
          Tentar agora
        </button>
      </div>
    );
  }

  if (error) {
    const overloaded = isOverloadedMsg(error);
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-2">
          {overloaded ? 'IA temporariamente indisponível' : 'Algo deu errado'}
        </h2>
        <p className="text-ink-500 text-sm mb-6 leading-relaxed">
          {overloaded
            ? 'A IA da Anthropic está com alta demanda agora. Aguarde alguns segundos e tente novamente — costuma resolver rapidamente.'
            : error}
        </p>
        <button onClick={() => { autoRetryCount.current = 0; fetchDiagnosis(); }} className="btn-primary">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Tentar novamente
          </span>
        </button>
        <button onClick={onError} className="btn-back mt-3">
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <div className="card p-10 text-center animate-fade-in">
      <div className="flex justify-center mb-7">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-accent-100 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full border-4 border-ink-100 border-t-accent-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
        </div>
      </div>

      <p className="eyebrow-muted mb-2">{businessData.businessName}</p>

      <h2 className="font-display text-2xl font-semibold text-ink-800 mb-3 min-h-[64px] tracking-tighter">
        {LOADING_MESSAGES[messageIndex]}
      </h2>

      <p className="text-ink-500 text-sm">
        A IA está analisando seus números. Isso leva alguns segundos.
      </p>

      <div className="flex justify-center gap-2 mt-8">
        {LOADING_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === messageIndex ? 'bg-accent-500 w-6' : 'bg-ink-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
