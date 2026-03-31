import { useEffect, useRef, useState } from 'react';

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

export default function Loading({ businessData, financialData, onComplete, onError }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false); // evita chamada dupla no StrictMode

  // Rotaciona as mensagens de loading
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Inicia o streaming do diagnóstico ao montar
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchDiagnosis() {
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
        setError(err.message || 'Erro desconhecido');
      }
    }

    fetchDiagnosis();
  }, [businessData, financialData, onComplete]);

  if (error) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Algo deu errado</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={onError} className="btn-primary">
          ← Tentar novamente
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
