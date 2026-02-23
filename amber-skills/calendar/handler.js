/**
 * Calendar Skill — Handler
 *
 * Queries and manages calendar events via ical-query CLI.
 *
 * PRIVACY RULE: For lookups, event titles and details are NEVER returned to Amber.
 * Only busy time slots are returned so Amber can communicate availability
 * without disclosing what the events are.
 */

/**
 * Parse ical-query output and extract only busy time ranges.
 * Strips event titles, locations, notes — returns only time slots.
 *
 * ical-query output format:
 * YYYY-MM-DD HH:MM - YYYY-MM-DD HH:MM | Event Title [all-day] @ Location [Calendar] id:<id>
 */
function extractBusySlots(output) {
  const slots = [];
  const lines = output.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    // Match: date time - date time | ... (everything after | is stripped)
    const match = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s*-\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
    const allDay = line.includes('[all-day]');

    if (match) {
      slots.push({ start: match[1].trim(), end: match[2].trim(), allDay });
    } else if (allDay) {
      // All-day events — extract date only
      const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        slots.push({ start: dateMatch[1], end: dateMatch[1], allDay: true });
      }
    }
  }

  return slots;
}

/**
 * Format busy slots into a human-readable availability summary.
 */
function formatAvailability(slots, range) {
  if (!slots.length) {
    return `The operator is free all of ${range}.`;
  }

  const lines = [`The operator has ${slots.length} commitment(s) on ${range}:`];
  for (const slot of slots) {
    if (slot.allDay) {
      lines.push(`- Busy all day`);
    } else {
      // Format time only (strip date if same day)
      const startTime = slot.start.includes(' ') ? slot.start.split(' ')[1] : slot.start;
      const endTime = slot.end.includes(' ') ? slot.end.split(' ')[1] : slot.end;
      lines.push(`- Busy ${startTime} to ${endTime}`);
    }
  }
  lines.push('Free at all other times.');
  return lines.join('\n');
}

module.exports = async function calendarHandler(params, context) {
  const { action, range, title, start, end, calendar, notes, location } = params;

  try {
    if (action === 'lookup') {
      const r = range || 'today';

      let cmd;
      if (r === 'today' || r === 'tomorrow' || r === 'week') {
        cmd = `/usr/local/bin/ical-query ${r}`;
      } else {
        cmd = `/usr/local/bin/ical-query range ${r} ${r}`;
      }

      if (calendar) {
        cmd += ` --calendar "${calendar.replace(/"/g, '\\"')}"`;
      }

      const output = await context.exec(cmd);

      if (!output || !output.trim()) {
        return {
          success: true,
          message: `The operator is free all of ${r} — no commitments.`,
          result: { busy_slots: [], range: r },
        };
      }

      // PRIVACY: Strip all event details — return only free/busy times
      const busySlots = extractBusySlots(output);
      const summary = formatAvailability(busySlots, r);

      return {
        success: true,
        message: summary,
        result: { busy_slots: busySlots, range: r },
        // raw output intentionally NOT included — would contain event titles
      };
    }

    if (action === 'create') {
      if (!title || !start || !end) {
        return {
          success: false,
          error: 'Missing required fields: title, start, end',
          message: "I need a title, start time, and end time to create an event.",
        };
      }

      const safeTitle = title.replace(/"/g, '\\"');
      const safeStart = start.replace(/"/g, '\\"');
      const safeEnd = end.replace(/"/g, '\\"');

      let cmd = `/usr/local/bin/ical-query add "${safeTitle}" "${safeStart}" "${safeEnd}"`;
      if (calendar) cmd += ` --calendar "${calendar.replace(/"/g, '\\"')}"`;
      if (location) cmd += ` --location "${location.replace(/"/g, '\\"')}"`;
      if (notes) cmd += ` --notes "${notes.replace(/"/g, '\\"')}"`;

      const output = await context.exec(cmd);

      context.callLog.write({
        type: 'skill.calendar.create',
        title, start, end,
        calendar: calendar || 'default',
        location: location || null,
        notes: notes || null,
      });

      return {
        success: true,
        message: `Done — I've added that to the calendar.`,
        result: { created: true, output },
      };
    }

    return {
      success: false,
      error: `Unknown action: ${action}`,
      message: "I can check availability or add events — which would you like?",
    };

  } catch (e) {
    return {
      success: false,
      error: e && e.message ? e.message : String(e),
      message: "I had trouble accessing the calendar. Let me note that for follow-up.",
    };
  }
};
