import startRedis from "./redis/subscriber";
import { startExpressApp } from "./express";
import { removeExpiredDocuments } from "./hocuspocus/extensions/postgresql";
import { Logger } from "./common/logger";

const logger = new Logger('cleanup');

async function main() {
  await startRedis();
  startExpressApp();
}

setInterval(async () => {
  try {
    const removed = await removeExpiredDocuments();
    if (removed > 0) {
      logger.info(`Removed ${removed} expired document(s)`);
    }
  } catch (error) {
    logger.error('Failed to remove expired documents', { error });
  }
}, 60_000);

try {
  await main();
} catch (err) {
  logger.error('Fatal startup error', { error: err });
  process.exit(1);
}
