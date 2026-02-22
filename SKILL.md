---
name: amber-voice-assistant
title: "Amber — Phone-Capable Voice Agent"
description: "The most complete phone skill for OpenClaw. Production-ready, low-latency AI calls — inbound & outbound, multilingual, live dashboard, brain-in-the-loop."
homepage: https://github.com/batthis/amber-openclaw-voice-agent
metadata: {"openclaw":{"emoji":"☎️","requires":{"env":["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_CALLER_ID","OPENAI_API_KEY","OPENAI_PROJECT_ID","OPENAI_WEBHOOK_SECRET","PUBLIC_BASE_URL"],"optionalEnv":["OPENCLAW_GATEWAY_URL","OPENCLAW_GATEWAY_TOKEN","BRIDGE_API_TOKEN","TWILIO_WEBHOOK_STRICT","VOICE_PROVIDER","VOICE_WEBHOOK_SECRET"],"anyBins":["node","ical-query"]},"primaryEnv":"OPENAI_API_KEY"}}
---

# Amber — Phone-Capable Voice Agent

## Overview

Amber gives any OpenClaw deployment a phone-capable voice assistant. It ships with a **production-ready Twilio + OpenAI Realtime SIP bridge** (`runtime/`) that handles inbound call screening, outbound calls, appointment booking, and live OpenClaw knowledge lookups — all via natural voice conversation.

**✨ New:** Interactive setup wizard (`npm run setup`) validates credentials in real-time and generates a working `.env` file — no manual configuration needed!

## See it in action

![Setup Wizard Demo](demo/demo.gif)

**[▶️ Watch the interactive demo on asciinema.org](https://asciinema.org/a/l1nOHktunybwAheQ)** (copyable text, adjustable speed)

*The interactive wizard validates credentials, detects ngrok, and generates a complete `.env` file in minutes.*

### What's included

- **Runtime bridge** (`runtime/`) — a complete Node.js server that connects Twilio phone calls to OpenAI Realtime with OpenClaw brain-in-the-loop
- **Call log dashboard** (`dashboard/`) — browse call history, transcripts, and captured messages; includes **manual Sync button** to pull new calls on demand
- **Setup & validation scripts** — preflight checks, env templates, quickstart runner
- **Architecture docs & troubleshooting** — call flow diagrams, common failure runbooks
- **Safety guardrails** — approval patterns for outbound calls, payment escalation, consent boundaries

### Call log dashboard

```bash
cd dashboard && node scripts/serve.js   # → http://localhost:8787
```

- **⬇ Sync button** (green) — immediately pulls new calls from `runtime/logs/` and refreshes the dashboard. Use this right after a call ends rather than waiting for the background watcher.
- **↻ Refresh button** (blue) — reloads existing data from disk without re-processing logs.
- Background watcher (`node scripts/watch.js`) auto-syncs every 30 seconds when running.

## Why Amber

- **Ship a voice assistant in minutes** — `npm install`, configure `.env`, `npm start`
- Full inbound screening: greeting, message-taking, appointment booking with calendar integration
- Outbound calls with structured call plans (reservations, inquiries, follow-ups)
- **`ask_openclaw` tool** — voice agent consults your OpenClaw gateway mid-call for calendar, contacts, preferences
- VAD tuning + verbal fillers to keep conversations natural (no dead air during lookups)
- Fully configurable: assistant name, operator info, org name, calendar, screening style — all via env vars
- Operator safety guardrails for approvals/escalation/payment handling

## Personalization requirements

Before deploying, users must personalize:
- assistant name/voice and greeting text,
- own Twilio number and account credentials,
- own OpenAI project + webhook secret,
- own OpenClaw gateway/session endpoint,
- own call safety policy (approval, escalation, payment handling).

Do not reuse example values from another operator.

## 5-minute quickstart

### Option A: Interactive Setup Wizard (recommended) ✨

The easiest way to get started:

1. `cd runtime`
2. `npm run setup`
3. Follow the interactive prompts — the wizard will:
   - Validate your Twilio and OpenAI credentials in real-time
   - Auto-detect and configure ngrok if available
   - Generate a working `.env` file
   - Optionally install dependencies and build the project
4. Configure your Twilio webhook (wizard shows you the exact URL)
5. Start the server: `npm start`
6. Call your Twilio number — your voice assistant answers!

**Benefits:**
- Real-time credential validation (catch errors before you start)
- No manual `.env` editing
- Automatic ngrok detection and setup
- Step-by-step guidance with helpful links

### Option B: Manual setup

1. `cd runtime && npm install`
2. Copy `../references/env.example` to `runtime/.env` and fill in your values.
3. `npm run build && npm start`
4. Point your Twilio voice webhook to `https://<your-domain>/twilio/inbound`
5. Call your Twilio number — your voice assistant answers!

### Option C: Validation-only (existing setup)

1. Copy `references/env.example` to your own `.env` and replace placeholders.
2. Export required variables (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_CALLER_ID`, `OPENAI_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_WEBHOOK_SECRET`, `PUBLIC_BASE_URL`).
3. Run quick setup:
   `scripts/setup_quickstart.sh`
4. If preflight passes, run one inbound and one outbound smoke test.
5. Only then move to production usage.

## Safe defaults

- Require explicit approval before outbound calls.
- If payment/deposit is requested, stop and escalate to the human operator.
- Keep greeting short and clear.
- Use timeout + graceful fallback when `ask_openclaw` is slow/unavailable.

## Workflow

1. **Confirm scope for V1**
   - Include only stable behavior: call flow, bridge behavior, fallback behavior, and setup steps.
   - Exclude machine-specific secrets and private paths.

2. **Document architecture + limits**
   - Read `references/architecture.md`.
   - Keep claims realistic (latency varies; memory lookups are best-effort).

3. **Run release checklist**
   - Read `references/release-checklist.md`.
   - Validate config placeholders, safety guardrails, and failure handling.

4. **Smoke-check runtime assumptions**
   - Run `scripts/validate_voice_env.sh` on the target host.
   - Fix missing env/config before publishing.

5. **Publish**
   - Publish to ClawHub (example):  
     `clawhub publish <skill-folder> --slug amber-voice-assistant --name "Amber Voice Assistant" --version 1.0.0 --tags latest --changelog "Initial public release"`
   - Optional: run your local skill validator/packager before publishing.

6. **Ship updates**
   - Publish new semver versions (`1.0.1`, `1.1.0`, `2.0.0`) with changelogs.
   - Keep `latest` on the recommended version.

## Troubleshooting (common)

- **"Missing env vars"** → re-check `.env` values and re-run `scripts/validate_voice_env.sh`.
- **"Call connects but assistant is silent"** → verify TTS model setting and provider auth.
- **"ask_openclaw timeout"** → verify gateway URL/token and increase timeout conservatively.
- **"Webhook unreachable"** → verify tunnel/domain and Twilio webhook target.

## Guardrails for public release

- Never publish secrets, tokens, phone numbers, webhook URLs with credentials, or personal data.
- Include explicit safety rules for outbound calls, payments, and escalation.
- Mark V1 as beta if conversational quality/latency tuning is ongoing.

## Resources

- **Runtime bridge:** `runtime/` (full source + README)
- Architecture and behavior notes: `references/architecture.md`
- Release gate: `references/release-checklist.md`
- Env template: `references/env.example`
- Quick setup runner: `scripts/setup_quickstart.sh`
- Env/config validator: `scripts/validate_voice_env.sh`
