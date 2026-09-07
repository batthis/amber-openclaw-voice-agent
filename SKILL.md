---
name: amber-voice-assistant
title: "Amber — Give Your Agent Real Phone Capabilities"
description: "Give your agent a phone number. Amber answers calls, places confirmed outbound calls, completes phone tasks, logs transcripts, and exposes MCP tools."
homepage: https://github.com/batthis/amber-openclaw-voice-agent
metadata: {"openclaw":{"emoji":"☎️","requires":{"env":[],"optionalEnv":["AMBER_ENABLE_OUTBOUND_CALLS","AMBER_REALTIME_MODEL","AMBER_REALTIME_VAD_THRESHOLD","AMBER_REALTIME_VAD_PREFIX_PADDING_MS","AMBER_REALTIME_VAD_SILENCE_DURATION_MS","AMBER_CRM_ENABLED","AMBER_CRM_TRANSCRIPT_ENRICHMENT","OPENCLAW_GATEWAY_URL","TWILIO_WEBHOOK_STRICT","VOICE_PROVIDER","VOICE_WEBHOOK_SECRET","ASSISTANT_NAME","OPERATOR_NAME","AMBER_CRM_DB_PATH","AGENT_MD_PATH","DEFAULT_CALENDAR","AMBER_CONTACTS_EXTENDED"],"anyBins":["node","ical-query"]},"permissions":{"network":true,"env":true,"webhooks":true,"localFiles":["runtime/logs/","runtime/contacts-cache.json","~/.config/amber/crm.sqlite"],"localBinaries":["node","ical-query"],"mcpTools":["prepare_call","start_call","call_history","crm","contacts_lookup","calendar","screening_control","bridge_health"],"externalServices":["Twilio or compatible voice provider","OpenAI Realtime/API","optional OpenClaw Gateway"]},"install":[{"id":"runtime","kind":"node","cwd":"runtime","label":"Install Amber runtime (cd runtime && npm ci && npm run build)"},{"id":"crm-skill","kind":"node","cwd":"amber-skills/crm","label":"Install optional CRM skill dependencies (cd amber-skills/crm && npm ci)"}]}}
---

# Amber — Give Your Agent Real Phone Capabilities

## Overview

Amber gives any OpenClaw deployment **a real phone number and the tools to complete calls**. It ships with a **production-ready Twilio + OpenAI Realtime bridge** (`runtime/`) for confirmed phone workflows: answer callers, screen calls, place approved outbound calls, look up contacts, schedule appointments, take messages, log transcripts, and hand call-critical decisions back to OpenClaw through MCP tools.

Use it when you want an agent to do the plain-English phone job: call this business, ask this question, book the slot, leave the message, screen this caller, or show me what happened. Amber is built for operators who want the phone capability layer under their own Twilio or compatible voice account, with local logs, a local dashboard, and confirmation gates before outbound calls or calendar writes.

Amber is a sensitive communications system. It can process call audio/transcripts through configured voice and AI providers, store local call logs, maintain a local CRM, read/write the operator calendar, expose local MCP tools, and optionally use an Apple Contacts export for name-to-number resolution. Operators should configure caller notice/consent, retention/deletion practices, and least-privilege provider credentials before production use.

Privacy defaults: local CRM lookup/logging is disabled unless `AMBER_CRM_ENABLED=true`, and post-call transcript enrichment is disabled unless `AMBER_CRM_TRANSCRIPT_ENRICHMENT=true`. Enable those only after setting caller notice/consent and retention/deletion practices.

**✨ New in v5.5.50:** Sharper ClawHub positioning: Amber is now described first as the phone-number-and-call-completion layer for agents, with inbound answering, confirmed outbound calling, scheduling, transcripts, and MCP tools visible before the deeper architecture.

**✨ v5.4.0:** Amber ships as an **MCP plugin** with 9 tools — prepare confirmed calls by name, check call history, query CRM contacts, manage calendar, and control call screening. It works with Claude Desktop/Cowork and other MCP-capable clients or agent harnesses once configured. Includes Apple Contacts integration and a code-enforced call confirmation safeguard to prevent wrong-number dials.

**✨ Also:** Interactive setup wizard (`npm run setup`) validates credentials in real-time and generates a working `.env` file — no manual configuration needed. Once setup is complete, Amber is prompt-based: ask your OpenClaw agent to prepare confirmed calls, answer/screen callers, schedule confirmed appointments, or handle phone workflows in natural language.

