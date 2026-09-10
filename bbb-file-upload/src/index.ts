import { startExpressApp } from './express';
import { Logger } from './common/logger';

const logger = new Logger('main');

try {
  startExpressApp();
} catch (err) {
  logger.fatal('Fatal startup error', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
}
