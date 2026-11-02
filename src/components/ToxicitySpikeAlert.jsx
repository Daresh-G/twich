import React, { useState, useEffect, useRef } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
  Zap,
  Flame,
  CheckCircle2,
  RefreshCw,
  Clock
} from 'lucide-react';

/**
 * ToxicitySpikeAlert
 * Visual notification alert displayed when chat sentiment drops below 0.3 for > 30 seconds.
 */
export default function ToxicitySpikeAlert({
  isAlertActive,
  lowSentimentSeconds,
  currentSentimentScore,
  onAcknowledge,
  onArmRaidShield,
  onPurgeNegative,
  onSimulateRecovery,
  onTriggerTestSpike,
  raidShieldActive
}) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // Play warning audio chime when alert is active and sound enabled
  useEffect(() => {
    if (isAlertActive && soundEnabled) {
      const playBeep = () => {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextClass();
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch (e) {
          // ignore audio failure
        }
      };

      playBeep();
      beepIntervalRef.current = setInterval(playBeep, 2500);
    } else {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    }

    return () => {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    };
  }, [isAlertActive, soundEnabled]);

  // If neither active nor pending warning, show a subtle test/status bar
  if (!isAlertActive && lowSentimentSeconds <= 0) {
    return (
      <div className="px-6 py-1.5 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Telemetry Watchdog: Sentiment Threshold Safe (&gt; 0.30)</span>
          <span className="text-slate-400 dark:text-slate-500">| 30s Spike Detector Active</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerTestSpike}
            className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-1"
            title="Simulate 30 seconds of low sentiment to test alert immediately"
          >
            <Flame className="w-3 h-3" />
            <span>Simulate 30s Toxicity Spike</span>
          </button>
        </div>
      </div>
    );
  }

  // Pre-Spike Warning: low sentiment (< 0.3) for 1 to 29 seconds
  if (!isAlertActive && lowSentimentSeconds > 0) {
    const remaining = Math.max(1, 30 - lowSentimentSeconds);
    const progressPercent = Math.min(100, (lowSentimentSeconds / 30) * 100);

    return (
      <div className="px-6 py-2.5 bg-amber-500/10 dark:bg-amber-950/40 border-b-2 border-amber-500/60 dark:border-amber-500/80 transition-all animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  ⚠️ Low Sentiment Watch: Toxicity Spike Alert in {remaining}s
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Current Score: {currentSentimentScore.toFixed(2)} (&lt; 0.30)
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/80">
                Sentiment has remained depressed for {lowSentimentSeconds}s. An emergency toxicity alert will trigger if it stays below 0.30 for 30s.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Visual Progress Bar */}
            <div className="w-28 sm:w-36 bg-amber-200 dark:bg-amber-900/60 h-2 rounded-full overflow-hidden border border-amber-500/30">
              <div
                className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
              {lowSentimentSeconds}s / 30s
            </span>
            <button
              onClick={onTriggerTestSpike}
              className="px-2 py-1 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 rounded border border-amber-500/40"
            >
              Skip to 30s Alert
            </button>
            <button
              onClick={onSimulateRecovery}
              className="px-2 py-1 text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-500/40"
              title="Reset sentiment to positive to cancel spike"
            >
              Reset / Recover
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Critical Toxicity Spike Alert (> 30 seconds below 0.3)
  return (
    <div className="relative overflow-hidden bg-rose-600/15 dark:bg-rose-950/60 border-b-2 border-rose-500 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/30 px-6 py-3 transition-all duration-300">
      {/* Animated warning beam */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Siren & Description */}
        <div className="flex items-start md:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 animate-bounce shrink-0">
            <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs md:text-sm font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                🚨 CRITICAL CHAT TOXICITY SPIKE DETECTED
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-600 text-white shadow-xs">
                Low Sentiment for {lowSentimentSeconds}s (&gt;30s threshold)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-900/80 text-rose-300 border border-rose-500/30">
                Score: {currentSentimentScore.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-rose-900 dark:text-rose-200/90 mt-1">
              Warning: Chat sentiment has continuously remained below <strong>0.30</strong> for over <strong>30 seconds</strong>.
              Possible coordinated hate raid, griefing campaign, or toxic surge in progress.
            </p>
          </div>
        </div>

        {/* Right: Quick Emergency Actions */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap shrink-0">
          {/* Sound Mute/Unmute */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-rose-300 dark:border-rose-800'
            }`}
            title={soundEnabled ? 'Mute alert chime' : 'Enable audio alarm beep'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'Audio On' : 'Audio Muted'}</span>
          </button>

          {/* Quick Raid Shield Arm */}
          <button
            onClick={onArmRaidShield}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              raidShieldActive
                ? 'bg-emerald-600 text-white border border-emerald-500'
                : 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-rose-600/30 animate-pulse'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{raidShieldActive ? 'Raid Shield Armed' : 'Arm Raid Shield Now'}</span>
          </button>

          {/* Purge Negative Buffer */}
          <button
            onClick={onPurgeNegative}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors flex items-center gap-1.5"
            title="Purge queued negative messages"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Purge Toxicity</span>
          </button>

          {/* Recover / Reset */}
          <button
            onClick={onSimulateRecovery}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1"
            title="Simulate positive chatter recovery"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recover</span>
          </button>

          {/* Dismiss Alert */}
          <button
            onClick={onAcknowledge}
            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 border border-rose-500/30 transition-colors"
            title="Acknowledge and dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