## See it in action

![Setup Wizard Demo](demo/demo.gif)

**[▶️ Watch the interactive demo on asciinema.org](https://asciinema.org/a/l1nOHktunybwAheQ)** (copyable text, adjustable speed)

*The interactive wizard validates credentials, detects ngrok, and generates a complete `.env` file in minutes.*

### What's included

- **Phone number + runtime bridge** (`runtime/`) — a complete Node.js server that connects a Twilio or compatible phone number to OpenAI Realtime with OpenClaw brain-in-the-loop
- **Amber Skills** (`amber-skills/`) — modular mid-call capabilities (CRM, calendar, log & forward message) with a spec for building your own
- **Built-in CRM** — local SQLite contact database; Amber can greet callers by name and use operator-approved context naturally on calls, with operator review/correction responsibility
- **Call log dashboard** (`dashboard/`) — browse call history, transcripts, captured messages, estimated costs, and one-touch localhost test calls with regular/mini Realtime model selection
- **Setup & validation scripts** — preflight checks, env templates, quickstart runner
- **Architecture docs & troubleshooting** — call flow diagrams, common failure runbooks
- **Safety guardrails** — outbound calls require code-enforced confirmation; payment escalation, consent boundaries, and explicit confirmation for calendar writes are documented

## 🔌 Amber Skills — Extensible by Design

Amber ships with a growing library of **Amber Skills** — modular capabilities that plug directly into live voice conversations. Each skill exposes a structured function that Amber can call mid-call, letting you compose powerful voice workflows without touching the bridge code.

### 👤 CRM — Contact Memory *(v5.3.0)*

Amber can maintain operator-reviewed caller memory across calls, limited to relevant follow-up context under the operator's notice, consent, and retention policy.

- **Opt-in runtime management** — set `AMBER_CRM_ENABLED=true` to enable automatic known-caller lookup and interaction logging
- **Personalized greeting** — known callers can be greeted by name; optional notes are used only when relevant to the call objective
- **Optional enrichment** — set `AMBER_CRM_TRANSCRIPT_ENRICHMENT=true` to allow post-call extraction to propose caller details and notes for the local CRM
- **Operator review expected** — review, correct, or delete CRM records periodically so bad transcript extraction, misleading caller input, or overly sensitive details do not persist indefinitely
- **Symmetric** — works identically for inbound and outbound calls
- **Local SQLite CRM** — contact memory is stored at `~/.config/amber/crm.sqlite`; CRM records are not cloud-hosted. Live call audio/transcripts still pass through Twilio/OpenAI as part of the phone bridge. Tell callers when calls are handled by an AI assistant and may be logged/used for follow-up, according to your local consent requirements.
- **Native dependency** — requires `better-sqlite3` (native build). macOS: `sudo xcodebuild -license accept` before `npm install`. Linux: `build-essential` + `python3`.

### 📅 Calendar

Query the operator's calendar for availability or schedule a new event — all during a live call.

- **Availability lookups** — free/busy slots for today, tomorrow, this week, or any specific date
- **Event creation** — create calendar events from a phone conversation only after the required details are collected and the caller explicitly confirms the slot
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

**Contacts privacy:** Apple Contacts sync is opt-in. By default it exports only names and phone numbers needed for call-by-name. Set `AMBER_CONTACTS_EXTENDED=true` only if you explicitly want extra local-only fields such as email, organization, relationships, addresses, and notes in `runtime/contacts-cache.json`.

> **Note:** Each skill's `handler.js` is reviewed against its declared permissions. When building or installing third-party skills, review the handler source as you would any Node.js module.

### Call log dashboard

```bash
cd dashboard && node scripts/serve.js   # → http://localhost:8787
```

- **⬇ Sync button** (green) — immediately pulls new calls from `runtime/logs/` and refreshes the dashboard. Use this right after a call ends rather than waiting for the background watcher.
- **↻ Refresh button** (blue) — reloads existing data from disk without re-processing logs.
- **One-touch test calls** — when opened through `node scripts/serve.js`, the dashboard can call a test number through the local Amber bridge and choose `gpt-realtime` or `gpt-realtime-mini` per call.
- **Cost visibility** — estimates telephony and Realtime token cost from call duration and saved usage metadata; rates are editable in the dashboard.
- Background watcher (`node scripts/watch.js`) auto-syncs every 30 seconds when running.

## Why Amber

- **Ship a voice assistant in minutes** — `npm install`, configure `.env`, `npm start`
- **Give an agent a real phone number** — callers can reach it, and it can place confirmed outbound calls for concrete phone tasks
- Full inbound screening: greeting, message-taking, appointment booking with calendar integration
- Outbound calls with structured call plans (reservations, inquiries, follow-ups), with confirmation gates and a runtime disable switch
- **OpenClaw gateway lookup (least-privilege)** — voice agent consults your OpenClaw gateway only for call-critical needs (availability checks, confirmed scheduling, required factual lookups), not for unrelated tasks
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
   - Ask whether to enable opt-in local CRM caller memory
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

1. From the Amber skill folder: `cd runtime && npm ci`
2. `cd ../amber-skills/crm && npm ci` if you plan to enable CRM caller memory.
3. `cd ../..` and copy `references/env.example` to `runtime/.env`, then fill in your values.
4. Set `AMBER_CRM_ENABLED=true` only if you want local caller memory/known-caller greetings.
5. `cd runtime && npm run build && npm start`
6. Point your Twilio voice webhook to `https://<your-domain>/twilio/inbound`
7. Call your Twilio number — your voice assistant answers!

### Option C: Validation-only (existing setup)

1. Copy `references/env.example` to your own `.env` and replace placeholders.
2. Export required variables (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_CALLER_ID`, `OPENAI_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_WEBHOOK_SECRET`, `PUBLIC_BASE_URL`).
3. Run quick setup:
   `scripts/setup_quickstart.sh`
4. If preflight passes, run one inbound and one outbound smoke test.
5. Only then move to production usage.

## Credential scope (recommended hardening)

Use least-privilege credentials for every provider:

- **Twilio:** use a dedicated subaccount for Amber and rotate auth tokens regularly.
- **OpenAI:** use a dedicated project API key for this runtime only; avoid reusing keys from unrelated apps.
- **OpenClaw Gateway token:** only set `OPENCLAW_GATEWAY_TOKEN` if you need brain-in-the-loop lookups; keep token scope minimal.
- **Dependency integrity:** runtime dependencies are pinned by `runtime/package-lock.json`; review dependency changes before publishing updates.
- **Secrets in logs:** never print full credentials in scripts, setup output, or call transcripts.
- **Setup wizard validation scope:** credential checks call only official Twilio/OpenAI API endpoints over HTTPS for auth verification; no arbitrary exfiltration endpoints are used.

These controls reduce blast radius if a host or config file is exposed.

## Safe defaults

- Outbound calling is enabled by default for the full phone-agent experience. Set `AMBER_ENABLE_OUTBOUND_CALLS=false` to disable the outbound call endpoint.
- Require explicit approval before outbound calls. **Note on confirmation enforcement:** For MCP-initiated outbound calls (`make_call`), confirmation is enforced at the MCP server layer in code (the tool returns a preview and requires `confirmed=true` on a second call before dialing) — this is not LLM-only instruction. The LLM instruction layer provides an additional reminder, but the code gate is the primary enforcement mechanism.
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
- **"CRM lookup fails after a Node upgrade"** → run `cd amber-skills/crm && npm rebuild better-sqlite3`, then restart the Amber runtime.
- **"Webhook unreachable"** → verify tunnel/domain and Twilio webhook target.

## Guardrails for public release

- Never publish secrets, tokens, phone numbers, webhook URLs with credentials, or personal data.
- Include explicit safety rules for outbound calls, payments, and escalation.
- Mark V1 as beta if conversational quality/latency tuning is ongoing.

## Install safety notes

- Amber does **not** execute arbitrary install-time scripts from this repository.
- Runtime install uses standard Node dependency installation in `runtime/`, with dependencies pinned in `runtime/package-lock.json`.
- CRM uses `better-sqlite3` (native module), which compiles locally on your machine.
- Review `runtime/package.json` dependencies before deployment in regulated environments.

## Resources

- **Runtime bridge:** `runtime/` (full source + README)
- Architecture and behavior notes: `references/architecture.md`
- Release gate: `references/release-checklist.md`
- Env template: `references/env.example`
- Quick setup runner: `scripts/setup_quickstart.sh`
- Env/config validator: `scripts/validate_voice_env.sh`
