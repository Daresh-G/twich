import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopBar from './components/TopBar.jsx';
import StreamerBar from './components/StreamerBar.jsx';
import KpiMetrics from './components/KpiMetrics.jsx';
import ChatFeed from './components/ChatFeed.jsx';
import SentimentWave from './components/SentimentWave.jsx';
import FlaggedQueue from './components/FlaggedQueue.jsx';
import AudienceParticipation from './components/AudienceParticipation.jsx';
import ObsHudMode from './components/ObsHudMode.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import OpenAiSolutionView from './components/OpenAiSolutionView.jsx';
import InteractiveGames from './components/InteractiveGames.jsx';
import AiChatbot from './components/AiChatbot.jsx';
import ToxicitySpikeAlert from './components/ToxicitySpikeAlert.jsx';
import ProjectDemoModal from './components/ProjectDemoModal.jsx';

import { TwitchIrcClient } from './services/twitchIrc.js';
import { ChatSimulator } from './services/simulation.js';
import { moderateMessage } from './services/moderator.js';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('monitor'); // 'monitor' | 'sentiment' | 'queue' | 'audience' | 'games' | 'solution'
  const [isObsMode, setIsObsMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('twitch_pulse_theme') || 'dark');

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('twitch_pulse_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Settings & Rules State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('twitch_pulse_openai_key') || '');
  const [rules, setRules] = useState({
    autoDeleteThreshold: 0.70,
    autoTimeoutThreshold: 0.85,
    timeoutDuration: 600,
    raidShieldActive: false
  });

  // Source & Connectivity State
  const [sourceMode, setSourceMode] = useState('simulation'); // 'simulation' | 'live_twitch'
  const [currentChannel, setCurrentChannel] = useState('shroud');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [currentScenario, setCurrentScenario] = useState('hype');

  // Chat Data & Telemetry
  const [messages, setMessages] = useState<any[]>([]);
  const [flaggedMessages, setFlaggedMessages] = useState<any[]>([]);
  const [recentEnforcements, setRecentEnforcements] = useState<any[]>([]);
  const [sentimentHistory, setSentimentHistory] = useState<any[]>([
    { timestamp: '12:00:00', score: 0.2, hype: 30, count: 5 },
    { timestamp: '12:00:05', score: 0.45, hype: 55, count: 12 },
    { timestamp: '12:00:10', score: 0.68, hype: 82, count: 18 },
    { timestamp: '12:00:15', score: 0.72, hype: 90, count: 24 }
  ]);
  const [currentSentimentScore, setCurrentSentimentScore] = useState(0.65);
  const [currentSentimentLabel, setCurrentSentimentLabel] = useState('positive');
  const [hypeLevel, setHypeLevel] = useState(78);
  const [messagesPerSec, setMessagesPerSec] = useState(14);
  const [totalParsed, setTotalParsed] = useState(0);

  // Toxicity Spike Alert Watchdog (< 0.3 for > 30 seconds)
  const [lowSentimentSeconds, setLowSentimentSeconds] = useState(0);
  const [isToxicityAlertDismissed, setIsToxicityAlertDismissed] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Audience Participation (Track 2 Focus)
  const [activePoll, setActivePoll] = useState<any>({
    id: 'poll_initial',
    question: 'Clutch or Choke: Will streamer win this 1v3 round?',
    options: [
      { id: '1', label: 'EZ Clutch (W)', votes: 42 },
      { id: '2', label: 'Unlucky Choke (L)', votes: 14 }
    ],
    totalVotes: 56,
    status: 'active'
  });
  const [isGeneratingPoll, setIsGeneratingPoll] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState([
    { word: 'POG', count: 48 },
    { word: 'W', count: 39 },
    { word: 'CLUTCH', count: 28 },
    { word: 'LFG', count: 21 },
    { word: 'SHEESH', count: 19 }
  ]);

  // Clients refs
  const ircClientRef = useRef<any>(null);
  const simulatorRef = useRef<any>(null);
  const msgRateCounterRef = useRef<number>(0);
  const activePollRef = useRef<any>(activePoll);

  useEffect(() => {
    activePollRef.current = activePoll;
  }, [activePoll]);

  // Process incoming raw message
  const handleRawMessage = useCallback(async (rawMsg) => {
    msgRateCounterRef.current += 1;
    setTotalParsed((prev) => prev + 1);

    // Check if message is a poll vote
    const currentPoll = activePollRef.current;
    if (currentPoll && currentPoll.status === 'active') {
      const lowerText = rawMsg.text.toLowerCase().trim();
      let voteIndex = -1;

      if (lowerText.includes('!vote 1') || lowerText === '#1' || lowerText === '1' || lowerText.startsWith('!1')) {
        voteIndex = 0;
      } else if (lowerText.includes('!vote 2') || lowerText === '#2' || lowerText === '2' || lowerText.startsWith('!2')) {
        voteIndex = 1;
      } else if (lowerText.includes('!vote 3') || lowerText === '#3' || lowerText === '3' || lowerText.startsWith('!3')) {
        voteIndex = 2;
      } else {
        // Option label partial match
        currentPoll.options.forEach((opt, idx) => {
          if (lowerText.includes(opt.label.toLowerCase())) {
            voteIndex = idx;
          }
        });
      }

      if (voteIndex >= 0 && voteIndex < currentPoll.options.length) {
        setActivePoll((prev) => {
          if (!prev) return prev;
          const nextOpts = [...prev.options];
          nextOpts[voteIndex] = {
            ...nextOpts[voteIndex],
            votes: nextOpts[voteIndex].votes + 1
          };
          return {
            ...prev,
            options: nextOpts,
            totalVotes: prev.totalVotes + 1
          };
        });
      }
    }

    // Run moderation
    const processed = await moderateMessage(rawMsg, apiKey, rules);

    // Update message buffer
    setMessages((prev) => {
      const next = [...prev, processed];
      return next.slice(-200); // keep last 200
    });

    // If flagged or action taken, log incident
    if (processed.flag?.isFlagged || processed.actionTaken !== 'none') {
      setFlaggedMessages((prev) => [processed, ...prev].slice(0, 100));
      if (processed.actionTaken !== 'none') {
        setRecentEnforcements((prev) => [processed, ...prev].slice(0, 30));
      }
    }

    // Update live sentiment & hype metrics
    if (processed.sentiment) {
      setCurrentSentimentScore((prev) => {
        const blended = prev * 0.8 + processed.sentiment.score * 0.2;
        return parseFloat(blended.toFixed(2));
      });
      setCurrentSentimentLabel(processed.sentiment.label);
      setHypeLevel((prev) => {
        const boost = processed.sentiment.hypeScore > 0 ? 8 : -2;
        return Math.max(0, Math.min(100, prev + boost));
      });
    }
  }, [apiKey, rules]);

  // Periodic Telemetry Aggregator (runs every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate messages per second
      const rate = Math.round(msgRateCounterRef.current / 3);
      setMessagesPerSec(rate);
      msgRateCounterRef.current = 0;

      // Update sentiment history curve
      setSentimentHistory((prev) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newPoint = {
          timestamp: now,
          score: currentSentimentScore,
          hype: hypeLevel,
          count: rate
        };
        const next = [...prev, newPoint];
        return next.slice(-30);
      });

      // Update trending keywords from recent messages
      setMessages((currentMsgs) => {
        const recentWords: Record<string, number> = {};
        currentMsgs.slice(-40).forEach((m) => {
          const words = m.text.toUpperCase().split(/\s+/);
          words.forEach((w) => {
            const clean = w.replace(/[^A-Z0-9]/g, '');
            if (clean.length >= 2 && !['THE', 'AND', 'FOR', 'YOU', 'THAT', 'WITH', 'THIS'].includes(clean)) {
              recentWords[clean] = (recentWords[clean] || 0) + 1;
            }
          });
        });
        const sorted = Object.entries(recentWords)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 5)
          .map(([word, count]) => ({ word, count: count as number }));
        if (sorted.length > 0) {
          setTrendingKeywords(sorted);
        }
        return currentMsgs;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSentimentScore, hypeLevel]);

  // Telemetry Toxicity Spike Watchdog (Tracks continuous sentiment < 0.30 for > 30s)
  useEffect(() => {
    const watchdogTimer = setInterval(() => {
      if (currentSentimentScore < 0.3) {
        setLowSentimentSeconds((prev) => prev + 1);
      } else {
        setLowSentimentSeconds(0);
        setIsToxicityAlertDismissed(false);
      }
    }, 1000);

    return () => clearInterval(watchdogTimer);
  }, [currentSentimentScore]);

  // Initialize Simulator on Mount
  useEffect(() => {
    simulatorRef.current = new ChatSimulator(handleRawMessage);
    if (sourceMode === 'simulation') {
      simulatorRef.current.start(currentScenario, 900);
    }

    return () => {
      if (simulatorRef.current) simulatorRef.current.stop();
      if (ircClientRef.current) ircClientRef.current.disconnect();
    };
  }, []);

  // Connect to Live Twitch Channel
  const handleConnectLiveChannel = (channelName) => {
    if (simulatorRef.current) simulatorRef.current.stop();

    setCurrentChannel(channelName);
    setSourceMode('live_twitch');

    if (ircClientRef.current) {
      ircClientRef.current.disconnect();
    }

    ircClientRef.current = new TwitchIrcClient(
      channelName,
      handleRawMessage,
      (status) => setConnectionStatus(status)
    );
    ircClientRef.current.connect();
  };

  // Switch to Simulation Scenario
  const handleSelectScenario = (scenario) => {
    if (ircClientRef.current) {
      ircClientRef.current.disconnect();
    }
    setSourceMode('simulation');
    setCurrentScenario(scenario);
    setConnectionStatus('simulating');

    if (simulatorRef.current) {
      simulatorRef.current.setScenario(scenario);
    }
  };

  // Moderator Manual Action Handlers
  const handlePurgeMessage = (messageId) => {
    let purgedTarget: any = null;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          purgedTarget = { ...m, actionTaken: 'purged' };
          return purgedTarget;
        }
        return m;
      })
    );
    setFlaggedMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          if (!purgedTarget) purgedTarget = { ...m, actionTaken: 'purged' };
          return { ...m, actionTaken: 'purged' };
        }
        return m;
      })
    );
    if (purgedTarget) {
      setRecentEnforcements((prev) => [
        {
          id: `purge_${Date.now()}_${purgedTarget.id}`,
          user: purgedTarget.user || 'Unknown',
          actionTaken: 'purged',
          text: purgedTarget.text || 'Message purged by moderator',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          flag: purgedTarget.flag,
          engine: purgedTarget.engine || 'streamer_mod'
        },
        ...prev
      ].slice(0, 50));
    }
  };

  const handleTimeoutUser = (username, messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.user === username || m.id === messageId
          ? { ...m, actionTaken: 'timed_out', penaltyDuration: 600 }
          : m
      )
    );
    setFlaggedMessages((prev) =>
      prev.map((m) =>
        m.user === username || m.id === messageId
          ? { ...m, actionTaken: 'timed_out', penaltyDuration: 600 }
          : m
      )
    );
    setRecentEnforcements((prev) => [
      {
        id: `timeout_${Date.now()}`,
        user: username,
        actionTaken: 'timed_out',
        text: 'User suspended for 600 seconds',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev
    ]);
  };

  const handlePardonMessage = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, actionTaken: 'none', flag: { ...m.flag, isFlagged: false } } : m
      )
    );
    setFlaggedMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleClearAllFlagged = () => {
    setFlaggedMessages([]);
  };

  // Audience Participation Actions
  const handleVoteOption = (optionId) => {
    if (!activePoll) return;
    setActivePoll((prev) => {
      const nextOpts = prev.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      );
      return {
        ...prev,
        options: nextOpts,
        totalVotes: prev.totalVotes + 1
      };
    });
  };

  const handleAutoGeneratePoll = async () => {
    setIsGeneratingPoll(true);
    try {
      const res = await fetch('/api/auto-poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-15),
          apiKey: apiKey || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.question && Array.isArray(data.options)) {
          setActivePoll({
            id: `poll_${Date.now()}`,
            question: data.question,
            options: data.options.map((label, idx) => ({
              id: `${idx + 1}`,
              label,
              votes: 0
            })),
            totalVotes: 0,
            status: 'active'
          });
        }
      }
    } catch (e) {
      console.warn('Auto poll failed:', e);
    } finally {
      setIsGeneratingPoll(false);
    }
  };

  const handleToggleRaidShield = () => {
    setRules((prev) => ({
      ...prev,
      raidShieldActive: !prev.raidShieldActive
    }));
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('twitch_pulse_openai_key', newKey);
  };

  // Toxicity Alert State & Action Handlers
  const isToxicityAlertActive = lowSentimentSeconds >= 30 && !isToxicityAlertDismissed;

  const handleTriggerTestSpike = () => {
    setCurrentSentimentScore(0.18);
    setCurrentSentimentLabel('negative');
    setLowSentimentSeconds(32);
    setIsToxicityAlertDismissed(false);
  };

  const handleSimulateRecovery = () => {
    setCurrentSentimentScore(0.72);
    setCurrentSentimentLabel('positive');
    setLowSentimentSeconds(0);
    setIsToxicityAlertDismissed(false);
  };

  const handleDismissToxicityAlert = () => {
    setIsToxicityAlertDismissed(true);
  };

  const handlePurgeNegativeFromAlert = () => {
    handleClearAllFlagged();
    setMessages((prev) =>
      prev.map((m) =>
        m.sentiment && m.sentiment.score < 0
          ? { ...m, actionTaken: 'purged' }
          : m
      )
    );
  };

  // If in OBS Dock Mode, render the minimalist streamer HUD
  if (isObsMode) {
    return (
      <ObsHudMode
        onExitObsMode={() => setIsObsMode(false)}
        currentChannel={currentChannel}
        sentimentScore={currentSentimentScore}
        sentimentLabel={currentSentimentLabel}
        hypeLevel={hypeLevel}
        activePoll={activePoll}
        totalVotes={activePoll ? activePoll.totalVotes : 0}
        recentEnforcements={recentEnforcements}
        raidShieldActive={rules.raidShieldActive}
        onToggleRaidShield={handleToggleRaidShield}
      />
    );
  }

  // Calculate enforcements counts
  const autoPurgedCount = recentEnforcements.filter((e) => e.actionTaken?.includes('purge')).length;
  const autoTimedOutCount = recentEnforcements.filter((e) => e.actionTaken?.includes('time')).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080b11] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Top Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleObsMode={() => setIsObsMode(true)}
        isObsMode={isObsMode}
        hasApiKey={Boolean(apiKey)}
        raidShieldActive={rules.raidShieldActive}
        onToggleRaidShield={handleToggleRaidShield}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenDemoVideo={() => setIsDemoModalOpen(true)}
      />

      {/* 2. Channel Connect & Scenario Control Bar */}
      <StreamerBar
        sourceMode={sourceMode}
        setSourceMode={setSourceMode}
        currentChannel={currentChannel}
        connectionStatus={connectionStatus}
        onConnectChannel={handleConnectLiveChannel}
        onDisconnectChannel={() => handleSelectScenario('chill')}
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
      />

      {/* 3. Telemetry KPI Strip */}
      <KpiMetrics
        messagesPerSec={messagesPerSec}
        sentimentScore={currentSentimentScore}
        sentimentLabel={currentSentimentLabel}
        flaggedCount={flaggedMessages.length}
        autoPurgedCount={autoPurgedCount}
        autoTimedOutCount={autoTimedOutCount}
        totalMessages={totalParsed}
        openAiActive={Boolean(apiKey)}
        raidShieldActive={rules.raidShieldActive}
        isToxicityAlertActive={isToxicityAlertActive}
        lowSentimentSeconds={lowSentimentSeconds}
      />

      {/* 3.5. Telemetry Toxicity Spike Visual Notification Alert */}
      <ToxicitySpikeAlert
        isAlertActive={isToxicityAlertActive}
        lowSentimentSeconds={lowSentimentSeconds}
        currentSentimentScore={currentSentimentScore}
        onAcknowledge={handleDismissToxicityAlert}
        onArmRaidShield={handleToggleRaidShield}
        onPurgeNegative={handlePurgeNegativeFromAlert}
        onSimulateRecovery={handleSimulateRecovery}
        onTriggerTestSpike={handleTriggerTestSpike}
        raidShieldActive={rules.raidShieldActive}
      />

      {/* 4. Main Views */}
      {activeTab === 'solution' ? (
        <OpenAiSolutionView />
      ) : activeTab === 'games' ? (
        <InteractiveGames
          chatMessages={messages}
          hypeLevel={hypeLevel}
          onBroadcastGameToChat={(text: string) => {
            handleRawMessage({
              id: `game_announce_${Date.now()}`,
              user: 'PulseBot',
              color: '#9146FF',
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              badges: { mod: true },
              source: 'game_engine'
            });
          }}
        />
      ) : (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* Column 1: Live Moderated Stream (Width: 4/12) */}
          <section className={`lg:col-span-4 h-[calc(100vh-210px)] min-h-[500px] ${activeTab !== 'monitor' && 'hidden lg:block'}`}>
            <ChatFeed
              messages={messages}
              onSendMessage={(text) => {
                handleRawMessage({
                  id: `user_test_${Date.now()}`,
                  user: 'HackathonJudge',
                  color: '#10b981',
                  text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  badges: { broadcaster: true },
                  source: 'test_input'
                });
              }}
              onPurgeMessage={handlePurgeMessage}
              onTimeoutUser={handleTimeoutUser}
              onPardonMessage={handlePardonMessage}
            />
          </section>

          {/* Column 2: Sentiment Wave & Flagged Queue (Width: 5/12) */}
          <section
            className={`lg:col-span-5 h-[calc(100vh-210px)] min-h-[500px] p-4 flex flex-col gap-4 overflow-y-auto border-r border-slate-200 dark:border-slate-800/80 ${
              activeTab === 'audience' && 'hidden lg:flex'
            }`}
          >
            {/* Sentiment Wave Visualizer */}
            <SentimentWave
              history={sentimentHistory}
              currentScore={currentSentimentScore}
              currentHype={hypeLevel}
            />

            {/* Flagged Incident Queue */}
            <div className="flex-1 min-h-[300px]">
              <FlaggedQueue
                flaggedMessages={flaggedMessages}
                recentEnforcements={recentEnforcements}
                currentChannel={currentChannel}
                onPurgeMessage={handlePurgeMessage}
                onTimeoutUser={handleTimeoutUser}
                onPardonMessage={handlePardonMessage}
                onClearAllFlagged={handleClearAllFlagged}
              />
            </div>
          </section>

          {/* Column 3: Audience Participation & Hype Console (Width: 3/12) */}
          <section className={`lg:col-span-3 h-[calc(100vh-210px)] min-h-[500px] p-4 overflow-y-auto ${activeTab !== 'audience' && 'hidden lg:block'}`}>
            <AudienceParticipation
              hypeLevel={hypeLevel}
              activePoll={activePoll}
              onVoteOption={handleVoteOption}
              onCreatePoll={(poll) => setActivePoll(poll)}
              onEndPoll={() => setActivePoll(null)}
              onAutoGeneratePoll={handleAutoGeneratePoll}
              isGeneratingPoll={isGeneratingPoll}
              trendingKeywords={trendingKeywords}
            />
          </section>
        </main>
      )}

      {/* 5. AI Chatbot Copilot (Persistent Floating Assistant) */}
      <AiChatbot
        apiKey={apiKey}
        currentChannel={currentChannel}
        sentimentScore={currentSentimentScore}
        hypeLevel={hypeLevel}
        flaggedCount={flaggedMessages.length}
        recentEnforcements={recentEnforcements}
      />

      {/* Settings & OpenAI Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        rules={rules}
        onSaveRules={(newRules) => setRules(newRules)}
      />

      {/* 3-Minute Project Demo Video Presentation Modal */}
      <ProjectDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
