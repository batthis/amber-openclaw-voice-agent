/**
 * Calendar Skill — Handler
 * 
 * Queries and manages calendar events via ical-query CLI.
 */

module.exports = async function calendarHandler(params, context) {
  const { action, range, title, start, end, calendar, notes, location } = params;

  try {
    if (action === 'lookup') {
      const r = range || 'today';

      // Map range to ical-query command
      let cmd;
      if (r === 'today' || r === 'tomorrow' || r === 'week') {
        cmd = `/usr/local/bin/ical-query ${r}`;
      } else {
        // Assume it's a date or date range
        cmd = `/usr/local/bin/ical-query range ${r} ${r}`;
      }

      if (calendar) {
        cmd += ` --calendar "${calendar.replace(/"/g, '\\"')}"`;
      }

      const output = await context.exec(cmd);

      if (!output || !output.trim()) {
        return {
          success: true,
          message: `No events found for ${r}.`,
          result: { events: [], range: r },
        };
      }

      return {
        success: true,
        message: output.trim(),
        result: { events: output.trim(), range: r },
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

      // Build ical-query add command
      const safeTitle = title.replace(/"/g, '\\"');
      const safeStart = start.replace(/"/g, '\\"');
      const safeEnd = end.replace(/"/g, '\\"');

      let cmd = `/usr/local/bin/ical-query add "${safeTitle}" "${safeStart}" "${safeEnd}"`;

      if (calendar) cmd += ` --calendar "${calendar.replace(/"/g, '\\"')}"`;
      if (location) cmd += ` --location "${location.replace(/"/g, '\\"')}"`;
      if (notes) cmd += ` --notes "${notes.replace(/"/g, '\\"')}"`;

      const output = await context.exec(cmd);

      // Log the creation to call log
      context.callLog.write({
        type: 'skill.calendar.create',
        title,
        start,
        end,
        calendar: calendar || 'default',
        location: location || null,
        notes: notes || null,
        output: output,
      });

      return {
        success: true,
        message: `Done — I've added "${title}" to the calendar.`,
        result: { created: true, output },
      };
    }

    return {
      success: false,
      error: `Unknown action: ${action}`,
      message: "I can look up calendar events or create new ones — which would you like?",
    };
  } catch (e) {
    const errMsg = e && e.message ? e.message : String(e);
    return {
      success: false,
      error: errMsg,
      message: "I had trouble accessing the calendar. Let me note that for follow-up.",
    };
  }
};
