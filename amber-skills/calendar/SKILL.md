---
name: calendar
version: 1.0.0
description: "Query and manage the operator's calendar — look up events, check availability, and create new entries"
metadata: {"amber": {"capabilities": ["read", "act"], "confirmation_required": false, "timeout_ms": 5000, "permissions": {"local_binaries": ["ical-query"], "telegram": false, "openclaw_action": false, "network": false}, "function_schema": {"name": "calendar_query", "description": "Look up calendar events, check availability, or create a new calendar entry. For lookups use action 'lookup'. For creating events use action 'create'. Use this tool for any calendar-related questions — do NOT use ask_openclaw for calendar queries.", "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["lookup", "create"], "description": "Whether to look up existing events or create a new one"}, "range": {"type": "string", "description": "For lookup: today, tomorrow, week, or a specific date range like 2026-02-22"}, "title": {"type": "string", "description": "For create: the event title"}, "start": {"type": "string", "description": "For create: start date-time like 2026-02-22T15:00"}, "end": {"type": "string", "description": "For create: end date-time like 2026-02-22T16:00"}, "calendar": {"type": "string", "description": "Optional: specific calendar name"}, "notes": {"type": "string", "description": "For create: event notes"}, "location": {"type": "string", "description": "For create: event location"}}, "required": ["action"]}}}}
---

# Calendar Skill

Query and manage the operator's calendar via the local `ical-query` CLI (Apple Calendar / EventKit).

## Capabilities

- **read**: Look up events for today, tomorrow, this week, or a specific date range
- **act**: Create new calendar entries with title, time, location, and notes

## Usage

During a call, when someone asks about availability or wants to schedule something:
1. Amber calls `calendar_query` with `action: "lookup"` to check availability
2. If scheduling is needed, Amber calls `calendar_query` with `action: "create"`

## Notes

- Uses `/usr/local/bin/ical-query` — no network access required
- Calendar name is optional — defaults to the operator's primary calendar
- No confirmation required — lookups are read-safe, and creation is confirmed
  verbally during the natural conversation flow
- This skill replaces the need to route calendar queries through ask_openclaw
