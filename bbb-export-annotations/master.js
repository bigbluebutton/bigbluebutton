import Logger from './lib/utils/logger.js';
import WorkerStarter from './lib/utils/worker-starter.js';
import fs from 'fs';
import redis, {commandOptions} from 'redis';
import path from 'path';

const logger = new Logger('presAnn Master');
const config = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));

logger.info('Running bbb-export-annotations');

(async () => {
  const client = redis.createClient({
    password: config.redis.password,
    socket: {
        host: config.redis.host,
        port: config.redis.port
    }
  });

  await client.connect();

  client.on('error', (err) => logger.info('Redis Client Error', err));

  /**
   * Pops new export requests from a Redis queue, blocking the
   * connection otherwise.
   */
  async function waitForJobs() {
    const queue = client.blPop(
        commandOptions({isolated: true}),
        config.redis.channels.queue,
        0,
    );

    const job = await queue;

    logger.info('Received job', job.element);
    const exportJob = JSON.parse(job.element);
    const jobId = exportJob.jobId;

    // Create folder in dropbox
    const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);
    fs.mkdirSync(dropbox, {recursive: true});

    // Drop job into dropbox as JSON
    fs.writeFile(path.join(dropbox, 'job'), job.element, function(err) {
      if (err) {
        return logger.error(err);
      }
    });

    const collectorWorker = new WorkerStarter({jobId});
    collectorWorker.collect();
    waitForJobs();
  }

  waitForJobs();
})();
