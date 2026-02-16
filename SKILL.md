---
name: amber-voice-assistant
description: "Phone-capable AI voice agent for OpenClaw: production-ready Twilio + OpenAI Realtime SIP bridge (runtime/), built-in call log dashboard (dashboard/), setup guidance, env templates, validation scripts, guardrail patterns, and troubleshooting runbooks."
homepage: https://github.com/batthis/amber-openclaw-voice-agent
metadata: {"openclaw":{"emoji":"☎️","requires":{"env":["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_CALLER_ID","OPENAI_API_KEY","OPENAI_PROJECT_ID","OPENAI_WEBHOOK_SECRET","PUBLIC_BASE_URL"],"anyBins":["node"]},"primaryEnv":"OPENAI_API_KEY"}}
---

# Amber — Phone-Capable Voice Agent

## Overview

Amber is a **voice sub-agent for OpenClaw** — it gives your OpenClaw deployment phone capabilities via a production-ready Twilio + OpenAI Realtime SIP bridge (`runtime/`) and a call log dashboard (`dashboard/`). Amber is not a standalone voice agent; it operates as an extension of your OpenClaw instance, delegating complex decisions (calendar lookups, contact resolution, approval workflows) back to OpenClaw mid-call via the `ask_openclaw` tool.

Amber handles inbound call screening, outbound calls, appointment booking, live OpenClaw knowledge lookups, and full call history visualization.

### What's included

- **Runtime bridge** (`runtime/`) — a complete Node.js server that connects Twilio phone calls to OpenAI Realtime with OpenClaw brain-in-the-loop
- **Call log dashboard** (`dashboard/`) — a real-time web UI showing call history, transcripts, captured messages, call summaries, and follow-up tracking with search and filtering
- **Setup & validation scripts** — preflight checks, env templates, quickstart runner
- **Architecture docs & troubleshooting** — call flow diagrams, common failure runbooks
- **Safety guardrails** — approval patterns for outbound calls, payment escalation, consent boundaries

## Why Amber

- **Launch a voice agent in minutes** — `npm install`, configure `.env`, `npm start`
- Full inbound screening: greeting, message-taking, appointment booking with calendar integration
- Outbound calls with structured call plans (reservations, inquiries, follow-ups)
- **`ask_openclaw` tool** — voice agent consults your OpenClaw gateway mid-call for calendar, contacts, preferences
- **Call log dashboard** — browse call history, read transcripts, track follow-ups, search by caller/number/content
- **Automatic language detection** — Amber detects the caller's language and switches naturally mid-call (supports Arabic, Spanish, French, and more via OpenAI Realtime)
- VAD tuning + verbal fillers to keep conversations natural (no dead air during lookups)
- Fully configurable: assistant name, operator info, org name, calendar, screening style — all via env vars
- Operator safety guardrails for approvals/escalation/payment handling

## How tool calling works (`ask_openclaw`)

Amber isn't just a voice bot reading a script — she can consult your OpenClaw instance mid-call to answer questions she doesn't know from her instructions alone.

### The flow

```
Caller asks a question
        ↓
Amber (OpenAI Realtime) decides she needs more info
        ↓
Amber says "One moment, let me check on that for you"
        ↓
Amber calls the `ask_openclaw` tool with a short question
        ↓
Bridge sends the question to your OpenClaw gateway
  (via POST /v1/chat/completions on localhost)
        ↓
OpenClaw checks calendar, contacts, memory, etc.
        ↓
Response comes back → Amber speaks the answer to the caller
```

### Example

> **Caller:** "Is Abe free on Thursday?"
> **Amber:** "Let me check on that for you..."
> *(Amber calls ask_openclaw: "Is Abe available Thursday evening?")*
> *(OpenClaw checks calendar, responds: "Thursday evening is clear.")*
> **Amber:** "Yes, Thursday evening works! Shall I set something up?"

### Configuration

The bridge connects to your OpenClaw gateway at `OPENCLAW_GATEWAY_URL` (default: `http://127.0.0.1:18789`) using `OPENCLAW_GATEWAY_TOKEN` for auth. It sends questions as chat completions with:

