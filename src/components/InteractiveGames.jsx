import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, Sparkles, RefreshCw, Timer, CheckCircle2, Zap, HelpCircle, Award, Play, Swords, ShieldAlert, Flame, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';

const WORD_BANK = [
  { word: 'POGCHAMP', hint: 'The legendary face of ultimate Twitch hype' },
  { word: 'HEADSHOT', hint: 'One tap precision in tactical shooters' },
  { word: 'VALORANT', hint: 'Riot Games 5v5 tactical hero shooter' },
  { word: 'GIGACHAD', hint: 'Peak confidence, dominant gameplay attitude' },
  { word: 'OVERCLOCK', hint: 'Pushing hardware beyond factory limits' },
  { word: 'CLUTCH', hint: 'Winning a 1v3 or 1v4 round under intense pressure' }
];

const BOSS_LIST = [
  { name: 'The Toxic Hydra', level: 99, maxHp: 1000, title: 'Lord of Chat Toxicity & Spam', avatar: '🐉', color: 'from-emerald-600 to-teal-800' },
  { name: 'Spam Behemoth', level: 75, maxHp: 800, title: 'Ancient Scourge of Copypastas', avatar: '👾', color: 'from-purple-600 to-indigo-800' },
  { name: 'Prompt Injector Golem', level: 88, maxHp: 950, title: 'Corrupted Adversarial Jailbreaker', avatar: '🤖', color: 'from-rose-600 to-amber-700' }
];

