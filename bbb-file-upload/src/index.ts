import startRedis from './redis/subscriber';
import { startExpressApp } from './express';
import { startResidualScanLoop } from './redis/cleanup';
import { Logger } from './common/logger';

const logger = new Logger('main');

async function main(): Promise<void> {
  await startRedis();
  startExpressApp();
  // Recover cleanup timers lost to a crash/restart, and keep re-scanning so the
  // startup race against bbb-web is retried instead of skipped forever.
  // Best-effort and non-blocking: it must not hold up serving uploads.
  startResidualScanLoop();
}

try {
  await main();
} catch (err) {
  logger.fatal('Fatal startup error', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
}
