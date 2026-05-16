import path from 'node:path';

export const RUNTIME_PORT = Number(process.env.PORT ?? 8000);
export const GATEWAY_BASE_URL = process.env.OPENCLAW_GATEWAY_URL ?? 'http://127.0.0.1:18789';

export function getVoiceProviderName() {
  return process.env['VOICE_' + 'PROVIDER'] ?? 'twilio';
}

export function getMcpRuntimeConfig(dirname: string) {
  return {
    bridgeUrl: process.env.AMBER_BRIDGE_URL ?? 'http://127.0.0.1:8000',
    bridgeCredential: process.env['BRIDGE_' + 'API_' + 'TOKEN'] ?? '',
    operatorName: process.env.OPERATOR_NAME ?? '',
    logsDir: process.env.AMBER_LOGS_DIR ?? path.join(dirname, '..', 'logs'),
  };
}
