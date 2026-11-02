import React from 'react';
import { Activity, ShieldAlert, Cpu, TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiMetrics({
  messagesPerSec,
  sentimentScore,
  sentimentLabel,
  flaggedCount,
  autoPurgedCount,
  autoTimedOutCount,
  totalMessages,
  openAiActive,
  raidShieldActive
}) {
  const sentimentVal = Math.round(sentimentScore * 100);
  const autoActionRate = totalMessages > 0
    ? Math.round(((autoPurgedCount + autoTimedOutCount) / Math.max(1, flaggedCount)) * 100)
    : 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-slate-100/80 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Metric 1: Chat Velocity */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#9146FF]/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">Chat Velocity</span>
          <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {messagesPerSec}
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">msgs/sec</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
          <span>{totalMessages} parsed</span>
          <span aria-hidden="true">·</span>
          <span>Buffer: 200</span>
        </div>
      </div>

      {/* Metric 2: Live Sentiment Index */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#9146FF]/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">Sentiment Index</span>
          {sentimentVal >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-extrabold font-mono tabular-nums ${
              sentimentVal > 20
                ? 'text-emerald-600 dark:text-emerald-400'
                : sentimentVal < -20
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-300'
            }`}
          >
            {sentimentVal > 0 ? `+${sentimentVal}` : sentimentVal}
          </span>
          <span className="text-xs uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
            {sentimentLabel === 'positive' ? 'High Hype' : sentimentLabel === 'negative' ? 'Toxicity Alert' : 'Neutral'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
          <span>Scale: -100 to +100</span>
          <span aria-hidden="true">·</span>
          <span className={sentimentVal > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : sentimentVal < 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}>
            {sentimentVal > 30 ? 'Crowd Thriving' : sentimentVal < -30 ? 'Hostile Surge' : 'Balanced Stream'}
          </span>
        </div>
      </div>

      {/* Metric 3: Automated Enforcements */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#9146FF]/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">Auto-Enforcements</span>
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {autoPurgedCount + autoTimedOutCount}
          </span>
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
            actions ({autoActionRate}%)
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
          <span className="text-rose-600 dark:text-rose-400 font-bold">{autoTimedOutCount} timeouts</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">{autoPurgedCount} purges</span>
        </div>
      </div>

      {/* Metric 4: OpenAI Engine State */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#9146FF]/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">Moderation Core</span>
          <Cpu className="w-4 h-4 text-[#9146FF]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white truncate">
            {openAiActive ? 'OpenAI Omni-Mod' : 'Local NLP Heuristic'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
          <span>Latency: ~18ms</span>
          <span aria-hidden="true">·</span>
          <span className={raidShieldActive ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
            {raidShieldActive ? 'Shield Armed' : 'Normal Patrol'}
          </span>
        </div>
      </div>
    </div>
  );
}
