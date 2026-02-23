import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, X, MessageSquare, Sparkles } from './ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = "-";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CareerChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are an AI Career Assistant helping students with career guidance, resume suggestions, skill roadmaps, and job preparation tips. Keep your tone professional, encouraging, and highly practical." },
            ...messages,
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Error calling Groq API:", error);
      const errorMessage = error.message.includes('Failed to fetch') 
        ? "Network Error: Browser blocked the request (CORS). Please use a CORS proxy or check your internet."
        : `Error: ${error.message}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-primary-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 group relative"
          >
            <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20 group-hover:opacity-40"></div>
            <MessageSquare className="w-8 h-8 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="w-[400px] h-[600px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-600 p-6 flex items-center justify-between text-white relative">
                <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <Bot className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Career AI Assistant</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-white/80 font-medium tracking-wide">Always Online</span>
                        </div>
                    </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 no-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-10 px-4">
                  <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Welcome to Your Career Flight!</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    I'm your AI Career Coach. Ask me anything about job prep, resume tips, or skill roadmaps.
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-8">
                    {[
                      "Suggest a learning path for AI",
                      "How to improve my resume?",
                      "Tips for HR interview rounds",
                      "Latest trends in DevOps"
                    ].map((suggestion, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setInput(suggestion)}
                        className="text-xs font-medium text-left p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-all shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5 opacity-60">
                        {msg.role === 'user' ? (
                            <>
                                <span className="text-[10px] font-bold uppercase tracking-widest ml-auto">You</span>
                                <User className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                <Bot className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Assistant</span>
                            </>
                        )}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assistant is thinking...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500/20 transition-all border border-gray-200 focus-within:border-primary-400">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about your career..."
                  className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-medium text-gray-700 placeholder:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-600/30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-3 font-medium opacity-70">
                Powered by Groq • AI Career Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerChatbot;
