import startRedis from './redis/subscriber';
import { startExpressApp } from './express';
import { Logger } from './common/logger';

const logger = new Logger('main');

async function main(): Promise<void> {
  await startRedis();
  startExpressApp();
}

try {
  await main();
} catch (err) {
  logger.fatal('Fatal startup error', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
}
