import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mensagens que aparecem enquanto a IA processa — rotacionam a cada 3s
 */
const LOADING_MESSAGES = [
  'Analisando o financeiro do seu negócio...',
  'Calculando margens e indicadores...',
  'Identificando pontos de atenção...',
  'Preparando recomendações práticas...',
  'Quase pronto! Finalizando diagnóstico...',
];

const MAX_AUTO_RETRIES = 2;

function isOverloadedMsg(msg) {
  return msg && (msg.toLowerCase().includes('sobrecarregad') || msg.toLowerCase().includes('overload'));
}

export default function Loading({ businessData, financialData, onComplete, onError }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError]               = useState(null);
  const [countdown, setCountdown]       = useState(null); // segundos até auto-retry
  const autoRetryCount                  = useRef(0);
  const fetchedRef                      = useRef(false);

  // Rotaciona as mensagens de loading
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchDiagnosis = useCallback(async () => {
    setError(null);
    setCountdown(null);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...businessData,
            ...financialData,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Lê o stream SSE
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onComplete(fullText);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) fullText += parsed.text;
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
              // linha SSE inválida, ignora
            }
          }
        }

        // Fallback se [DONE] não foi enviado
        if (fullText) onComplete(fullText);
    } catch (err) {
      console.error('Erro no diagnóstico:', err);
      const msg = err.message || 'Erro desconhecido';

      if (isOverloadedMsg(msg) && autoRetryCount.current < MAX_AUTO_RETRIES) {
        // Auto-retry com countdown de 10s
        autoRetryCount.current += 1;
        let secs = 10;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessData, financialData, onComplete]);

  // Inicia o streaming ao montar
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchDiagnosis();
  }, [fetchDiagnosis]);

  // Tela de countdown (auto-retry)
  if (countdown !== null) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">A IA está sobrecarregada</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Muitas pessoas usando ao mesmo tempo.<br />
          Tentando novamente automaticamente em…
        </p>
        <div className="w-16 h-16 rounded-full border-4 border-navy-200 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-black text-navy-600">{countdown}</span>
        </div>
        <button onClick={() => { setCountdown(null); fetchDiagnosis(); }} className="btn-back text-sm py-3">
          Tentar agora
        </button>
      </div>
    );
  }

  if (error) {
    const overloaded = isOverloadedMsg(error);
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="text-4xl mb-4">{overloaded ? '🔄' : '😕'}</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {overloaded ? 'IA temporariamente indisponível' : 'Algo deu errado'}
        </h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
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
        <button onClick={onError} className="btn-back mt-3 text-sm py-3">
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <div className="card p-10 text-center animate-fade-in">
      {/* Animação de loading */}
      <div className="flex justify-center mb-8">
        <div className="relative w-20 h-20">
          {/* Círculo externo pulsando */}
          <div className="absolute inset-0 rounded-full bg-navy-100 animate-ping opacity-30" />
          {/* Círculo interno girando */}
          <div className="absolute inset-2 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin" />
          {/* Ícone central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Nome do negócio */}
      <p className="text-navy-600 text-sm font-medium mb-2 uppercase tracking-wide">
        {businessData.businessName}
      </p>

      {/* Mensagem rotativa */}
      <h2 className="text-xl font-bold text-slate-800 mb-3 min-h-[56px] transition-all duration-500">
        {LOADING_MESSAGES[messageIndex]}
      </h2>

      <p className="text-slate-400 text-sm">
        A IA está analisando seus números. Isso leva alguns segundos.
      </p>

      {/* Dots de progresso */}
      <div className="flex justify-center gap-2 mt-8">
        {LOADING_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === messageIndex ? 'bg-navy-600 scale-125' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
