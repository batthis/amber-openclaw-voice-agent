---
name: calendar
version: 1.1.0
description: "Query and manage the operator's calendar — check availability and create new entries"
metadata: {"amber": {"capabilities": ["read", "act"], "confirmation_required": false, "timeout_ms": 5000, "permissions": {"local_binaries": ["ical-query"], "telegram": false, "openclaw_action": false, "network": false}, "function_schema": {"name": "calendar_query", "description": "Check the operator's calendar availability or create a new entry. PRIVACY RULE: When reporting availability to callers, NEVER disclose event titles, names, locations, or any details about what the operator is doing. Only share whether they are free or busy at a given time (e.g. 'free from 2pm to 4pm', 'busy until 3pm'). Treat all calendar event details as private and confidential.", "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["lookup", "create"], "description": "Whether to look up availability or create a new event"}, "range": {"type": "string", "description": "For lookup: today, tomorrow, week, or a specific date like 2026-02-23"}, "title": {"type": "string", "description": "For create: the event title"}, "start": {"type": "string", "description": "For create: start date-time like 2026-02-23T15:00"}, "end": {"type": "string", "description": "For create: end date-time like 2026-02-23T16:00"}, "calendar": {"type": "string", "description": "Optional: specific calendar name"}, "notes": {"type": "string", "description": "For create: event notes"}, "location": {"type": "string", "description": "For create: event location"}}, "required": ["action"]}}}}
---

# Calendar Skill

Query the operator's calendar for availability and create new entries via `ical-query`.

## Capabilities

- **read**: Check free/busy availability for today, tomorrow, this week, or a specific date
- **act**: Create new calendar entries

## Privacy Rule

**Event details are never disclosed to callers.** This is enforced at two levels:

1. **Handler level** — the handler strips all event titles, names, locations, and notes from ical-query output before returning results. Only busy time slots (start/end times) are returned.
2. **Model level** — the function description instructs Amber to only communicate availability ("free from 2pm to 4pm") and never reveal what the events are.

Amber should say things like:
- ✅ "The operator is free between 2 and 4 this afternoon"
- ✅ "They're busy until 3pm, then free for the rest of the day"
- ❌ "They have a meeting with John at 2pm" ← never
- ❌ "They're at the dentist from 10 to 11" ← never

## Notes

- Uses `/usr/local/bin/ical-query` — no network access, no gateway round-trip
- Fast: direct local binary call (~100ms)
- Calendar name optional — defaults to operator's primary calendar
