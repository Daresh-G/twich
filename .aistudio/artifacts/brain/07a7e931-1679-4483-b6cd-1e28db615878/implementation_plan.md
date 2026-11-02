# Twitch Pulse AI — Real-Time Moderation, Sentiment Telemetry & Audience Engagement

Twitch Pulse AI is an esports-grade, real-time Twitch stream intelligence and automated moderation command center. Built for the OpenAI x Twitch Hackathon, it combines real-time OpenAI moderation with live sentiment velocity tracking, raid defense, and auto-generated audience participation polls derived directly from chat momentum.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following core product decisions were confirmed during Phase 1 clarification:
> - **Twitch Stream Connectivity**: Real-time anonymous Twitch IRC WebSocket (`wss://irc-ws.chat.twitch.tv:443`) capable of joining any public Twitch channel (e.g., `shroud`, `tarik`, `kaicenat`, or custom channels) without requiring streamer OAuth, paired with a rich multi-scenario test simulator (Hype Train, Toxic Raid, Rapid Poll Trigger, Chill Stream).
> - **Hackathon Audience Participation Feature**: Auto-triggered audience polls, chat vote parsing (`!vote`, `#1`, `#2`), and a real-time Hype Meter linked to chat sentiment velocity, perfectly addressing Track 2 ("Audience Participation").
> - **OpenAI Moderation Engine**: Hybrid backend pipeline featuring an OpenAI Moderation & GPT-4o-mini classification endpoint with an instant high-throughput heuristic fallback analyzer, ensuring uninterrupted operation, instant zero-latency feedback, and seamless testing with or without an active API key.
> - **Codebase Style**: Clean, modular React architecture avoiding rigid TypeScript friction, ensuring agile modifications and rapid iteration.

---

### 1. Overview & Core Concept

- **What It Does**: Connects to any live Twitch chat stream or scenario simulation, parses messages at high throughput, and performs parallel sentiment scoring and policy classification. Flagged messages are instantly triaged into actionable moderation queues (Auto-Timeout, Purge, Flag, Allow) with configurable safety thresholds. Simultaneously, chat sentiment velocity feeds an interactive Hype Meter and dynamic audience engagement tools (live polls, trivia, and reaction surges).
- **Target Audience / Persona**: Live Twitch streamers, channel moderators, esports broadcast production teams, and tournament administrators looking to eliminate hate speech, spam waves, and harassment while elevating audience community interaction.
- **Key Value**: Replaces clumsy manual moderation and basic keyword blocklists with contextual AI comprehension, protecting streamers from hate raids while turning chat energy into engaging on-stream participation moments.

---

### 2. User Experience & Visual Design

- **Visual Identity & Theme**:
  - *Aesthetic*: Dark mode, broadcast-ready esports control station inspired by Twitch's brand identity and modern telemetry dashboards. Deep slate and obsidian backgrounds (`#090d16`, `#0e1422`), clean hairline boundaries (`rgba(255,255,255,0.08)`), and high-contrast semantic accents: Twitch Purple (`#9146FF`), Emerald (`#10b981`), Amber (`#f59e0b`), and Coral Crimson (`#ef4444`).
  - *Typography*: `Plus Jakarta Sans` for sleek UI hierarchy, paired with `JetBrains Mono` and `tabular-nums` for timestamps, chat counters, sentiment percentages, and latency metrics.
  - *Layout Density*: Responsive 3-column command center on 1440px+ screens:
    1. **Left Column (Live Chat Stream & Feed Controls)**: Real-time scrolling message feed with color-coded sentiment indicators, badge icons, instant mod action buttons (Timeout, Delete, Warn), and live channel switcher.
    2. **Center Column (Telemetry & Moderation Hub)**:
       - Top KPI cards: Active Viewers/Chatters, Sentiment Index (+100 to -100), Auto-Action Rate, Flagged Message Ratio.
       - Live Sentiment Velocity Graph: Time-series wave visualizing positive/neutral/negative chat momentum over the last 60 seconds.
       - Moderation Triage Queue: Real-time table of flagged messages categorized by policy (Harassment, Hate Speech, Spam, Sexual, Self-Harm) with OpenAI confidence scores and one-click reviewer actions.
    3. **Right Column (Audience Participation & Hype Console)**:
       - Dynamic Hype Meter gauge responding to positive chatter bursts.
       - Interactive Live Poll Widget: Displays active polls (auto-triggered by AI or streamer created), parsing real-time chat votes with live bar distribution.
       - Raid Defense & Automation Settings: Adjustable OpenAI sensitivity thresholds and quick-action raid shield toggle.
  - *OBS / HUD Dock Mode*: A streamlined, high-contrast overlay mode tailored for streamers using OBS dock panels or a secondary vertical monitor.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Public Twitch IRC WebSocket vs. OAuth Gateway**
  - *Chosen Approach*: Direct anonymous WebSocket connection to `irc-ws.chat.twitch.tv:443` using Twitch's standard anonymous `justinfan<random>` login.
  - *Why*: Allows instant plug-and-play connection to any channel on Twitch with zero setup friction for judges and streamers, while preserving the option to test with realistic preset simulations.
  - *Alternatives Considered*: Requiring Twitch OAuth app registration, which creates authentication hurdles during hackathon judging and live demonstrations.

