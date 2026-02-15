#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { processLogsWithOptions } = require('../process_logs');

function parseArgs(argv) {
  const args = {
    logsDir: null,
    outputDir: null,
    intervalMs: 1500
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--logs' && argv[i + 1]) args.logsDir = argv[++i];
    else if (a === '--out' && argv[i + 1]) args.outputDir = argv[++i];
    else if (a === '--interval-ms' && argv[i + 1]) args.intervalMs = Number(argv[++i]);
    else if (a === '-h' || a === '--help') args.help = true;
  }

  return args;
}

function listRelevantFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(n => /^incoming_.*\.json$/.test(n) || /^rtc_.*\.txt$/.test(n) || /^rtc_.*\.summary\.json$/.test(n))
    .map(n => path.join(dir, n));
}

function computeSignature(files) {
  let maxMtime = 0;
  let totalSize = 0;
  for (const f of files) {
    try {
      const st = fs.statSync(f);
      if (st.mtimeMs > maxMtime) maxMtime = st.mtimeMs;
      totalSize += st.size;
    } catch {
      // ignore
    }
  }
  return `${files.length}:${maxMtime}:${totalSize}`;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: node scripts/watch.js [--logs <dir>] [--out <dir>] [--interval-ms <n>]');
    console.log('');
    console.log('If --logs is not specified, uses LOGS_DIR env var or default from process_logs.js');
    process.exit(0);
  }

  // Get default logs dir from env or process_logs.js defaults
  if (!args.logsDir) {
    args.logsDir = process.env.LOGS_DIR || path.join(__dirname, '../runtime/logs');
  }

  let lastSig = null;
  let running = false;

  console.log(`Watching: ${args.logsDir}`);
  console.log(`Interval: ${args.intervalMs}ms`);

  const tick = async () => {
    if (running) return;
    let files = [];
    try {
      files = listRelevantFiles(args.logsDir);
    } catch (e) {
      console.error('Watch error (readdir):', e);
      return;
    }
    const sig = computeSignature(files);
    if (sig === lastSig) return;
    lastSig = sig;

    running = true;
    try {
      console.log(`[${new Date().toISOString()}] change detected → aggregating…`);
      await processLogsWithOptions({
        logsDir: args.logsDir,
        outputDir: args.outputDir || undefined,
        writeSample: true
      });
    } catch (e) {
      console.error('Aggregation failed:', e);
    } finally {
      running = false;
    }
  };

  // Run once immediately, then poll.
  await tick();
  setInterval(tick, args.intervalMs);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