export default function InteractiveGames({ onBroadcastGameToChat, chatMessages, hypeLevel = 50 }) {
  const [activeGameTab, setActiveGameTab] = useState('raid'); // 'raid' | 'trivia' | 'anagram' | 'reaction'

  // Boss Raid State
  const [bossIndex, setBossIndex] = useState(0);
  const currentBoss = BOSS_LIST[bossIndex];
  const [bossHp, setBossHp] = useState(BOSS_LIST[0].maxHp);
  const [isBossHit, setIsBossHit] = useState(false);
  const [raidLogs, setRaidLogs] = useState([
    { id: '1', user: 'ValkyrieAce', dmg: 45, isCrit: false, time: 'Just now' },
    { id: '2', user: 'NeonNova99', dmg: 120, isCrit: true, time: '1s ago' }
  ]);
  const [mvpChatter, setMvpChatter] = useState({ user: 'NeonNova99', totalDmg: 120 });
  const processedMessageIds = useRef(new Set());

  // Trivia Game State
  const [trivia, setTrivia] = useState({
    id: 'trivia_1',
    question: "Which iconic Twitch emote was inspired by professional fighting game personality Ryan Gutierrez?",
    options: ["LUL", "PogChamp", "Kappa", "BibleThump"],
    correctOptionIndex: 1,
    explanation: "PogChamp originated from an outtake of Ryan 'Gootecks' Gutierrez during a Cross Counter TV episode."
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [triviaTimer, setTriviaTimer] = useState(25);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [chatAnswers, setChatAnswers] = useState({ 0: 12, 1: 48, 2: 8, 3: 4 });
  const [isLoadingTrivia, setIsLoadingTrivia] = useState(false);

  // Anagram Scramble State
  const [currentAnagramIdx, setCurrentAnagramIdx] = useState(0);
  const [anagramScramble, setAnagramScramble] = useState('POGCHAMP');
  const [scrambleAnsweredBy, setScrambleAnsweredBy] = useState(null);

  // Reflex Reaction State
  const [reactionState, setReactionState] = useState('waiting'); // 'waiting' | 'ready' | 'go' | 'finished'
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionScore, setReactionScore] = useState(null);
  const reactionTimerRef = useRef(null);

  // Scramble word logic
  useEffect(() => {
    const original = WORD_BANK[currentAnagramIdx].word;
    const scrambled = original
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    setAnagramScramble(scrambled === original ? scrambled.split('').reverse().join('') : scrambled);
    setScrambleAnsweredBy(null);
  }, [currentAnagramIdx]);

  // Trivia countdown timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && triviaTimer > 0 && !triviaRevealed) {
      interval = setInterval(() => {
        setTriviaTimer((prev) => prev - 1);
      }, 1000);
    } else if (triviaTimer === 0 && !triviaRevealed) {
      revealTrivia();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, triviaTimer, triviaRevealed]);

  // Listen to incoming chat messages for: !attack, trivia answers, or anagram solutions!
  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0) return;
    const latestMsg = chatMessages[chatMessages.length - 1];
    if (!latestMsg || !latestMsg.id) return;

    if (processedMessageIds.current.has(latestMsg.id)) return;
    processedMessageIds.current.add(latestMsg.id);

    // Keep set bounded
    if (processedMessageIds.current.size > 200) {
      const arr = Array.from(processedMessageIds.current);
      processedMessageIds.current = new Set(arr.slice(-100));
    }

    const lower = latestMsg.text.toLowerCase().trim();

    // 1. Boss Raid Listener: !attack or !strike
    if (bossHp > 0 && (lower.includes('!attack') || lower.includes('!strike') || lower.includes('!hit'))) {
      const isOverdrive = hypeLevel >= 80;
      const baseDmg = Math.floor(Math.random() * 25) + 20;
      const actualDmg = isOverdrive ? baseDmg * 3 : baseDmg;

      triggerBossDamage(latestMsg.user || 'Viewer', actualDmg, isOverdrive);
    }

    // 2. Trivia answer listener
    if (!triviaRevealed) {
      let optIdx = -1;
      if (lower === '!answer a' || lower === '#a' || lower === 'a') optIdx = 0;
      else if (lower === '!answer b' || lower === '#b' || lower === 'b') optIdx = 1;
      else if (lower === '!answer c' || lower === '#c' || lower === 'c') optIdx = 2;
      else if (lower === '!answer d' || lower === '#d' || lower === 'd') optIdx = 3;

      if (optIdx >= 0) {
        setChatAnswers((prev) => ({
          ...prev,
          [optIdx]: (prev[optIdx] || 0) + 1
        }));
      }
    }

    // 3. Anagram solution listener
    const targetWord = WORD_BANK[currentAnagramIdx].word.toLowerCase();
    if (!scrambleAnsweredBy && lower.includes(targetWord)) {
      setScrambleAnsweredBy({
        user: latestMsg.user,
        timestamp: latestMsg.timestamp
      });
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  }, [chatMessages, bossHp, hypeLevel, triviaRevealed, currentAnagramIdx, scrambleAnsweredBy]);

  // Boss Damage Trigger
  const triggerBossDamage = (username, dmg, isCrit) => {
    setIsBossHit(true);
    setTimeout(() => setIsBossHit(false), 250);

    setBossHp((prev) => {
      const nextHp = Math.max(0, prev - dmg);
      if (nextHp === 0 && prev > 0) {
        // Boss Defeated!
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        if (onBroadcastGameToChat) {
          onBroadcastGameToChat(`🏆 BOSS DEFEATED! Twitch Chat vanquished ${currentBoss.name}! MVP: @${username}!`);
        }
      }
      return nextHp;
    });

    const newLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      user: username,
      dmg,
      isCrit,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setRaidLogs((prev) => [newLog, ...prev.slice(0, 5)]);

    setMvpChatter((prev) => {
      if (!prev || dmg > prev.totalDmg) {
        return { user: username, totalDmg: (prev?.totalDmg || 0) + dmg };
      }
      return prev;
    });
  };

  const handleManualStrike = () => {
    if (bossHp <= 0) return;
    const isOverdrive = hypeLevel >= 80;
    const dmg = isOverdrive ? 105 : 35;
    triggerBossDamage('Streamer & Chat', dmg, isOverdrive);
  };

  const handleHypeSpell = () => {
    if (bossHp <= 0) return;
    const isOverdrive = hypeLevel >= 80;
    const dmg = isOverdrive ? 360 : 120;
    triggerBossDamage('Hype Shockwave', dmg, true);
    confetti({ particleCount: 40, spread: 45 });
  };

  const handleRespawnBoss = () => {
    const nextIdx = (bossIndex + 1) % BOSS_LIST.length;
    setBossIndex(nextIdx);
    setBossHp(BOSS_LIST[nextIdx].maxHp);
    setRaidLogs([]);
    if (onBroadcastGameToChat) {
      onBroadcastGameToChat(`⚠️ A NEW RAID BOSS HAS SPAWNED: ${BOSS_LIST[nextIdx].name}! Type !attack in chat to strike!`);
    }
  };

  const revealTrivia = () => {
    setTriviaRevealed(true);
    setIsTimerRunning(false);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
  };

  const handleNextTrivia = async () => {
    setIsLoadingTrivia(true);
    try {
      const res = await fetch('/api/generate-trivia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (res.ok) {
        const data = await res.json();
        setTrivia(data);
        setSelectedAnswer(null);
        setTriviaRevealed(false);
        setTriviaTimer(25);
        setIsTimerRunning(true);
        setChatAnswers({ 0: 0, 1: 0, 2: 0, 3: 0 });
      }
    } catch (e) {
      console.warn('Next trivia error:', e);
    } finally {
      setIsLoadingTrivia(false);
    }
  };

  // Reflex Game Logic
  const startReactionGame = () => {
    setReactionState('ready');
    setReactionScore(null);
    const delay = Math.floor(Math.random() * 2500) + 1500;
    reactionTimerRef.current = setTimeout(() => {
      setReactionState('go');
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'ready') {
      clearTimeout(reactionTimerRef.current);
      setReactionState('waiting');
      setReactionScore('Too early! Wait for green.');
    } else if (reactionState === 'go') {
      const ms = Date.now() - reactionStartTime;
      setReactionScore(`${ms} ms!`);
      setReactionState('finished');
      confetti({ particleCount: 50, spread: 50 });
    }
  };

  const totalTriviaVotes = Object.values(chatAnswers).reduce((a, b) => a + b, 0);
  const hpPercent = Math.round((bossHp / currentBoss.maxHp) * 100);
  const isOverdrive = hypeLevel >= 80;

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto font-sans transition-colors">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-[#0e1424] dark:to-slate-900 border border-purple-200/70 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-[#9146FF]/15 text-[#9146FF] border border-[#9146FF]/30 uppercase tracking-wider">
              Track 2: Audience Participation
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live Chat IRC Commands Active
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#9146FF]" />
            <span>Interactive Twitch Chat Arena & Games</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Live audience participation games linked directly to your Twitch stream. Viewers play in real-time by typing chat commands (`!attack`, `!answer B`, solving anagrams, or competing for top scoreboard ranks).
          </p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => setActiveGameTab('raid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeGameTab === 'raid'
                ? 'bg-[#9146FF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Boss Raid Battle</span>
          </button>
          <button
            onClick={() => setActiveGameTab('trivia')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeGameTab === 'trivia'
                ? 'bg-[#9146FF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Chat Trivia Arena
          </button>
          <button
            onClick={() => setActiveGameTab('anagram')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeGameTab === 'anagram'
                ? 'bg-[#9146FF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Word Scramble Duel
          </button>
          <button
            onClick={() => setActiveGameTab('reaction')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeGameTab === 'reaction'
                ? 'bg-[#9146FF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Clutch Reflex Test
          </button>
        </div>
      </div>

      {/* GAME 4 (FEATURED): TWITCH CHAT BOSS RAID BATTLE */}
      {activeGameTab === 'raid' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          {/* Top Bar with Status and Overdrive Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-[#9146FF] border border-[#9146FF]/30">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {currentBoss.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500/10 text-rose-500 border border-rose-500/30">
                    LV. {currentBoss.level} BOSS
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentBoss.title} • Viewers strike by typing <code className="text-[#9146FF] font-bold">!attack</code> in Twitch Chat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOverdrive && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-black font-mono bg-gradient-to-r from-amber-500 to-rose-500 text-white flex items-center gap-1 shadow-md animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>3X CRIT HYPE OVERDRIVE</span>
                </span>
              )}
              <button
                onClick={handleRespawnBoss}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Boss</span>
              </button>
            </div>
          </div>

          {/* Boss Arena Card */}
          <div className={`p-6 rounded-2xl relative overflow-hidden transition-all duration-300 border ${
            bossHp <= 0
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50'
              : isBossHit
              ? 'bg-rose-500/10 border-rose-500 scale-[0.995]'
              : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
          }`}>
            {/* Ambient Background Aura */}
            <div className={`absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br ${currentBoss.color}`} />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Boss Avatar & Animation */}
              <div className="flex items-center gap-5">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl bg-gradient-to-br ${currentBoss.color} shadow-lg relative select-none transition-transform ${
                  isBossHit ? 'scale-110 rotate-6 shadow-rose-500/50' : 'hover:scale-105'
                }`}>
                  {bossHp <= 0 ? '💀' : currentBoss.avatar}
                  {isBossHit && (
                    <span className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full text-[11px] font-mono font-black bg-rose-500 text-white animate-bounce shadow-md">
                      HIT!
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Raid Boss Health
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                      {bossHp}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                      / {currentBoss.maxHp} HP ({hpPercent}%)
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block">
                    {bossHp <= 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> Boss Vanquished! Twitch Chat Victory!
                      </span>
                    ) : (
                      <span>Weakness: High-Velocity Chat Hype and <code className="text-[#9146FF] font-bold">!attack</code> spam</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleManualStrike}
                  disabled={bossHp <= 0}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-extrabold text-white bg-[#9146FF] hover:bg-[#772ce8] disabled:opacity-40 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#9146FF]/20"
                >
                  <Swords className="w-4 h-4" />
                  <span>Strike Boss {isOverdrive ? '(-105 HP)' : '(-35 HP)'}</span>
                </button>
                <button
                  onClick={handleHypeSpell}
                  disabled={bossHp <= 0}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-40 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Zap className="w-4 h-4" />
                  <span>Hype Blast {isOverdrive ? '(-360 HP)' : '(-120 HP)'}</span>
                </button>
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-300/50 dark:border-slate-700">
                <div
                  style={{ width: `${hpPercent}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    hpPercent > 50
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : hpPercent > 20
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-rose-600 to-rose-500 animate-pulse'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Combat Log & Chat Raid Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Attack Feed */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Recent Chat Strikes</span>
                <span className="text-[10px] text-[#9146FF]">Live Feed</span>
              </h4>
              <div className="space-y-1.5">
                {raidLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs font-mono text-slate-500">
                    Awaiting strikes from Twitch chat... (Type !attack)
                  </div>
                ) : (
                  raidLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          @{log.user}
                        </span>
                        {log.isCrit && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            CRIT!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${log.isCrit ? 'text-rose-500 dark:text-rose-400' : 'text-[#9146FF]'}`}>
                          -{log.dmg} HP
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{log.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Raid MVP & Twitch Chat Rules */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Raid MVP & Mechanics</span>
              </h4>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-[#9146FF]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold block">
                    Top Damage Dealer
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    @{mvpChatter.user}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold block">
                    Damage
                  </span>
                  <span className="text-sm font-black font-mono text-[#9146FF]">
                    {mvpChatter.totalDmg} DMG
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <p>• Type <code className="text-[#9146FF] font-bold">!attack</code> in Twitch chat to damage the boss.</p>
                <p>• When Hype Meter reaches <strong className="text-amber-500">80%+ Overdrive</strong>, all attacks deal <strong className="text-rose-500">3X Critical Damage</strong>.</p>
                <p>• Streamer or mods can broadcast game updates directly to viewers with 1 click.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAME 1: CHAT TRIVIA ARENA */}
      {activeGameTab === 'trivia' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#9146FF]" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Live Esports & Twitch Culture Trivia
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Chatters vote using <code className="text-[#9146FF] font-bold">!answer A</code>, <code className="text-[#9146FF] font-bold">!answer B</code>, etc.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                <Timer className="w-3.5 h-3.5" />
                <span>{triviaTimer}s Left</span>
              </div>

              <button
                onClick={handleNextTrivia}
                disabled={isLoadingTrivia}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#9146FF] hover:bg-[#772ce8] rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTrivia ? 'animate-spin' : ''}`} />
                <span>Next Trivia</span>
              </button>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {trivia.question}
            </h4>
          </div>

          {/* 4 Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trivia.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isCorrect = idx === trivia.correctOptionIndex;
              const isSelected = selectedAnswer === idx;
              const voteCount = chatAnswers[idx] || 0;
              const pct = totalTriviaVotes > 0 ? Math.round((voteCount / totalTriviaVotes) * 100) : 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    triviaRevealed && isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : triviaRevealed && isSelected && !isCorrect
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500'
                      : isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-[#9146FF]'
                      : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    style={{ width: `${pct}%` }}
                    className="absolute left-0 top-0 bottom-0 bg-[#9146FF]/10 dark:bg-[#9146FF]/20 transition-all duration-300 pointer-events-none"
                  />

                  <div className="relative z-10 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md font-mono font-extrabold flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {letter}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">
                        {opt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">{voteCount} votes</span>
                      <span className="font-extrabold text-[#9146FF] dark:text-cyan-400 tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reveal & Explanation Area */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            {!triviaRevealed ? (
              <button
                onClick={revealTrivia}
                className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Reveal Answer & Crown Winners</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 w-full text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-extrabold block text-emerald-700 dark:text-emerald-400">
                  Correct Answer: Option {String.fromCharCode(65 + trivia.correctOptionIndex)} ({trivia.options[trivia.correctOptionIndex]})
                </span>
                <p className="text-[11px] leading-relaxed">
                  {trivia.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME 2: WORD SCRAMBLE / ANAGRAM DUEL */}
      {activeGameTab === 'anagram' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Twitch Chat Word Scramble Duel</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                First chatter to type the correct unscrambled word in Twitch chat wins!
              </p>
            </div>
            <button
              onClick={() => setCurrentAnagramIdx((prev) => (prev + 1) % WORD_BANK.length)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#9146FF] hover:bg-[#772ce8] rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Scramble</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center space-y-3 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
              Unscramble This Gaming Term:
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-[#9146FF] dark:text-[#a96eff]">
              {anagramScramble}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block">
              Hint: "{WORD_BANK[currentAnagramIdx].hint}"
            </span>
          </div>

          {scrambleAnsweredBy ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 text-center space-y-1">
              <Award className="w-6 h-6 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                WINNER DETECTED IN TWITCH CHAT!
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">@{scrambleAnsweredBy.user}</strong> solved it first at {scrambleAnsweredBy.timestamp}!
              </p>
            </div>
          ) : (
            <div className="text-center py-2 text-xs font-mono text-slate-500 dark:text-slate-400 animate-pulse">
              Listening to live Twitch chat stream for the first correct answer...
            </div>
          )}
        </div>
      )}

      {/* GAME 3: CLUTCH REFLEX TEST */}
      {activeGameTab === 'reaction' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Clutch Reaction Time Benchmark</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Benchmark pro gamer reaction speed (average esports player is ~180ms - 220ms).
              </p>
            </div>
          </div>

          <div
            onClick={reactionState === 'waiting' ? startReactionGame : handleReactionClick}
            className={`p-16 rounded-2xl text-center cursor-pointer transition-all select-none border-2 flex flex-col items-center justify-center min-h-[220px] ${
              reactionState === 'waiting'
                ? 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-[#9146FF]'
                : reactionState === 'ready'
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : reactionState === 'go'
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xl shadow-emerald-500/50'
                : 'bg-[#9146FF] text-white border-[#772ce8]'
            }`}
          >
            {reactionState === 'waiting' && (
              <>
                <Play className="w-10 h-10 text-[#9146FF] mb-2" />
                <span className="text-base font-extrabold text-slate-900 dark:text-white">Click Here to Start Reflex Test</span>
                <span className="text-xs text-slate-500 mt-1">Wait for screen to turn green, then click instantly!</span>
              </>
            )}

            {reactionState === 'ready' && (
              <span className="text-xl font-extrabold">WAIT FOR GREEN...</span>
            )}

            {reactionState === 'go' && (
              <span className="text-3xl font-extrabold tracking-wider">CLICK NOW!!</span>
            )}

            {reactionState === 'finished' && (
              <>
                <Trophy className="w-10 h-10 mb-2" />
                <span className="text-3xl font-extrabold font-mono">{reactionScore}</span>
                <span className="text-xs mt-1 font-semibold">Click to Test Again</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
