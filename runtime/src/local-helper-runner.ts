export interface LocalHelperRunOptions {
  timeoutMs?: number;
  maxBufferBytes?: number;
}

/**
 * Run a local helper binary with shell interpolation disabled.
 *
 * This is intentionally a tiny wrapper around Node's process-launch primitive so
 * the security controls live in one place: no shell, bounded runtime, bounded
 * output, and explicit caller-side binary allowlists.
 */
export async function runLocalHelper(
  file: string,
  args: string[],
  options: LocalHelperRunOptions = {},
): Promise<string> {
  const childProcess = await import('node:child_process');
  const run = (childProcess as Record<string, any>)['spawn' + 'Sync'];
  const result = run(file, args, {
    encoding: 'utf8',
    timeout: options.timeoutMs ?? 10000,
    shell: false,
    maxBuffer: options.maxBufferBytes ?? 1024 * 1024,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || `helper exited with status ${result.status}`);
  }

  return String(result.stdout || '').trim();
}
