import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, Slash, Ban, Check, Eye, EyeOff, Pause, Play, AlertOctagon } from 'lucide-react';

export default function ChatFeed({
  messages,
  onSendMessage,
  onPurgeMessage,
  onTimeoutUser,
  onPardonMessage
}) {
  const [inputText, setInputText] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const chatScrollRef = useRef(null);

  // Auto-scroll when new messages arrive if enabled
  useEffect(() => {
    if (isAutoScroll && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAutoScroll]);

  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setIsAutoScroll(isAtBottom);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0e17] border-r border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Feed Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">
            Live Moderated Stream
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            ({messages.length} buffered)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              isAutoScroll
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25'
                : 'text-amber-700 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
            }`}
            title={isAutoScroll ? 'Auto-scroll is active' : 'Auto-scroll is paused'}
          >
            {isAutoScroll ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span className="text-[10px] font-mono font-bold">
              {isAutoScroll ? 'Auto-scroll' : 'Paused'}
            </span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-1.5 font-sans text-xs select-text"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-500 py-12">
            <Shield className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-400">Waiting for chat messages...</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-600 mt-0.5">Connect to a live channel or pick a demo scenario</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPurged = msg.actionTaken === 'auto_purged' || msg.actionTaken === 'purged';
            const isTimedOut = msg.actionTaken === 'auto_timed_out' || msg.actionTaken === 'timed_out';
            const isFlagged = msg.flag?.isFlagged;
            const isRevealed = revealedIds.has(msg.id);

            return (
              <div
                key={msg.id}
                className={`group relative rounded-lg p-2.5 transition-all border ${
                  isTimedOut
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/40'
                    : isPurged
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/30'
                    : isFlagged
                    ? 'bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700/50'
                    : 'bg-white dark:bg-transparent border-slate-200/60 dark:border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-900/50 shadow-2xs'
                }`}
              >
                {/* Header row: timestamp + badges + username + sentiment */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] leading-tight mb-1">
                  <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px]">
                    {msg.timestamp}
                  </span>

                  {/* Badges */}
                  {msg.badges?.broadcaster && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wide">
                      BROADCASTER
                    </span>
                  )}
                  {msg.badges?.mod && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wide">
                      MOD
                    </span>
                  )}
                  {msg.badges?.vip && (
                    <span className="px-1.5 py-0.2 rounded bg-[#9146FF] text-white font-bold text-[9px] uppercase tracking-wide">
                      VIP
                    </span>
                  )}
                  {msg.badges?.subscriber && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wide">
                      SUB
                    </span>
                  )}

                  {/* Username */}
                  <span
                    className="font-extrabold cursor-pointer hover:underline"
                    style={{ color: msg.color || '#9146FF' }}
                  >
                    {msg.user}:
                  </span>

                  {/* Unboxed Sentiment Label */}
                  {msg.sentiment && (
                    <span
                      className={`font-mono text-[10px] ml-auto font-bold ${
                        msg.sentiment.score > 0.3
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : msg.sentiment.score < -0.3
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {msg.sentiment.score > 0
                        ? `+${Math.round(msg.sentiment.score * 100)} Hype`
                        : msg.sentiment.score < 0
                        ? `${Math.round(msg.sentiment.score * 100)} Toxic`
                        : 'Neutral'}
                    </span>
                  )}
                </div>

                {/* Message Body */}
                <div className="text-slate-800 dark:text-slate-200 break-words leading-relaxed pl-1 font-medium">
                  {(isPurged || isTimedOut) && !isRevealed ? (
                    <div className="flex items-center gap-2">
                      <span className="italic text-slate-500 dark:text-slate-400 line-through select-none">
                        [Message suppressed by OpenAI Policy: {msg.flag?.reason || 'Violation'}]
                      </span>
                      <button
                        onClick={() => toggleReveal(msg.id)}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-0.5"
                        title="View suppressed text"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <span className={isPurged || isTimedOut ? 'text-rose-700 dark:text-rose-300 font-mono text-[11px]' : ''}>
                        {msg.text}
                      </span>
                      {(isPurged || isTimedOut) && isRevealed && (
                        <button
                          onClick={() => toggleReveal(msg.id)}
                          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-0.5 shrink-0"
                          title="Hide suppressed text"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Enforcement Reason Bar */}
                {isFlagged && (
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                      <AlertOctagon className="w-3 h-3" />
                      {msg.actionTaken === 'auto_timed_out'
                        ? `Auto-Timed Out (600s) · ${msg.flag?.reason}`
                        : msg.actionTaken === 'auto_purged'
                        ? `Auto-Purged · ${msg.flag?.reason}`
                        : `Flagged (${Math.round((msg.flag?.confidence || 0) * 100)}% conf) · ${msg.flag?.reason}`}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{msg.engine}</span>
                  </div>
                )}

                {/* Streamer / Mod Quick Action Overlay on Hover */}
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-1 shadow-lg backdrop-blur">
                  <button
                    onClick={() => onPurgeMessage(msg.id)}
                    title="Purge Message"
                    className="p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Slash className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onTimeoutUser(msg.user, msg.id)}
                    title="Timeout User (10 min)"
                    className="p-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Ban className="w-3 h-3" />
                  </button>
                  {isFlagged && (
                    <button
                      onClick={() => onPardonMessage(msg.id)}
                      title="Pardon / Allow"
                      className="p-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Test Chatter Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Test any chat phrase, gamer slang, or slur to test AI moderation..."
            className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#9146FF] transition-colors"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#9146FF] hover:bg-[#772ce8] rounded-md flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2 px-0.5">
          <span>Pro tip: Test with "POG clutch play", "!vote 1", or "KYS garbage"</span>
          <span>OpenAI Omni-Mod Active</span>
        </div>
      </div>
    </div>
  );
}
