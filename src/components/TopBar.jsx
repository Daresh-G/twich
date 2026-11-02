import React from 'react';
import { Shield, Sparkles, Sliders, Monitor, Radio, Sun, Moon, Play } from 'lucide-react';

export default function TopBar({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onToggleObsMode,
  isObsMode,
  hasApiKey,
  raidShieldActive,
  onToggleRaidShield,
  theme,
  onToggleTheme,
  onOpenDemoVideo
}) {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur sticky top-0 z-40 transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <button onClick={() => setActiveTab('monitor')} className="flex items-center gap-2.5 text-left group">
          <div className="w-8 h-8 rounded-lg bg-[#9146FF] flex items-center justify-center shadow-lg shadow-[#9146FF]/25 group-hover:bg-[#772ce8] transition-colors">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              TWITCH PULSE AI
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#9146FF]/10 dark:bg-slate-800 text-[#9146FF] border border-[#9146FF]/30 font-bold">
                OpenAI Hackathon
              </span>
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white pb-0.5 ${
            activeTab === 'monitor' ? 'text-slate-900 dark:text-white border-b-2 border-[#9146FF] font-bold' : ''
          }`}
        >
          Live Telemetry
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white pb-0.5 ${
            activeTab === 'sentiment' ? 'text-slate-900 dark:text-white border-b-2 border-[#9146FF] font-bold' : ''
          }`}
        >
          Sentiment Wave
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white pb-0.5 ${
            activeTab === 'queue' ? 'text-slate-900 dark:text-white border-b-2 border-[#9146FF] font-bold' : ''
          }`}
        >
          Flagged Queue
        </button>
        <button
          onClick={() => setActiveTab('audience')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white pb-0.5 ${
            activeTab === 'audience' ? 'text-slate-900 dark:text-white border-b-2 border-[#9146FF] font-bold' : ''
          }`}
        >
          Audience Engagement
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white pb-0.5 flex items-center gap-1.5 ${
            activeTab === 'games'
              ? 'text-slate-900 dark:text-white border-b-2 border-cyan-500 font-bold'
              : 'text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-700 dark:hover:text-cyan-300'
          }`}
        >
          <span>Chat Games</span>
        </button>
        <button
          onClick={() => setActiveTab('solution')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white pb-0.5 flex items-center gap-1.5 ${
            activeTab === 'solution'
              ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500 font-bold'
              : 'text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>OpenAI Solution</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Quick Raid Shield Trigger */}
        <button
          onClick={onToggleRaidShield}
          title={raidShieldActive ? 'Raid Shield is Active (Aggressive Auto-Lock)' : 'Click to arm Raid Shield'}
          className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            raidShieldActive
              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-500/20 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60'
          }`}
        >
          <Shield className={`w-3.5 h-3.5 ${raidShieldActive ? 'text-rose-500' : 'text-slate-500'}`} />
          <span>{raidShieldActive ? 'SHIELD ACTIVE' : 'Raid Shield'}</span>
        </button>

        {/* OBS Dock View Toggle */}
        <button
          onClick={onToggleObsMode}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
            isObsMode
              ? 'bg-[#9146FF] text-white'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>OBS Dock</span>
        </button>

        {/* 3-Minute Demo Video Walkthrough */}
        <button
          onClick={onOpenDemoVideo}
          title="Watch 3-Minute English Project Demo Video"
          className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-[#9146FF] to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-md flex items-center gap-1.5 shadow-md shadow-[#9146FF]/30 border border-purple-400/30 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0 animate-pulse"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>3-Min Demo Video</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Settings & OpenAI Key */}
        <button
          onClick={onOpenSettings}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#9146FF] hover:bg-[#772ce8] rounded-md flex items-center gap-1.5 shadow-md shadow-[#9146FF]/25 transition-all whitespace-nowrap shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>OpenAI & Rules</span>
          {hasApiKey && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" title="Custom OpenAI Key Configured" />
          )}
        </button>
      </div>
    </header>
  );
}
