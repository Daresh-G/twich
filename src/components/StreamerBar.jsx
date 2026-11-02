import React, { useState } from 'react';
import { Radio, Zap, AlertTriangle, Vote, Coffee, Hash } from 'lucide-react';

export default function StreamerBar({
  sourceMode,
  setSourceMode,
  currentChannel,
  connectionStatus,
  onConnectChannel,
  onDisconnectChannel,
  currentScenario,
  onSelectScenario
}) {
  const [channelInput, setChannelInput] = useState(currentChannel || 'shroud');

  const handleChannelSubmit = (e) => {
    e.preventDefault();
    if (channelInput.trim()) {
      onConnectChannel(channelInput.trim().toLowerCase());
    }
  };

  return (
    <div className="bg-slate-50/90 dark:bg-[#0e1320] border-b border-slate-200 dark:border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 transition-colors">
      {/* Channel Ingest Section */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleChannelSubmit} className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              placeholder="channel name..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-md text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#9146FF] w-36 sm:w-44 transition-colors shadow-xs"
            />
          </div>
          <button
            type="submit"
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors shadow-xs ${
              sourceMode === 'live_twitch' && connectionStatus === 'connected'
                ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/25'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#9146FF]" />
            <span>Connect Live IRC</span>
          </button>
        </form>

        {/* Status display */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Status:</span>
          {sourceMode === 'live_twitch' ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live #{currentChannel}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              Simulating ({currentScenario})
            </span>
          )}
        </div>
      </div>

      {/* Preset Hackathon Testing Scenarios */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
          Demo Scenarios:
        </span>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => onSelectScenario('hype')}
            title="Simulate high energy clutch play with massive positive hype"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
              sourceMode === 'simulation' && currentScenario === 'hype'
                ? 'bg-[#9146FF] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Hype Train</span>
          </button>

          <button
            onClick={() => onSelectScenario('raid')}
            title="Simulate a toxic hate raid attack to test auto-moderation and raid shield"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
              sourceMode === 'simulation' && currentScenario === 'raid'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Toxic Raid</span>
          </button>

          <button
            onClick={() => onSelectScenario('poll')}
            title="Simulate audience debating choices and casting chat votes"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
              sourceMode === 'simulation' && currentScenario === 'poll'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Vote className="w-3.5 h-3.5 text-cyan-500" />
            <span>Poll Surge</span>
          </button>

          <button
            onClick={() => onSelectScenario('chill')}
            title="Simulate balanced natural gameplay chat"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
              sourceMode === 'simulation' && currentScenario === 'chill'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-emerald-500" />
            <span>Chill Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