- **Decision 2: Dual Moderation Architecture (OpenAI API + Local High-Throughput Heuristics)**
  - *Chosen Approach*: Express server proxy calling OpenAI Moderation & Chat APIs when `OPENAI_API_KEY` is present, seamlessly backed by an instant client/server NLP classifier that detects sentiment, toxicity, spam patterns, and sentiment velocity in real time.
  - *Why*: Guarantees the dashboard never lags or breaks if API rate limits are hit or if the reviewer runs the app without an OpenAI key, while delivering full GPT-4o-mini powered contextual audits when enabled.

- **Decision 3: Auto-Triggered Chat Polls based on AI Topic Extraction**
  - *Chosen Approach*: When chat spikes in debate (e.g. repeated gameplay choices, "W or L", "Clutch or Choke"), the system suggests or auto-starts an audience vote, listening for viewer responses (`!vote 1`, `!vote 2`, `#yes`, `#no`).
  - *Why*: Directly aligns with the Hackathon's "Audience Participation" track shown in the hackathon brief, transforming moderation from a purely defensive chore into an active entertainment driver.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Twitch Pulse AI                                 │
├───────────────────────────────┬─────────────────────────────────────────────┤
│      Twitch Live Ingest       │           OpenAI Moderation Engine          │
│  - Twitch IRC WebSocket       │  - Server Proxy (/api/moderate, /sentiment) │
│  - Anonymous justinfan auth   │  - OpenAI Moderation API + GPT-4o-mini      │
│  - Scenario Simulator Engine  │  - Instant Fallback Heuristic Classifier    │
└───────────────┬───────────────┴──────────────────────┬──────────────────────┘
                │                                      │
                ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       State Orchestrator & Telemetry                        │
│  - Live Message Buffer (last 200 msgs)                                      │
│  - Sentiment Velocity & Time-Series Aggregator                              │
│  - Auto-Action Rules Engine (Timeout, Delete, Flag, Shield)                 │
│  - Audience Vote Collector (!vote, #choice, emote counters)                 │
└───────────────┬──────────────────────────────────────┬──────────────────────┘
                │                                      │
                ▼                                      ▼
┌───────────────────────────────┬─────────────────────────────────────────────┤
│         Streamer UI           │          Audience Participation             │
│  - Live Moderated Chat Feed   │  - Real-Time Hype Meter                     │
│  - Sentiment Trend Wave       │  - Live Chat Polls & Auto-Triggered Topics  │
│  - Flagged Review Queue       │  - Chat Reaction Surges & Emote Wall        │
│  - OBS Dock / Compact Mode    │  - Raid Shield & Safety Controls            │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

#### Core Data Entities
- **ChatMessage**: `{ id, user, badges, text, timestamp, sentiment: { score, label }, flag: { isFlagged, category, confidence, reason }, actionTaken: 'none' | 'deleted' | 'timed_out' | 'flagged' }`
- **SentimentPoint**: `{ timestamp, positive, neutral, negative, averageScore, messageCount }`
- **ActivePoll**: `{ id, question, options: [{ id, label, votes, percentage }], totalVotes, status: 'active' | 'ended', autoTriggered: boolean }`
- **ModerationRules**: `{ autoDeleteToxicityThreshold, autoTimeoutHateThreshold, spamCapLimit, raidShieldActive }`
