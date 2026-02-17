# ☎️ Amber — Phone-Capable Voice Agent

**A voice sub-agent for [OpenClaw](https://openclaw.ai)** — gives your OpenClaw deployment phone capabilities via Twilio + OpenAI Realtime.

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

## What's Included

| Path | Description |
|------|-------------|
| `AGENT.md` | **Editable prompts & personality** — customize without touching code |
| `runtime/` | Production-ready Twilio + OpenAI Realtime SIP bridge |
| `dashboard/` | Call log web UI with search, filtering, transcripts |
| `scripts/` | Setup quickstart and env validation |
| `references/` | Architecture docs, env template, release checklist |
| `UPGRADING.md` | Migration guide for major version upgrades |

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
