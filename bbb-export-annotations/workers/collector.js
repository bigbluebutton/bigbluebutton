import Logger from '../lib/utils/logger.js';
import fs from 'fs';
import path from 'path';
import redis from 'redis';
import WorkerStarter from '../lib/utils/worker-starter.js';
import {PresAnnStatusMsg} from '../lib/utils/message-builder.js';
import {workerData} from 'worker_threads';

const jobId = workerData.jobId;
const logger = new Logger('presAnn Collector');
logger.info(`Collecting job ${jobId}`);

const config = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));
const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);

// Takes the Job from the dropbox
const job = fs.readFileSync(path.join(dropbox, 'job'));
const exportJob = JSON.parse(job);
const jobType = exportJob.jobType;

/**
 * Asynchronously collects annotations from Redis, processes them,
 * and handles the collection of presentation page files. It removes
 * the annotations from Redis after collection, writes them to a file,
 * and manages the retrieval of SVGs, PNGs, or JPEGs. Errors during the
 * process are logged, and the status of the operation is published to
 * a Redis channel.
 *
 * @async
 * @function collectAnnotationsFromRedis
 * @throws Will log an error if an error occurs in connecting to Redis.
 * @return {Promise<void>} Resolves when the function has completed its task.
 */
async function collectAnnotationsFromRedis() {
  const client = redis.createClient({
    password: config.redis.password,
    socket: {
        host: config.redis.host,
        port: config.redis.port
    }
  });

  client.on('error', (err) => logger.info('Redis Client Error', err));

  await client.connect();

  const presAnn = await client.hGetAll(jobId);

  // Remove annotations from Redis
  await client.del(jobId);

  const annotations = JSON.stringify(presAnn);

  const whiteboard = JSON.parse(annotations);
  const pages = JSON.parse(whiteboard.pages);

  fs.writeFile(path.join(dropbox, 'whiteboard'), annotations, function(err) {
    if (err) {
      return logger.error(err);
    }
  });

  // Collect the presentation page files (PDF / PNG / JPEG)
  // from the presentation directory
  const presFile = path.join(exportJob.presLocation, exportJob.presId);
  const pdfFile = `${presFile}.pdf`;

  // Message to display conversion progress toast
  const statusUpdate = new PresAnnStatusMsg(exportJob);

  if (fs.existsSync(pdfFile)) {
    // If there's a PDF file, we leverage the existing converted SVG slides
    for (const p of pages) {
      const pageNumber = p.page;
      const imageName = `slide${pageNumber}`;
      const convertedSVG = path.join(
          exportJob.presLocation,
          'svgs',
          `${imageName}.svg`);

      const outputFile = path.join(dropbox, `slide${pageNumber}.svg`);

      try {
        fs.copyFileSync(convertedSVG, outputFile);
      } catch (error) {
        logger.error('Failed collecting slide ' + pageNumber +
          ' in job ' + jobId + ': ' + error.message);
        statusUpdate.setError();
      }

      await client.publish(
          config.redis.channels.publish,
          statusUpdate.build(pageNumber));
    }
  } else {
    const imageName = 'slide1';

    if (fs.existsSync(`${presFile}.png`)) {
      fs.copyFileSync(`${presFile}.png`,
          path.join(dropbox, `${imageName}.png`));
    } else if (fs.existsSync(`${presFile}.jpeg`)) {
      fs.copyFileSync(`${presFile}.jpeg`,
          path.join(dropbox, `${imageName}.jpeg`));
    } else if (fs.existsSync(`${presFile}.jpg`)) {
      // JPG file available: copy changing extension to JPEG
      fs.copyFileSync(`${presFile}.jpg`,
          path.join(dropbox, `${imageName}.jpeg`));
    } else {
      await client.publish(config.redis.channels.publish, statusUpdate.build());
      client.disconnect();
      return logger.error(`PDF/PNG/JPG/JPEG file not found for job ${jobId}`);
    }

    await client.publish(config.redis.channels.publish, statusUpdate.build());
  }

  client.disconnect();

  const process = new WorkerStarter({jobId});
  process.process();
}

switch (jobType) {
  case 'PresentationWithAnnotationExportJob':
    collectAnnotationsFromRedis();
    break;
  case 'PresentationWithAnnotationDownloadJob':
    collectAnnotationsFromRedis();
    break;
  default:
    logger.error(`Unknown job type ${jobType}`);
}
