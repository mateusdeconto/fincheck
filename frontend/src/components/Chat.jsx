import { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUESTIONS = [
  'Por que minha margem está baixa?',
  'Como posso aumentar meu lucro esse mês?',
  'Meu nível de dívida está perigoso?',
  'Qual deveria ser meu ponto de equilíbrio?',
  'Como reduzir meus custos fixos?',
];

export default function Chat({ businessData, financialData, diagnosis, onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Olá! Já analisei os números do **${businessData.businessName}**. Pode me perguntar qualquer coisa sobre o diagnóstico ou sobre o financeiro do seu negócio — vou responder com base nos seus dados reais.`,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyForAPI,
          businessData,
          financialData,
          diagnosis,
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
      {/* Header do chat */}
      <div className="card p-4 mb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-ink-500 hover:text-ink-800 p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
          aria-label="Voltar ao diagnóstico"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="font-display font-semibold text-ink-800 text-base">Consultor IA</h2>
          <p className="text-ink-400 text-xs">{businessData.businessName}</p>
        </div>
        <div className="w-9 h-9 bg-accent-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-2 mb-3 rounded-lg bg-accent-50 border border-accent-100 flex items-start gap-2">
        <svg className="w-3.5 h-3.5 text-accent-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        <p className="text-[11px] leading-relaxed text-ink-600">
          IA pode errar. Confira números importantes com seu contador antes de decisões grandes.
        </p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-ink-700 text-white rounded-br-sm'
                  : 'bg-white text-ink-700 shadow-soft border border-ink-100 rounded-bl-sm'
                }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-ink-700 shadow-soft border border-ink-100 text-[14px] leading-relaxed cursor-blink">
              {renderMessageContent(streamingContent)}
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-soft border border-ink-100">
              <div className="flex gap-1 items-center h-4">
                <div className="w-2 h-2 bg-accent-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões */}
      {messages.filter(m => m.role === 'user').length === 0 && !isStreaming && (
        <div className="py-2">
          <p className="text-ink-400 text-xs mb-2 text-center font-medium">Perguntas sugeridas</p>
          <div className="flex flex-wrap gap-2 justify-center">
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
      <div className="card p-3 mt-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre seus números…"
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none outline-none text-sm text-ink-700 placeholder:text-ink-300
                     bg-transparent max-h-24 overflow-y-auto leading-relaxed py-1.5"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isStreaming}
          className="flex-shrink-0 w-9 h-9 bg-accent-500 text-white rounded-xl flex items-center justify-center
                     hover:bg-accent-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Enviar mensagem"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
