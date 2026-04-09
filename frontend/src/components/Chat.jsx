import { useState, useRef, useEffect } from 'react';

/**
 * Sugestões de perguntas para o usuário começar o chat
 */
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

  // Scrolla automaticamente para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function sendMessage(messageText) {
    const text = messageText || input.trim();
    if (!text || isStreaming) return;

    setInput('');
    const userMessage = { role: 'user', content: text };

    // Adiciona mensagem do usuário ao histórico (sem a mensagem de boas-vindas)
    const historyForAPI = messages.slice(1).map(m => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyForAPI,
          financialData,
          diagnosis,
        }),
      });

      if (!response.ok) throw new Error('Erro na requisição');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullResponse += parsed.text;
              setStreamingContent(fullResponse);
            }
          } catch {
            // ignora linhas inválidas
          }
        }
      }

      // Adiciona a resposta completa ao histórico
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullResponse },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, tive um problema para processar sua pergunta. Tente novamente.' },
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

  /**
   * Renderiza negrito (**texto**) em mensagens do chat
   */
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
          className="text-navy-600 hover:text-navy-800 p-1 rounded-lg hover:bg-navy-50 transition-colors"
          aria-label="Voltar ao diagnóstico"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800 text-sm">Chat Financeiro</h2>
          <p className="text-slate-400 text-xs">{businessData.businessName}</p>
        </div>
        <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
          <span className="text-base">🤖</span>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-navy-700 text-white rounded-br-sm'
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'
                }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}

        {/* Mensagem em streaming */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-slate-700 shadow-sm border border-slate-100 text-sm leading-relaxed cursor-blink">
              {renderMessageContent(streamingContent)}
            </div>
          </div>
        )}

        {/* Indicador de digitação */}
        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-sm border border-slate-100">
              <div className="flex gap-1 items-center h-4">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões de perguntas (só aparece antes de qualquer pergunta do usuário) */}
      {messages.filter(m => m.role === 'user').length === 0 && !isStreaming && (
        <div className="py-2">
          <p className="text-navy-200 text-xs mb-2 text-center">Perguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors border border-white/20"
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
          placeholder="Pergunte sobre seus números..."
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none outline-none text-sm text-slate-700 placeholder:text-slate-300
                     bg-transparent max-h-24 overflow-y-auto leading-relaxed"
          style={{ minHeight: '24px' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isStreaming}
          className="flex-shrink-0 w-9 h-9 bg-navy-700 text-white rounded-xl flex items-center justify-center
                     hover:bg-navy-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
