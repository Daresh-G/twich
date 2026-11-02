import React, { useState } from 'react';
import { Flame, Vote, Sparkles, Plus, BarChart3, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AudienceParticipation({
  hypeLevel,
  activePoll,
  onVoteOption,
  onCreatePoll,
  onEndPoll,
  onAutoGeneratePoll,
  isGeneratingPoll,
  trendingKeywords
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOption1, setNewOption1] = useState('');
  const [newOption2, setNewOption2] = useState('');
  const [newOption3, setNewOption3] = useState('');

  const triggerHypeConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newOption1.trim() || !newOption2.trim()) return;

    const options = [
      { id: '1', label: newOption1.trim(), votes: 0 },
      { id: '2', label: newOption2.trim(), votes: 0 }
    ];
    if (newOption3.trim()) {
      options.push({ id: '3', label: newOption3.trim(), votes: 0 });
    }

    onCreatePoll({
      id: `poll_${Date.now()}`,
      question: newQuestion.trim(),
      options,
      totalVotes: 0,
      status: 'active',
      startedAt: Date.now()
    });

    setNewQuestion('');
    setNewOption1('');
    setNewOption2('');
    setNewOption3('');
    setShowCreateModal(false);
  };

  const totalVotes = activePoll ? activePoll.options.reduce((sum, o) => sum + o.votes, 0) : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#090d16] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      {/* 1. Dynamic Hype Meter */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Crowd Hype Meter
            </span>
          </div>
          <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
            {hypeLevel}% / 100%
          </span>
        </div>

        {/* Energy Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 overflow-hidden relative shadow-inner">
          <div
            style={{ width: `${hypeLevel}%` }}
            className={`h-full transition-all duration-500 rounded-full ${
              hypeLevel > 80
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-[#9146FF] shadow-lg shadow-rose-500/50'
                : hypeLevel > 40
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                : 'bg-slate-400 dark:bg-slate-700'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-2 font-medium">
          <span>{hypeLevel > 75 ? '🔥 HYPE TRAIN SURGE!' : hypeLevel > 35 ? '⚡ Positive Vibe' : '💤 Calm Stream'}</span>
          <button
            onClick={triggerHypeConfetti}
            className="text-[11px] text-[#9146FF] hover:text-[#772ce8] dark:hover:text-[#a96eff] flex items-center gap-1 font-bold transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Celebrate Hype</span>
          </button>
        </div>
      </div>

      {/* 2. Live Audience Poll Section (Track 2 Focus) */}
      <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Vote className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Live Chat Poll
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAutoGeneratePoll}
                disabled={isGeneratingPoll}
                className="px-2.5 py-1 text-[10px] font-extrabold text-[#9146FF] bg-[#9146FF]/10 hover:bg-[#9146FF]/20 border border-[#9146FF]/30 rounded-md flex items-center gap-1 transition-colors"
                title="Use OpenAI to read recent chat context and generate an engaging poll automatically"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isGeneratingPoll ? 'Generating...' : 'AI Auto-Poll'}</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
          </div>

          {activePoll ? (
            <div className="mt-3.5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                  {activePoll.question}
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  LIVE VOTING
                </span>
              </div>

              {/* Poll Options */}
              <div className="space-y-2">
                {activePoll.options.map((opt, idx) => {
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => onVoteOption(opt.id)}
                      className="group cursor-pointer p-2.5 rounded-lg bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-[#9146FF] transition-all relative overflow-hidden shadow-2xs"
                    >
                      {/* Background fill */}
                      <div
                        style={{ width: `${percentage}%` }}
                        className="absolute left-0 top-0 bottom-0 bg-[#9146FF]/15 dark:bg-[#9146FF]/25 transition-all duration-300 pointer-events-none"
                      />

                      <div className="relative flex items-center justify-between text-xs z-10 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            !vote {idx + 1}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                            {opt.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">{opt.votes} votes</span>
                          <span className="font-extrabold text-[#9146FF] dark:text-cyan-400 tabular-nums">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                <span>Type <code className="text-[#9146FF] font-bold">!vote 1</code> in Twitch chat</span>
                <button
                  onClick={onEndPoll}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                >
                  End Poll
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Active Audience Poll</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Trigger a poll manually or let OpenAI generate a topic based on current chatter buzz.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={onAutoGeneratePoll}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#9146FF] hover:bg-[#772ce8] rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Auto-Poll</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Surging Emotes / Keywords */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 mt-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
            Surging Chat Reactions (Last 60s)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {trendingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 flex items-center gap-1 font-bold shadow-2xs"
              >
                <span className="text-[#9146FF]">#{kw.word}</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Create Custom Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Vote className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Create Audience Participation Poll</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Poll Question:
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Should I push B or rotate?"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-[#9146FF]"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Option 1 (Command: !vote 1):
                </label>
                <input
                  type="text"
                  required
                  value={newOption1}
                  onChange={(e) => setNewOption1(e.target.value)}
                  placeholder="e.g. Rush B Site"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-[#9146FF]"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Option 2 (Command: !vote 2):
                </label>
                <input
                  type="text"
                  required
                  value={newOption2}
                  onChange={(e) => setNewOption2(e.target.value)}
                  placeholder="e.g. Rotate & Play Time"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-[#9146FF]"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Option 3 (Optional, Command: !vote 3):
                </label>
                <input
                  type="text"
                  value={newOption3}
                  onChange={(e) => setNewOption3(e.target.value)}
                  placeholder="e.g. Save guns for next round"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-[#9146FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md font-bold text-white bg-[#9146FF] hover:bg-[#772ce8] transition-colors"
                >
                  Launch Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
