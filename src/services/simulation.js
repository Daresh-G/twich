/**
 * Twitch Chat Simulator
 * High-fidelity scenario engine for testing live moderation, sentiment spikes, and audience polls.
 */

const USERS = [
  { name: 'ValkyrieAce', color: '#FF4500', badges: { subscriber: true, vip: true } },
  { name: 'PixelSamurai', color: '#00FF7F', badges: { subscriber: true } },
  { name: 'NeonNova99', color: '#1E90FF', badges: { mod: true } },
  { name: 'ShadowStriker', color: '#DA70D6', badges: {} },
  { name: 'CyberPug', color: '#FFD700', badges: { subscriber: true } },
  { name: 'GlitchGamer', color: '#FF1493', badges: {} },
  { name: 'QuantumRogue', color: '#00FFFF', badges: { subscriber: true } },
  { name: 'EchoZero', color: '#9370DB', badges: {} },
  { name: 'BobaTactician', color: '#32CD32', badges: { subscriber: true } },
  { name: 'ZeroTwoFan', color: '#FF69B4', badges: {} },
  { name: 'ApexLegend_X', color: '#FFA500', badges: { vip: true } },
  { name: 'BotBuster42', color: '#8A2BE2', badges: { mod: true } }
];

const HYPE_MESSAGES = [
  'POGGGERS THAT FLICK WAS UNREAL!!!',
  'W STREAMER LETS GOOOOO 🔥🔥🔥',
  'CLUTCH OR CHOKE? HE ACTUALLY CLUTCHED IT!',
  'SHEEEEEESH 10/10 play right there',
  'LFG GIGACHAD GAMER!!',
  'clip that right now that was filthy',
  'WWWWWWWWWWWW',
  'How did you even see him through the smoke?!',
  'GOAT behavior honestly',
  'INSANE AIM DIFF',
  'POG CHAMPION OF THE WORLD',
  'Cleanest ace I have seen all month!!',
  '!attack ⚔️ strike the raid boss for the squad!',
  '!attack with critical combo!'
];

const RAID_MESSAGES = [
  'YOU SUCK SO BAD UNINSTALL TRASH',
  'BOOOOO DEAD STREAMER L L L L L',
  'FREE DISCORD NITRO CLICK bit.ly/free-nitro-nowww',
  'KYS GARBAGE PLAYER YOU CHOKED',
  'TERRIBLE GAMEPLAY RIGGED AND FAKE',
  'FAT UGLY BOT REPORTED HAHAHA',
  'GET OUT OF DIAMOND YOU BOOSTED NOOB',
  'BUY CHEAP VIEWERS AT fasttwitchsubs.xyz SPAM SPAM SPAM',
  'WORST STREAM ON TWITCH CRY MORE',
  'L L L L L L L L L L L L L L L L L L L L'
];

const POLL_MESSAGES = [
  '!vote 1 definitely go aggressive!',
  '!vote 1 push through B site',
  '!vote 2 play time and save weapons',
  '!vote 2 safe play wins games',
  '!vote 1 W aggression',
  'Option 1 all day',
  '!vote 2 don\'t throw this lead',
  '#1 rush them now',
  '!answer B for the trivia question!',
  '!answer A looks right',
  '!answer B PogChamp for sure',
  'POGCHAMP is the answer!',
  'CLUTCH is the word scramble!',
  '!attack ⚔️ taking down the boss now!',
  '!vote 1 go for the ace!'
];

const CHILL_MESSAGES = [
  'hey everyone happy Monday, how is the stream going?',
  'what keyboard switches are you using today?',
  'that crosshair placement is so crisp',
  'gg last match, you got this next round',
  'did you see the new patch notes dropped earlier?',
  'hydration check king 🥤',
  'the music playlist is so chill today',
  'anyone tried the new update yet?',
  'gl on the rank up grind',
  'nice comms with the team'
];

export class ChatSimulator {
  constructor(onMessage) {
    this.onMessage = onMessage;
    this.intervalId = null;
    this.currentScenario = 'chill';
  }

  start(scenario = 'chill', speedMs = 1200) {
    this.stop();
    this.currentScenario = scenario;

    this.intervalId = setInterval(() => {
      const msg = this.generateMessage(this.currentScenario);
      if (this.onMessage) this.onMessage(msg);
    }, speedMs);
  }

  setScenario(scenario, speedMs) {
    const speed = speedMs || (scenario === 'raid' ? 600 : scenario === 'hype' ? 700 : 1200);
    this.start(scenario, speed);
  }

  generateMessage(scenario) {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    let text = '';

    if (scenario === 'hype') {
      text = HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];
    } else if (scenario === 'raid') {
      // 75% raid messages, 25% normal viewers defending
      if (Math.random() < 0.75) {
        text = RAID_MESSAGES[Math.floor(Math.random() * RAID_MESSAGES.length)];
      } else {
        text = 'Mods please ban these raid bots! Sub mode on!';
      }
    } else if (scenario === 'poll') {
      text = POLL_MESSAGES[Math.floor(Math.random() * POLL_MESSAGES.length)];
    } else {
      text = CHILL_MESSAGES[Math.floor(Math.random() * CHILL_MESSAGES.length)];
    }

    return {
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user: user.name,
      color: user.color,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      badges: user.badges,
      source: 'simulation'
    };
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
