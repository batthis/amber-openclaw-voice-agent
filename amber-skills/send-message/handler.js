/**
 * Send Message Skill — Handler
 * 
 * Saves a caller's message to the call log and delivers it
 * to the operator via their configured messaging channel.
 */

/**
 * Sanitize a string — strip control characters, enforce max length.
 */
function sanitize(s, maxLen) {
  if (!s) return '';
  return String(s)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .slice(0, maxLen || 500);
}

module.exports = async function sendMessageHandler(params, context) {
  const cleanMessage = sanitize(params.message, 1000);
  const cleanName = sanitize(params.caller_name, 100);
  const cleanCallback = sanitize(params.callback_number, 20);
  const cleanUrgency = params.urgency === 'urgent' ? 'urgent' : 'normal';

  if (!cleanMessage) {
    return {
      success: false,
      error: 'Empty message',
      message: "I didn't catch a message to leave. Could you repeat that?",
    };
  }

  // Step 1: ALWAYS write to call log first (audit trail)
  const logEntry = {
    type: 'skill.send_message',
    caller_name: cleanName || 'Unknown',
    callback_number: cleanCallback || 'Not provided',
    message: cleanMessage,
    urgency: cleanUrgency,
    delivery_status: 'pending',
  };

  context.callLog.write(logEntry);

  // Step 2: Attempt delivery via operator's messaging channel
  let delivered = false;
  try {
    const operatorName = context.operator.name || 'operator';
    const emoji = cleanUrgency === 'urgent' ? '🚨' : '📞';

    const formattedMessage = [
      `${emoji} Message from a call:`,
      '',
      cleanName ? `From: ${cleanName}` : null,
      cleanCallback ? `Callback: ${cleanCallback}` : null,
      cleanUrgency === 'urgent' ? 'Priority: URGENT' : null,
      '',
      cleanMessage,
    ]
      .filter(function (line) { return line !== null; })
      .join('\n');

    await context.gateway.sendMessage(formattedMessage);
    delivered = true;

    // Log delivery success
    context.callLog.write({
      type: 'skill.send_message.delivered',
      delivery_channel: 'openclaw_gateway',
    });
  } catch (e) {
    // Log delivery failure — but don't tell caller about the specific channel
    context.callLog.write({
      type: 'skill.send_message.delivery_failed',
      error: e && e.message ? e.message : String(e),
    });
  }

  // Amber says "noted" — delivery channel is an implementation detail
  const operatorRef = context.operator.name || 'The operator';
  const spokenResponse = cleanName
    ? `Got it — I've noted your message, ${cleanName}. ${operatorRef} will get back to you.`
    : `Got it — I've noted your message. ${operatorRef} will get back to you.`;

  return {
    success: true,
    message: spokenResponse,
    result: { logged: true, delivered },
  };
};
