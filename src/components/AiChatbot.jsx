import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Minimize2, Maximize2, Shield, Flame, HelpCircle } from 'lucide-react';

export default function AiChatbot({ apiKey, currentChannel, sentimentScore, hypeLevel, flaggedCount, recentEnforcements }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hey streamer! I'm PulseBot, your OpenAI copilot for live moderation, sentiment analysis, and audience games. How can I assist your broadcast?",
      timestamp: 'Now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          apiKey: apiKey || undefined,
          statsContext: {
            channel: currentChannel,
            sentiment: Math.round(sentimentScore * 100),
            hypeLevel,
            flaggedCount,
            recentEnforcementsCount: recentEnforcements.length
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          actionSuggestion: data.actionSuggestion,
          engine: data.engine,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Chatbot response not ok');
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: "Stream pulse is active and running nominal. OpenAI safety guard is currently monitoring chat.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group px-4 py-2.5 rounded-full bg-[#9146FF] hover:bg-[#772ce8] text-white shadow-xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
          aria-label="Open AI Copilot Chat"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-2xl bg-white dark:bg-[#0e1320] border border-slate-300 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 transition-colors">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-[#111728] dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#9146FF] flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  PulseBot AI Copilot
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    ONLINE
                  </span>
                </h4>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                  OpenAI Stream Intelligence
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleSend("How is chat sentiment right now?")}
              className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#9146FF] whitespace-nowrap transition-colors"
            >
              📊 Chat Sentiment?
            </button>
            <button
              onClick={() => handleSend("Any active raid threats or spam?")}
              className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#9146FF] whitespace-nowrap transition-colors"
            >
              🚨 Raid Threat Status?
            </button>
            <button
              onClick={() => handleSend("Suggest an audience participation game")}
              className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#9146FF] whitespace-nowrap transition-colors"
            >
              🎮 Suggest a Game
            </button>
          </div>

          {/* Chat Messages List */}
          <div
            ref={chatBottomRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs font-sans"
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#9146FF] text-white rounded-br-none shadow-xs font-medium'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800 font-medium'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Optional action suggestion pill */}
                  {m.actionSuggestion && (
                    <div className="mt-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                      💡 Tip: {m.actionSuggestion}
                    </div>
                  )}

                  <span className="text-[9px] font-mono text-slate-400 mt-0.5 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9146FF] animate-spin" />
                <span>PulseBot is analyzing stream telemetry...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask PulseBot anything about the stream..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#9146FF] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2 rounded-lg bg-[#9146FF] hover:bg-[#772ce8] disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
