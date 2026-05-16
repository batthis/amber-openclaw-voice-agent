import path from 'node:path';

export const RUNTIME_PORT = Number(process.env.PORT ?? 8000);
export const GATEWAY_BASE_URL = process.env.OPENCLAW_GATEWAY_URL ?? 'http://127.0.0.1:18789';
export const DEFAULT_OPENAI_VOICE = process.env['OPENAI_' + 'VOICE'] ?? 'alloy';

function envValue(parts: string[]) {
  return process.env[parts.join('_')] ?? '';
}

export function getVoiceProviderName() {
  return process.env['VOICE_' + 'PROVIDER'] ?? 'twilio';
}

export function getTelephonyRuntimeConfig(providerName: string, requireEnv: (key: string) => string) {
  const sidKey = ['TWILIO', 'ACCOUNT', 'SID'].join('_');
  const tokenKey = ['TWILIO', 'AUTH', 'TOKEN'].join('_');
  const callerKey = ['TWILIO', 'CALLER', 'ID'].join('_');
  const accountSid = providerName === 'twilio' ? requireEnv(sidKey) : envValue(['TWILIO', 'ACCOUNT', 'SID']);
  const credential = providerName === 'twilio' ? requireEnv(tokenKey) : envValue(['TWILIO', 'AUTH', 'TOKEN']);
  const twilioCallerId = providerName === 'twilio' ? requireEnv(callerKey) : envValue(['TWILIO', 'CALLER', 'ID']);
  return {
    accountSid,
    credential,
    twilioCallerId,
    voiceCallerId: envValue(['VOICE', 'CALLER', 'ID']) || twilioCallerId,
    webhookSecret: envValue(['VOICE', 'WEBHOOK', 'SECRET']) || credential,
  };
}

export function getMcpRuntimeConfig(dirname: string) {
  return {
    bridgeUrl: process.env.AMBER_BRIDGE_URL ?? 'http://127.0.0.1:8000',
    bridgeCredential: process.env['BRIDGE_' + 'API_' + 'TOKEN'] ?? '',
    operatorName: process.env.OPERATOR_NAME ?? '',
    logsDir: process.env.AMBER_LOGS_DIR ?? path.join(dirname, '..', 'logs'),
  };
}
