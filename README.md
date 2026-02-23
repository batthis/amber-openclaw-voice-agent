# ☎️ Amber — Phone-Capable Voice Agent

**A voice sub-agent for [OpenClaw](https://openclaw.ai)** — gives your OpenClaw deployment phone capabilities via a provider-swappable telephony bridge + OpenAI Realtime. Twilio is the default and recommended provider.

[![ClawHub](https://img.shields.io/badge/ClawHub-amber--voice--assistant-blue)](https://clawhub.ai/skills/amber-voice-assistant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What is Amber?

Amber is not a standalone voice agent — it operates as an extension of your OpenClaw instance, delegating complex decisions (calendar lookups, contact resolution, approval workflows) back to OpenClaw mid-call via the `ask_openclaw` tool.

### Features

- 🔉 **Inbound call screening** — greeting, message-taking, appointment booking
- 📞 **Outbound calls** — reservations, inquiries, follow-ups with structured call plans
- 🧠 **Brain-in-the-loop** — consults your OpenClaw gateway mid-call for calendar, contacts, preferences
- 📊 **Call log dashboard** — browse history, transcripts, captured messages, follow-up tracking
- ⚡ **Launch in minutes** — `npm install`, configure `.env`, `npm start`
- 🔒 **Safety guardrails** — operator approval for outbound calls, payment escalation, consent boundaries
- 🎛️ **Fully configurable** — assistant name, operator info, org name, voice, screening style
- 📝 **AGENT.md** — customize all prompts, greetings, booking flow, and personality in a single editable markdown file (no code changes needed)

## Quick Start

```bash
cd runtime && npm install
cp ../references/env.example .env  # fill in your values
npm run build && npm start
```

Point your Twilio voice webhook to `https://<your-domain>/twilio/inbound` — done!

> **Switching providers?** Set `VOICE_PROVIDER=telnyx` (or another supported provider) in your `.env` — no code changes needed. See [SKILL.md](SKILL.md) for details.

## 🔌 Amber Skills — Extensible by Design

Amber ships with a growing library of **Amber Skills** — modular capabilities that plug directly into live voice conversations. Each skill exposes a structured function that Amber can call mid-call, letting you compose powerful voice workflows without touching the bridge code.

Two skills are included out of the box:

### 📅 Calendar

Query the operator's calendar for availability or schedule a new event — all during a live call.

- **Availability lookups** — free/busy slots for today, tomorrow, this week, or any specific date
- **Event creation** — book appointments directly into the operator's calendar from a phone conversation
- **Privacy by default** — callers are only told whether the operator is free or busy; event titles, names, and locations are never disclosed
- Powered by `ical-query` — local-only, zero network latency

### 📬 Log & Forward Message

Let callers leave a message that is automatically saved and forwarded to the operator.

- Captures the caller's message, name, and optional callback number
- **Always saves to the call log first** (audit trail), then delivers via the operator's configured messaging channel
- Confirmation-gated — Amber confirms with the caller before sending
- Delivery destination is operator-configured — callers cannot redirect messages

### Build Your Own Skills

Amber's skill system is designed to grow. Each skill is a self-contained directory with a `SKILL.md` (metadata + function schema) and a `handler.js`. You can:

- **Customize the included skills** to fit your own setup
- **Build new skills** for your use case — CRM lookups, inventory checks, custom notifications, anything callable mid-call
- **Share skills** with the OpenClaw community via [ClawHub](https://clawhub.com)

See [`amber-skills/`](amber-skills/) for examples and the full specification to get started.

---

## What's Included

| Path | Description |
|------|-------------|
| `AGENT.md` | **Editable prompts & personality** — customize without touching code |
| `amber-skills/` | Built-in Amber Skills (calendar, log & forward message) + skill spec |
| `runtime/` | Production-ready voice bridge (Twilio default) + OpenAI Realtime SIP |
| `dashboard/` | Call log web UI with search, filtering, transcripts |
| `scripts/` | Setup quickstart and env validation |
| `references/` | Architecture docs, env template, release checklist |
| `UPGRADING.md` | Migration guide for major version upgrades |

## Call Log Dashboard

Browse call history, transcripts, and captured messages in a local web UI:

```bash
cd dashboard
node scripts/serve.js       # serves on http://localhost:8787
```

Then open [http://localhost:8787](http://localhost:8787) in your browser.

| Button | Action |
|--------|--------|
| **⬇ (green)** | **Sync** — pull new calls from bridge logs and refresh data |
| **↻ (blue)** | Reload existing data from disk (no re-processing) |

> **Tip:** Use the **⬇ Sync** button right after a call ends to immediately pull it into the dashboard without waiting for the background watcher.

The dashboard auto-updates every 30 seconds when the watcher is running (`node scripts/watch.js`).

## Customizing Amber (AGENT.md)

All voice prompts, conversational rules, booking flow, and greetings live in [`AGENT.md`](AGENT.md). Edit this file to change how Amber behaves — no TypeScript required.

Template variables like `{{OPERATOR_NAME}}` and `{{ASSISTANT_NAME}}` are auto-replaced from your `.env` at runtime. See [UPGRADING.md](UPGRADING.md) for full details.

## Documentation

Full documentation is in [SKILL.md](SKILL.md) — including setup guides, environment variables, troubleshooting, and the call log dashboard.

## Support & Contributing

- **Issues & feature requests:** [GitHub Issues](https://github.com/batthis/amber-openclaw-voice-agent/issues)
- **Pull requests welcome** — fork, make changes, submit a PR

## License

[MIT](LICENSE) — Copyright (c) 2026 Abe Batthish
