import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, User, CornerDownLeft, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Olá! Sou o **Assistente Ânima Zen**, seu conselheiro de bem-estar. 🌸\n\nEstou aqui para ajudar você a encontrar o tratamento ideal para suas dores, relaxar sua mente e tirar dúvidas sobre nosso santuário, valores ou sobre a nossa profissional **Bia Lopes**.\n\nComo posso cuidar de você hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    setInput('');
    
    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: userMessageText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await response.json();
      if (data.success && data.text) {
        setMessages(prev => [...prev, { role: 'model', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Desculpe, tive um pequeno contratempo ao me conectar. Poderia repetir ou me chamar no WhatsApp?' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Estou com dificuldades de conexão no momento. Se preferir, fale diretamente com Bia Lopes pelo WhatsApp no topo da página!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format simple markdown bold tags
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // replace **bold** with <strong> tags
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      return (
        <p key={lineIdx} className="mb-2 last:mb-0 text-xs md:text-sm leading-relaxed">
          {parts.map((part, partIdx) => {
            if (partIdx % 2 === 1) {
              return <strong key={partIdx} className="font-extrabold text-[#1c5a3b]">{part}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div id="ai-assistant-wrapper" className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white/95 backdrop-blur-md border border-[#dfd3c3] rounded-2xl w-[340px] md:w-[380px] h-[500px] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1c5a3b] to-[#143f29] p-4 text-white flex items-center justify-between border-b border-[#dfd3c3]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs md:text-sm tracking-wide">Assistente Ânima Zen</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-[#dfd3c3]/80">Online e pronta para ajudar</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-[#dfd3c3] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Info: "Não é toque!" philosophy watermark */}
            <div className="bg-amber-50/70 border-b border-[#dfd3c3]/40 px-4 py-2 text-[10px] text-[#8b7665] flex items-center gap-1.5 font-medium leading-tight">
              <span className="text-amber-600 font-bold">Nota:</span> Atendimento humanizado e terapêutico (Não realizamos massagens eróticas).
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf6f0]/50 scrollbar-thin">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                      msg.role === 'user' 
                        ? 'bg-[#3a271c] border-[#dfd3c3] text-white' 
                        : 'bg-[#1c5a3b] border-[#d4af37]/20 text-white'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-left shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#1b4332] text-white rounded-tr-none'
                        : 'bg-white text-[#3a271c] border border-[#dfd3c3]/50 rounded-tl-none'
                    }`}>
                      {renderFormattedText(msg.content)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%] items-center">
                    <div className="w-6 h-6 rounded-full bg-[#1c5a3b] border border-[#d4af37]/20 text-white flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#dfd3c3]/50 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#1c5a3b]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#1c5a3b]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#1c5a3b]/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#dfd3c3] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre massagens, combos, valores..."
                className="flex-1 bg-[#faf6f0] border border-[#dfd3c3] focus:border-[#1c5a3b] text-xs md:text-sm text-[#3a271c] rounded-xl px-3 py-2 outline-none placeholder-[#a08e82]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-[#1b4332] hover:bg-[#143f29] disabled:opacity-30 disabled:hover:bg-[#1b4332] text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        id="ai-chat-toggle-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1c5a3b] to-[#143f29] border-2 border-[#d4af37]/40 hover:border-[#d4af37] text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <MessageSquare className="w-4 h-4 text-[#d4af37] group-hover:rotate-12 transition-transform" />
        <span className="text-xs tracking-wider">Assistente IA</span>
      </motion.button>
    </div>
  );
}
