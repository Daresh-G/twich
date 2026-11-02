/**
 * Twitch IRC Anonymous WebSocket Client
 * Connects directly to public Twitch chat via standard IRC WebSocket protocol
 * Zero OAuth credentials required to read public channel chat!
 */

export class TwitchIrcClient {
  constructor(channel, onMessage, onStatusChange) {
    this.channel = channel ? channel.toLowerCase().replace('#', '') : 'shroud';
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.isManualClosed = false;
  }

  connect() {
    this.isManualClosed = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }

    if (this.onStatusChange) this.onStatusChange('connecting');

    try {
      this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

      this.ws.onopen = () => {
        this.isConnected = true;
        const randomFan = Math.floor(Math.random() * 89999 + 10000);
        // Anonymous Twitch credentials
        this.ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        this.ws.send(`PASS SCHMOOPIIE`);
        this.ws.send(`NICK justinfan${randomFan}`);
        this.ws.send(`USER justinfan${randomFan} 8 * :justinfan${randomFan}`);
        this.ws.send(`JOIN #${this.channel}`);

        if (this.onStatusChange) this.onStatusChange('connected', this.channel);
      };

      this.ws.onmessage = (event) => {
        const raw = event.data;
        if (raw.startsWith('PING')) {
          this.ws.send('PONG :tmi.twitch.tv');
          return;
        }

        const lines = raw.split('\r\n');
        for (const line of lines) {
          if (!line) continue;
          this.parseIrcLine(line);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Twitch IRC WebSocket error:', err);
        if (this.onStatusChange) this.onStatusChange('error');
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (!this.isManualClosed) {
          if (this.onStatusChange) this.onStatusChange('disconnected');
          // Auto reconnect after 5s
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, 5000);
        }
      };
    } catch (e) {
      console.warn('Could not establish Twitch WebSocket:', e);
      if (this.onStatusChange) this.onStatusChange('error');
    }
  }

  changeChannel(newChannel) {
    const clean = newChannel.toLowerCase().replace('#', '').trim();
    if (!clean) return;
    this.channel = clean;
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(`PART #${this.channel}`);
      this.ws.send(`JOIN #${clean}`);
      if (this.onStatusChange) this.onStatusChange('connected', clean);
    } else {
      this.connect();
    }
  }

  parseIrcLine(line) {
    if (!line.includes('PRIVMSG')) return;

    try {
      let tags = {};
      let rest = line;

      if (line.startsWith('@')) {
        const spaceIndex = line.indexOf(' ');
        const tagStr = line.slice(1, spaceIndex);
        rest = line.slice(spaceIndex + 1);

        tagStr.split(';').forEach(pair => {
          const [k, v] = pair.split('=');
          tags[k] = v;
        });
      }

      // Format: :username!username@username.tmi.twitch.tv PRIVMSG #channel :message
      const privmsgMatch = rest.match(/^:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :?(.*)$/);
      if (!privmsgMatch) return;

      const username = tags['display-name'] || privmsgMatch[1];
      const text = privmsgMatch[2] || '';
      const color = tags['color'] || '#9146FF';
      const badgesStr = tags['badges'] || '';
      
      const isMod = badgesStr.includes('moderator') || tags['mod'] === '1';
      const isSub = badgesStr.includes('subscriber');
      const isVip = badgesStr.includes('vip');
      const isBroadcaster = badgesStr.includes('broadcaster');

      const messageObj = {
        id: tags['id'] || `irc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user: username,
        color: color,
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        badges: {
          broadcaster: isBroadcaster,
          mod: isMod,
          vip: isVip,
          subscriber: isSub
        },
        source: 'live_twitch'
      };

      if (this.onMessage) {
        this.onMessage(messageObj);
      }
    } catch (e) {
      // non-fatal parse error
    }
  }

  disconnect() {
    this.isManualClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
    this.isConnected = false;
    if (this.onStatusChange) this.onStatusChange('disconnected');
  }
}
