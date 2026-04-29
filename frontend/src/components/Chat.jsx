import { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUESTIONS = [
  'Por que minha margem está baixa?',
  'Como aumentar meu lucro esse mês?',
  'Meu nível de dívida é perigoso?',
  'Qual deveria ser meu ponto de equilíbrio?',
  'Como reduzir meus custos fixos?',
];

export default function Chat({ businessData, financialData, diagnosis, allDiagnoses = [], accessToken, onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Olá. Já analisei os números de **${businessData.businessName}**. Pode me perguntar qualquer coisa sobre o diagnóstico ou sobre o financeiro do seu negócio — vou responder com base nos seus dados reais.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function sendMessage(messageText) {
    const text = messageText || input.trim();
    if (!text || isStreaming) return;

    setInput('');
    const userMessage = { role: 'user', content: text };
    const historyForAPI = messages.slice(1).map(m => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: historyForAPI,
          businessData,
          financialData,
          diagnosis,
          allDiagnoses: allDiagnoses.slice(0, 6),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('Você fez muitas perguntas seguidas. Aguarde alguns minutos.');
        throw new Error('Erro na requisição');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              fullResponse += parsed.text;
              setStreamingContent(fullResponse);
            }
          } catch (parseErr) {
            if (parseErr.message && !parseErr.message.toLowerCase().includes('json')) throw parseErr;
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullResponse }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Desculpe, ${err.message || 'tive um problema para processar sua pergunta'}. Tente novamente.` },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function renderMessageContent(content) {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-2rem)] animate-fade-in">
      {/* Header */}
      <div className="card p-3.5 mb-2.5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-ink-400 hover:text-ink-800 p-1.5 rounded-md hover:bg-ink-100 transition-colors"
          aria-label="Voltar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-ink-800 text-[15px]">Consultor IA</h2>
          <p className="text-ink-400 text-xs">{businessData.businessName}</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-money-500" />
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-2 mb-2.5 rounded-md bg-amber-50 border border-amber-100 flex items-start gap-2">
        <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-[11px] leading-relaxed text-ink-600">
          A IA pode errar. Confira números importantes com seu contador antes de decisões grandes.
        </p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-ink-800 text-white rounded-br-sm'
                  : 'bg-white text-ink-700 shadow-xs border border-ink-100 rounded-bl-sm'
                }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white text-ink-700 shadow-xs border border-ink-100 text-[14px] leading-relaxed cursor-blink">
              {renderMessageContent(streamingContent)}
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-xs border border-ink-100">
              <div className="flex gap-1 items-center h-3">
                <div className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões */}
      {messages.filter(m => m.role === 'user').length === 0 && !isStreaming && (
        <div className="py-2">
          <p className="text-ink-400 text-xs mb-2 font-medium">Pode começar por:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 bg-white text-ink-600 rounded-full hover:bg-ink-50 transition-colors border border-ink-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="card p-2.5 mt-2.5 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre seus números…"
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none outline-none text-sm text-ink-700 placeholder:text-ink-300
                     bg-transparent max-h-24 overflow-y-auto leading-relaxed py-1.5 px-1"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isStreaming}
          className="flex-shrink-0 w-9 h-9 bg-ink-800 text-white rounded-md flex items-center justify-center
                     hover:bg-ink-900 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Enviar mensagem"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
