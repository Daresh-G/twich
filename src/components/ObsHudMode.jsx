import React from 'react';
import { Radio, Shield, Vote, Flame, ArrowLeft, AlertOctagon } from 'lucide-react';

export default function ObsHudMode({
  onExitObsMode,
  currentChannel,
  sentimentScore,
  sentimentLabel,
  hypeLevel,
  activePoll,
  totalVotes,
  recentEnforcements,
  raidShieldActive,
  onToggleRaidShield
}) {
  const sentimentVal = Math.round(sentimentScore * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a10] text-slate-900 dark:text-slate-100 p-4 font-sans flex flex-col justify-between max-w-2xl mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#9146FF] flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              OBS DOCK HUD · #{currentChannel}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRaidShield}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
              raidShieldActive
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{raidShieldActive ? 'SHIELD ARMED' : 'Shield'}</span>
          </button>
          <button
            onClick={onExitObsMode}
            className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Full Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main HUD Body */}
      <div className="space-y-4 my-4 flex-1">
        {/* Sentiment & Hype Meter Dual Gauge */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sentiment */}
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-bold">
              <span>Chat Sentiment</span>
              <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                {sentimentVal > 0 ? `+${sentimentVal}` : sentimentVal}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${Math.max(0, (sentimentScore + 1) * 50)}%` }}
                className={`h-full transition-all duration-300 ${
                  sentimentVal > 15 ? 'bg-emerald-500' : sentimentVal < -15 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block mt-1 uppercase">
              {sentimentLabel}
            </span>
          </div>

          {/* Hype */}
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-bold">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Hype Energy
              </span>
              <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                {hypeLevel}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${hypeLevel}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block mt-1">
              {hypeLevel > 70 ? '🔥 HYPE STREAK' : 'Normal Pace'}
            </span>
          </div>
        </div>

        {/* Active Poll Live Tally */}
        {activePoll && (
          <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-purple-200 dark:border-[#9146FF]/40 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {activePoll.question}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {totalVotes} chat votes
              </span>
            </div>

            <div className="space-y-2">
              {activePoll.options.map((opt, i) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="text-xs">
                    <div className="flex justify-between mb-1 text-[11px] font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">
                        !vote {i + 1}: {opt.label}
                      </span>
                      <span className="font-mono text-[#9146FF] dark:text-cyan-400 font-extrabold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-[#9146FF] transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Moderation Actions Log */}
        <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block flex items-center gap-1.5">
            <AlertOctagon className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Live Moderation Actions
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
            {recentEnforcements.length === 0 ? (
              <span className="text-slate-400 text-[10px] block py-2">
                No recent policy violations recorded.
              </span>
            ) : (
              recentEnforcements.slice(0, 5).map((enf) => (
                <div key={enf.id} className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">[{enf.actionTaken.toUpperCase()}]</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{enf.user}:</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">"{enf.text}"</span>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0 ml-1">{enf.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-500 flex justify-between">
        <span>Twitch Pulse AI · OBS Overlay Feed</span>
        <span>OpenAI Omni-Mod Active</span>
      </div>
    </div>
  );
}
