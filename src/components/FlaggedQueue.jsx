import React, { useState } from 'react';
import {
  ShieldAlert,
  Trash2,
  Ban,
  Check,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Gavel,
  CheckCircle2
} from 'lucide-react';

/**
 * Format flaggedMessages and recentEnforcements states into RFC-4180 compliant CSV
 */
export function formatModerationHistoryCSV(flaggedMessages = [], recentEnforcements = [], channelName = 'stream') {
  const headers = [
    'Record Type',
    'Log ID',
    'Timestamp',
    'Channel',
    'User',
    'Action Taken',
    'Penalty Duration',
    'Primary Reason',
    'Triggered Categories',
    'Confidence Score',
    'Message Content',
    'Moderator / Engine',
    'Sentiment Score',
    'Sentiment Label'
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = [];

  // Index enforcements by id for cross-referencing
  const enforcementMap = new Map();
  recentEnforcements.forEach((e) => {
    if (e.id) enforcementMap.set(e.id, e);
  });

  const flaggedMap = new Map();
  flaggedMessages.forEach((f) => {
    if (f.id) flaggedMap.set(f.id, f);
  });

  // 1. Process Flagged Queue items
  flaggedMessages.forEach((m) => {
    const isEnforced =
      enforcementMap.has(m.id) ||
      (m.actionTaken && m.actionTaken !== 'none' && m.actionTaken !== 'flagged_for_review');
    const recordType = isEnforced ? 'FLAGGED_&_ENFORCED' : 'FLAGGED_PENDING_REVIEW';

    // Format active categories
    const categoriesList = m.flag?.categories
      ? Object.entries(m.flag.categories)
          .filter(([_, active]) => Boolean(active))
          .map(([name]) => name)
          .join(', ')
      : '';

    const confScore =
      m.flag?.confidence !== undefined
        ? `${Math.round(m.flag.confidence * 100)}%`
        : 'N/A';

    let actionLabel = m.actionTaken || 'flagged_for_review';
    if (actionLabel === 'auto_timed_out') actionLabel = 'Auto-Timed Out (600s)';
    else if (actionLabel === 'auto_purged') actionLabel = 'Auto-Purged from Stream';
    else if (actionLabel === 'timed_out') actionLabel = 'Manual Timeout (600s)';
    else if (actionLabel === 'purged') actionLabel = 'Manual Purge';
    else if (actionLabel === 'flagged_for_review') actionLabel = 'Pending Moderator Review';

    rows.push([
      escapeCell(recordType),
      escapeCell(m.id || `flag_${Date.now()}`),
      escapeCell(m.timestamp || new Date().toLocaleTimeString()),
      escapeCell(channelName),
      escapeCell(m.user || 'Unknown'),
      escapeCell(actionLabel),
      escapeCell(m.penaltyDuration ? `${m.penaltyDuration}s` : (actionLabel.includes('Timed Out') ? '600s' : '0s')),
      escapeCell(m.flag?.reason || 'Policy Violation Detected'),
      escapeCell(categoriesList || 'Safety Filter'),
      escapeCell(confScore),
      escapeCell(m.text || ''),
      escapeCell(m.engine || 'OpenAI Moderation Engine'),
      escapeCell(m.sentiment?.score !== undefined ? m.sentiment.score : ''),
      escapeCell(m.sentiment?.label || '')
    ].join(','));
  });

  // 2. Process Recent Enforcements that are not already in flagged queue
  recentEnforcements.forEach((e) => {
    if (flaggedMap.has(e.id)) return; // Avoid redundant entry

    const categoriesList = e.flag?.categories
      ? Object.entries(e.flag.categories)
          .filter(([_, active]) => Boolean(active))
          .map(([name]) => name)
          .join(', ')
      : '';

    let actionLabel = e.actionTaken || 'enforced';
    if (actionLabel === 'auto_timed_out') actionLabel = 'Auto-Timed Out (600s)';
    else if (actionLabel === 'auto_purged') actionLabel = 'Auto-Purged from Stream';
    else if (actionLabel === 'timed_out') actionLabel = 'Manual Timeout (600s)';
    else if (actionLabel === 'purged') actionLabel = 'Manual Purge';

    rows.push([
      escapeCell('DIRECT_ENFORCEMENT_ACTION'),
      escapeCell(e.id || `enf_${Date.now()}`),
      escapeCell(e.timestamp || new Date().toLocaleTimeString()),
      escapeCell(channelName),
      escapeCell(e.user || 'Unknown'),
      escapeCell(actionLabel),
      escapeCell(e.penaltyDuration ? `${e.penaltyDuration}s` : (actionLabel.includes('Timed Out') ? '600s' : '0s')),
      escapeCell(e.flag?.reason || e.text || 'Direct Moderator Penalty'),
      escapeCell(categoriesList || 'Administrative Action'),
      escapeCell(e.flag?.confidence ? `${Math.round(e.flag.confidence * 100)}%` : '100%'),
      escapeCell(e.text || 'Action executed on chatter'),
      escapeCell(e.engine || 'Streamer Moderator'),
      escapeCell(e.sentiment?.score !== undefined ? e.sentiment.score : ''),
      escapeCell(e.sentiment?.label || '')
    ].join(','));
  });

  const headerRow = headers.map(escapeCell).join(',');
  // Prepend UTF-8 BOM (\uFEFF) for optimal Excel and Google Sheets character rendering
  return '\uFEFF' + [headerRow, ...rows].join('\r\n');
}

export default function FlaggedQueue({
  flaggedMessages = [],
  recentEnforcements = [],
  currentChannel = 'streamer',
  onPurgeMessage,
  onTimeoutUser,
  onPardonMessage,
  onClearAllFlagged
}) {
  const [activeTab, setActiveTab] = useState('flagged'); // 'flagged' | 'enforcements'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [downloadStatus, setDownloadStatus] = useState('idle'); // 'idle' | 'success'

  const totalRecords = flaggedMessages.length + recentEnforcements.length;

  // Filtered flagged items
  const filteredFlagged = flaggedMessages.filter((m) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'harassment') {
      return (
        m.flag?.categories?.harassment ||
        m.flag?.reason?.toLowerCase().includes('harass') ||
        m.flag?.reason?.toLowerCase().includes('toxic')
      );
    }
    if (categoryFilter === 'hate') {
      return m.flag?.categories?.hate || m.flag?.reason?.toLowerCase().includes('hate');
    }
    if (categoryFilter === 'spam') {
      return (
        m.flag?.categories?.spam ||
        m.flag?.reason?.toLowerCase().includes('spam') ||
        m.flag?.reason?.toLowerCase().includes('caps')
      );
    }
    if (categoryFilter === 'threat') {
      return (
        m.flag?.categories?.['self-harm'] ||
        m.flag?.categories?.violence ||
        m.flag?.reason?.toLowerCase().includes('threat') ||
        m.flag?.reason?.toLowerCase().includes('harm')
      );
    }
    return true;
  });

  // Handle CSV Download
  const handleDownloadCSV = () => {
    if (totalRecords === 0) return;

    try {
      const csvData = formatModerationHistoryCSV(flaggedMessages, recentEnforcements, currentChannel);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const cleanChannel = (currentChannel || 'streamer').replace(/[^a-zA-Z0-9_-]/g, '');

      link.setAttribute('href', url);
      link.setAttribute('download', `twitch_moderation_history_${cleanChannel}_${dateStr}_${timeStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2500);
    } catch (err) {
      console.error('Error generating CSV export:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#090d16] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            OpenAI Automated Flagging Queue
          </h3>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {flaggedMessages.length} flagged • {recentEnforcements.length} enforced
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={handleDownloadCSV}
            disabled={totalRecords === 0}
            title={totalRecords === 0 ? 'No incidents or enforcements to export yet' : 'Download complete moderation audit history as CSV'}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
              totalRecords === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                : downloadStatus === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-[#9146FF] hover:bg-[#772ce8] text-white shadow-[#9146FF]/20 active:scale-95'
            }`}
          >
            {downloadStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>CSV Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
                <span className="text-[10px] font-mono bg-white/20 px-1 rounded">
                  {totalRecords}
                </span>
              </>
            )}
          </button>

          {/* Clear Log Button */}
          {flaggedMessages.length > 0 && (
            <button
              onClick={onClearAllFlagged}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60"
              title="Clear flagged incidents from active queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation: Queue vs Enforcements History */}
      <div className="flex items-center justify-between pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-lg text-xs font-bold">
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'flagged'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Active Incidents</span>
            <span className="text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded-full">
              {flaggedMessages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('enforcements')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'enforcements'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gavel className="w-3.5 h-3.5 text-amber-500" />
            <span>Enforcement Audit</span>
            <span className="text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded-full">
              {recentEnforcements.length}
            </span>
          </button>
        </div>

        {/* Post-stream quick indicator */}
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <FileSpreadsheet className="w-3 h-3 text-[#9146FF]" />
          <span>Post-Stream Analysis Ready</span>
        </div>
      </div>

      {/* Segmented Filter Controls (Only shown for Flagged Queue tab) */}
      {activeTab === 'flagged' && (
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            All Violations ({flaggedMessages.length})
          </button>
          <button
            onClick={() => setCategoryFilter('harassment')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              categoryFilter === 'harassment'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            Harassment
          </button>
          <button
            onClick={() => setCategoryFilter('hate')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              categoryFilter === 'hate'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            Hate Speech
          </button>
          <button
            onClick={() => setCategoryFilter('spam')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              categoryFilter === 'spam'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            Spam & CAPS
          </button>
          <button
            onClick={() => setCategoryFilter('threat')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
              categoryFilter === 'threat'
                ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-900/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            Threats & Harm
          </button>
        </div>
      )}

      {/* Flagged Table / List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-1">
        {activeTab === 'flagged' ? (
          filteredFlagged.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-300">Channel Clean & Clear</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                No active flagged incidents in this category.
              </p>
            </div>
          ) : (
            filteredFlagged.map((item) => {
              const confPct = Math.round((item.flag?.confidence || 0) * 100);
              const isTimedOut = item.actionTaken === 'auto_timed_out' || item.actionTaken === 'timed_out';
              const isPurged = item.actionTaken === 'auto_purged' || item.actionTaken === 'purged';

              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col gap-2 shadow-2xs"
                >
                  {/* Top Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {item.timestamp}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-200">
                        {item.user}
                      </span>
                      <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">
                        {item.flag?.reason || 'Violation'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Conf:</span>
                      <span
                        className={`font-bold ${
                          confPct > 80 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {confPct}%
                      </span>
                    </div>
                  </div>

                  {/* Message Snippet */}
                  <div className="text-xs font-mono text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded border border-slate-200 dark:border-slate-800 break-words font-medium">
                    "{item.text}"
                  </div>

                  {/* Enforcement status & reviewer actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Action:</span>
                      <span
                        className={`font-bold ${
                          isTimedOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : isPurged
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-cyan-600 dark:text-cyan-400'
                        }`}
                      >
                        {isTimedOut
                          ? 'Auto-Timed Out (600s)'
                          : isPurged
                          ? 'Auto-Purged from Stream'
                          : 'Flagged for Moderator Review'}
                      </span>
                    </div>

                    {/* Review Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTimeoutUser(item.user, item.id)}
                        className="px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800/60 rounded flex items-center gap-1 transition-colors"
                        title="Enforce 10m Timeout"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Timeout</span>
                      </button>
                      <button
                        onClick={() => onPurgeMessage(item.id)}
                        className="px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800/60 rounded flex items-center gap-1 transition-colors"
                        title="Purge Message"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Purge</span>
                      </button>
                      <button
                        onClick={() => onPardonMessage(item.id)}
                        className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800/60 rounded flex items-center gap-1 transition-colors"
                        title="Pardon and Restore"
                      >
                        <Check className="w-3 h-3" />
                        <span>Pardon</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Enforcements History Tab */
          recentEnforcements.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
              <Gavel className="w-8 h-8 text-amber-500 mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-300">No Enforcements Yet</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automated timeouts, purges, and moderator actions will appear here.
              </p>
            </div>
          ) : (
            recentEnforcements.map((enf, idx) => {
              const isTimeout = enf.actionTaken?.includes('time');
              const isPurge = enf.actionTaken?.includes('purge');

              return (
                <div
                  key={enf.id || `enf_${idx}`}
                  className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col gap-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {enf.timestamp || 'Just now'}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-200">
                        {enf.user}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isTimeout
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : isPurge
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-[#9146FF]/10 text-[#9146FF] border-[#9146FF]/30'
                        }`}
                      >
                        {isTimeout ? 'TIMED OUT (600s)' : isPurge ? 'MESSAGE PURGED' : 'ACTION ENFORCED'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {enf.engine || 'System Auto-Mod'}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded border border-slate-200 dark:border-slate-800/80 break-words">
                    {enf.text}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Post-Stream Audit Footer Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px]">
            Audit records logged: <strong className="text-slate-900 dark:text-slate-200">{totalRecords}</strong> total (
            {flaggedMessages.length} queue, {recentEnforcements.length} enforcements)
          </span>
        </div>

        <button
          onClick={handleDownloadCSV}
          disabled={totalRecords === 0}
          className="text-[11px] font-bold text-[#9146FF] hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Save History (.CSV)</span>
        </button>
      </div>
    </div>
  );
}
