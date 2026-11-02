import React, { useMemo } from 'react';
import { Activity, Flame, Sparkles, Zap } from 'lucide-react';

export default function SentimentWave({ history, currentScore, currentHype }) {
  const isOverdrive = currentHype >= 80;

  const { pathData, areaData, points, positiveRatio, neutralRatio, negativeRatio } = useMemo(() => {
    if (!history || history.length === 0) {
      return { pathData: '', areaData: '', points: [], positiveRatio: 60, neutralRatio: 30, negativeRatio: 10 };
    }

    const width = 600;
    const height = 140;
    const paddingY = 20;
    const usableHeight = height - paddingY * 2;
    const midY = height / 2;

    const len = Math.max(history.length, 2);
    const stepX = width / (len - 1);

    const pts = history.map((h, i) => {
      const x = i * stepX;
      const norm = (h.score + 1) / 2;
      const y = height - paddingY - norm * usableHeight;
      return { x, y, score: h.score, hype: h.hype };
    });

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const area = `${d} L ${pts[pts.length - 1].x} ${midY} L ${pts[0].x} ${midY} Z`;

    let pos = 0;
    let neu = 0;
    let neg = 0;
    history.forEach((h) => {
      if (h.score > 0.15) pos++;
      else if (h.score < -0.15) neg++;
      else neu++;
    });
    const total = Math.max(1, history.length);
    const posR = Math.round((pos / total) * 100);
    const negR = Math.round((neg / total) * 100);
    const neuR = 100 - posR - negR;

    return { pathData: d, areaData: area, points: pts, positiveRatio: posR, neutralRatio: Math.max(0, neuR), negativeRatio: negR };
  }, [history]);

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-500 relative overflow-hidden ${
        isOverdrive
          ? 'bg-gradient-to-b from-amber-500/10 via-purple-500/10 to-white dark:to-slate-900/80 border-amber-400 dark:border-[#9146FF] ring-2 ring-amber-400/60 dark:ring-[#9146FF]/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] dark:shadow-[0_0_40px_rgba(145,70,255,0.35)]'
          : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 shadow-xs'
      }`}
    >
      {/* Visual Flare Overlay when Hype > 80 */}
      {isOverdrive && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Shimmering beam sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 dark:via-[#9146FF]/25 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

          {/* Floating energy embers */}
          <div className="absolute top-2 right-12 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-75" />
          <div className="absolute bottom-6 left-16 w-2 h-2 rounded-full bg-[#9146FF] animate-ping opacity-70" />
          <div className="absolute top-8 left-1/3 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse opacity-80" />

          {/* Top Edge Neon Horizon Glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-[#9146FF] to-amber-400 shadow-[0_0_12px_#9146FF]" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isOverdrive ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-[#9146FF]'}`} />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Real-Time Sentiment Velocity
          </h3>
          {isOverdrive ? (
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/40 flex items-center gap-1 animate-bounce">
              <Flame className="w-3 h-3" />
              <span>HYPE OVERDRIVE 80%+</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              60s Rolling Window
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
            Hype Velocity:
          </span>
          <span
            className={`text-xs font-extrabold font-mono tabular-nums ${
              isOverdrive
                ? 'text-amber-600 dark:text-amber-400 text-sm font-black animate-pulse'
                : 'text-[#9146FF]'
            }`}
          >
            {currentHype}%
          </span>
        </div>
      </div>

      {/* SVG Wave Chart Container */}
      <div
        className={`relative w-full h-[140px] rounded-lg overflow-hidden transition-all duration-500 ${
          isOverdrive
            ? 'bg-slate-900 dark:bg-slate-950 border-2 border-amber-400/80 dark:border-[#9146FF]/80 shadow-[inset_0_0_20px_rgba(145,70,255,0.3)]'
            : 'bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 shadow-inner'
        }`}
      >
        {/* Baseline Guideline (Neutral 0.0) */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-300 dark:border-slate-700/60 pointer-events-none flex justify-between px-3 text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-500 z-10">
          <span className="text-emerald-600 dark:text-emerald-400">+ Positive Hype</span>
          <span>0.0 Neutral Baseline</span>
          <span className="text-rose-600 dark:text-rose-400">- Hostile Spike</span>
        </div>

        <svg viewBox="0 0 600 140" className="w-full h-full preserve-3d relative z-10" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isOverdrive ? '#f59e0b' : '#10b981'} stopOpacity={isOverdrive ? '0.55' : '0.35'} />
              <stop offset="50%" stopColor="#9146FF" stopOpacity={isOverdrive ? '0.25' : '0.08'} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={isOverdrive ? '0.5' : '0.35'} />
            </linearGradient>

            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isOverdrive ? '#f59e0b' : '#9146FF'} />
              <stop offset="50%" stopColor="#9146FF" />
              <stop offset="100%" stopColor={isOverdrive ? '#ec4899' : '#06b6d4'} />
            </linearGradient>

            {/* Overdrive Neon Glow Filter */}
            <filter id="overdriveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area fill */}
          {areaData && <path d={areaData} fill="url(#sentimentGradient)" />}

          {/* Overdrive Glowing Underline */}
          {isOverdrive && pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.5"
              filter="url(#overdriveGlow)"
            />
          )}

          {/* Main stroke line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth={isOverdrive ? '3.5' : '2.5'}
              strokeLinecap="round"
              filter={isOverdrive ? 'url(#overdriveGlow)' : undefined}
            />
          )}

          {/* Pulsing leading point */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={isOverdrive ? '6' : '4.5'}
              fill={isOverdrive ? '#f59e0b' : currentScore > 0.1 ? '#10b981' : currentScore < -0.1 ? '#ef4444' : '#9146FF'}
              className="animate-ping"
              opacity="0.85"
            />
          )}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={isOverdrive ? '4.5' : '3.5'}
              fill={isOverdrive ? '#ffffff' : '#9146FF'}
              stroke={isOverdrive ? '#f59e0b' : '#ffffff'}
              strokeWidth="2"
            />
          )}
        </svg>

        {/* Ambient Plasma Flare on Overdrive */}
        {isOverdrive && (
          <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-transparent pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Aggregate Distribution Breakdown Bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/60 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Positive {positiveRatio}%
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
            Neutral {neutralRatio}%
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Negative {negativeRatio}%
          </span>
        </div>

        {/* Triple segmented distribution bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
          <div style={{ width: `${positiveRatio}%` }} className="bg-emerald-500 transition-all duration-300" />
          <div style={{ width: `${neutralRatio}%` }} className="bg-slate-400 dark:bg-slate-600 transition-all duration-300" />
          <div style={{ width: `${negativeRatio}%` }} className="bg-rose-500 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