- A system prompt providing call context (who's calling, the objective, recent transcript)
- The voice agent's question as the user message

Your OpenClaw instance handles the rest — calendar lookups, contact resolution, memory search, or whatever tools you have configured.

### When does Amber use it?

- Caller asks something not in the system prompt (schedule, availability, preferences)
- Caller requests information about the operator
- Outbound calls where Amber needs to verify details mid-conversation
- Any question where the answer requires your personal data/context

### Verbal fillers

To avoid dead air while waiting for OpenClaw to respond, Amber automatically says natural filler phrases like "One moment, let me check on that" before making the tool call. VAD (Voice Activity Detection) is tuned to avoid cutting off the caller during these pauses.

## Webhook architecture

The bridge exposes two webhook endpoints — make sure you point each service to the right one:

| Endpoint | Source | Purpose | Signature verification |
|----------|--------|---------|----------------------|
| `/twilio/inbound` | Twilio | Incoming phone calls → generates TwiML to bridge to OpenAI SIP | None (Twilio-facing) |
| `/twilio/status` | Twilio | Call status callbacks (ringing, answered, completed) | None |
| `/openai/webhook` | OpenAI Realtime | Incoming SIP call events from OpenAI | ✅ `openai-signature` HMAC-SHA256 |
| `/call/outbound` | Your app/OpenClaw | Trigger an outbound call | Internal (localhost only) |

**Common setup mistake:** If you point Twilio's voice webhook at `/openai/webhook` instead of `/twilio/inbound`, calls will fail because Twilio doesn't send the `openai-signature` header that endpoint expects.

## Personalization requirements

Before deploying, users must personalize:
- assistant name/voice and greeting text,
- own Twilio number and account credentials,
- own OpenAI project + webhook secret,
- own OpenClaw gateway/session endpoint,
- own call safety policy (approval, escalation, payment handling).

Do not reuse example values from another operator.

## 5-minute quickstart

### Option A: Runtime bridge (recommended)

1. `cd runtime && npm install`
2. Copy `../references/env.example` to `runtime/.env` and fill in your values.
3. `npm run build && npm start`
4. Point your Twilio voice webhook to `https://<your-domain>/twilio/inbound`
5. Call your Twilio number — your voice assistant answers!

### Option B: Validation-only (existing setup)

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

## Call log dashboard

The built-in dashboard provides a real-time web UI for browsing your call history.

### Setup

1. `cd dashboard`
2. Optionally create `contacts.json` from `contacts.example.json` for caller name resolution
3. Process logs: `TWILIO_CALLER_ID=+1... node process_logs.js`
4. Serve: `node scripts/serve.js` → open `http://localhost:8080`

### Features

- Timeline view of all inbound/outbound calls
- Full transcript display per call
- Captured message extraction (name, callback number, message)
- AI-generated call summaries (intent, outcome, next steps)
- Search by name, number, transcript content, or call SID
- Follow-up flagging with local persistence
- Auto-refresh when new data is available
- Filter by direction, transcript availability, messages captured

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TWILIO_CALLER_ID` | *(required)* | Your Twilio number — used to detect call direction |
| `ASSISTANT_NAME` | `Amber` | Name shown for the voice agent in call logs |
| `OPERATOR_NAME` | `the operator` | Name used in call summaries (e.g. "message passed to...") |
| `CONTACTS_FILE` | `./contacts.json` | Optional phone→name mapping file |
| `LOGS_DIR` | `../runtime/logs` | Directory containing call log files |
| `OUTPUT_DIR` | `./data` | Where processed JSON is written |

See `dashboard/README.md` for full documentation.

## Troubleshooting (common)

- **"Missing env vars"** → re-check `.env` values and re-run `scripts/validate_voice_env.sh`.
- **"Call connects but assistant is silent"** → verify TTS model setting and provider auth.
- **"ask_openclaw timeout"** → verify gateway URL/token and increase timeout conservatively.
- **"Webhook unreachable"** → verify tunnel/domain and Twilio webhook target.

## Guardrails for public release

- Never publish secrets, tokens, phone numbers, webhook URLs with credentials, or personal data.
- Include explicit safety rules for outbound calls, payments, and escalation.
- Mark V1 as beta if conversational quality/latency tuning is ongoing.

## Support & Contributing

Found a bug? Have a feature request? Want to contribute?

- **Issues & feature requests:** [GitHub Issues](https://github.com/batthis/amber-openclaw-voice-agent/issues)
- **Source code:** [github.com/batthis/amber-openclaw-voice-agent](https://github.com/batthis/amber-openclaw-voice-agent)
- **Pull requests welcome** — fork the repo, make your changes, and submit a PR.

## Resources

- **Runtime bridge:** `runtime/` (full source + README)
- **Call log dashboard:** `dashboard/` (web UI + log processor)
- Architecture and behavior notes: `references/architecture.md`
- Release gate: `references/release-checklist.md`
- Env template: `references/env.example`
- Quick setup runner: `scripts/setup_quickstart.sh`
- Env/config validator: `scripts/validate_voice_env.sh`
