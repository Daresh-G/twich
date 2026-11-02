import React, { useState } from 'react';
import { X, Key, Shield, Save, Check, RefreshCw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  rules,
  onSaveRules
}) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [tempRules, setTempRules] = useState({ ...rules });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    onSaveRules(tempRules);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0e1320] border border-slate-300 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#9146FF]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              OpenAI Integration & Moderation Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* OpenAI Key Configuration */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>OpenAI API Key (Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[10px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline font-semibold"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              Enter your OpenAI API key for live GPT-4o-mini topic extraction and Omni-Moderation calls. If empty, the app runs on its built-in high-throughput heuristic moderation engine.
            </p>
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#9146FF]"
            />
          </div>

          {/* Moderation Thresholds */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200">
              Automated Safety Rules & Enforcements
            </h4>

            {/* Auto-Delete Threshold */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                <span>Auto-Purge Confidence Threshold:</span>
                <span className="font-mono font-extrabold text-[#9146FF]">
                  {Math.round(tempRules.autoDeleteThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={tempRules.autoDeleteThreshold}
                onChange={(e) =>
                  setTempRules({ ...tempRules, autoDeleteThreshold: parseFloat(e.target.value) })
                }
                className="w-full accent-[#9146FF]"
              />
              <span className="text-[10px] text-slate-500">
                Messages flagged with confidence above this are automatically deleted from chat.
              </span>
            </div>

            {/* Timeout Duration */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                Auto-Timeout Duration for Severe Harassment:
              </label>
              <select
                value={tempRules.timeoutDuration}
                onChange={(e) =>
                  setTempRules({ ...tempRules, timeoutDuration: parseInt(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#9146FF]"
              >
                <option value={60}>60 Seconds (1 Minute Warning)</option>
                <option value={600}>600 Seconds (10 Minutes Standard)</option>
                <option value={3600}>3,600 Seconds (1 Hour Major)</option>
                <option value={86400}>86,400 Seconds (24 Hours Day Ban)</option>
              </select>
            </div>

            {/* Raid Shield Trigger */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-slate-800 dark:text-slate-300 font-bold block">
                  Aggressive Raid Auto-Lock
                </span>
                <span className="text-[10px] text-slate-500">
                  Instantly time-out any suspicious repeated messages when raid detected.
                </span>
              </div>
              <input
                type="checkbox"
                checked={tempRules.raidShieldActive}
                onChange={(e) =>
                  setTempRules({ ...tempRules, raidShieldActive: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTempRules({
                  autoDeleteThreshold: 0.70,
                  autoTimeoutThreshold: 0.85,
                  timeoutDuration: 600,
                  raidShieldActive: false
                });
              }}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md font-extrabold text-white bg-[#9146FF] hover:bg-[#772ce8] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
