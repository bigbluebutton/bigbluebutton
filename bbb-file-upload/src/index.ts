import startRedis from './redis/subscriber';
import { startExpressApp } from './express';
import { scanResidualUploads } from './redis/cleanup';
import { Logger } from './common/logger';

const logger = new Logger('main');

async function main(): Promise<void> {
  await startRedis();
  startExpressApp();
  // Recover cleanup timers lost to a previous crash/restart. Best-effort and
  // non-blocking: it must not hold up serving uploads.
  scanResidualUploads().catch((err) => {
    logger.error('Residual uploads scan failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

try {
  await main();
} catch (err) {
  logger.fatal('Fatal startup error', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
}
