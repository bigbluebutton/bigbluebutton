const Logger = require('../lib/utils/logger');
const axios = require('axios').default;
const config = require('../config');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const redis = require('redis');
const sanitize = require('sanitize-filename');
const stream = require('stream');
const {Worker, workerData} = require('worker_threads');
const {promisify} = require('util');

const WorkerTypes = Object.freeze({
  Notifier: 'notifier',
  Process: 'process',
});

const jobId = workerData;
const logger = new Logger('presAnn Collector');
logger.info(`Collecting job ${jobId}`);

const kickOffWorker = (workerType, data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`./workers/${workerType}.js`, {workerData: data});
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker '${workerType}' stopped with exit code ${code}`));
      }
    });
  });
};

const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);

// Takes the Job from the dropbox
const job = fs.readFileSync(path.join(dropbox, 'job'));
const exportJob = JSON.parse(job);

async function collectAnnotationsFromRedis() {
  const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  });

  client.on('error', (err) => logger.info('Redis Client Error', err));

  await client.connect();

  const presAnn = await client.hGetAll(jobId);

  // Remove annotations from Redis
  await client.del(jobId);

  client.disconnect();

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

  if (fs.existsSync(pdfFile)) {
    for (const p of pages) {
      const pageNumber = p.page;
      const outputFile = path.join(dropbox, `slide${pageNumber}`);

      // CairoSVG doesn't handle transparent SVG and PNG embeds properly,
      // e.g., in rasterized text. So textboxes may get a black background
      // when downloading/exporting repeatedly. To avoid that, we take slides
      // from the uploaded file, but later probe the dimensions from the SVG
      // so it matches what was shown in the browser.

      const extract_png_from_pdf = [
        '-png',
        '-f', pageNumber,
        '-l', pageNumber,
        '-scale-to', config.collector.pngWidthRasterizedSlides,
        '-singlefile',
        '-cropbox',
        pdfFile, outputFile,
      ];

      cp.spawnSync(config.shared.pdftocairo, extract_png_from_pdf, {shell: false});
    }
  // If PNG file already available
  } else if (fs.existsSync(`${presFile}.png`)) {
    fs.copyFileSync(`${presFile}.png`, path.join(dropbox, 'slide1.png'));
  // If JPEG file available
  } else if (fs.existsSync(`${presFile}.jpeg`)) {
    fs.copyFileSync(`${presFile}.jpeg`, path.join(dropbox, 'slide1.jpeg'));
  } else {
    return logger.error(`Could not find presentation file ${jobId}`);
  }

  kickOffWorker(WorkerTypes.Process, jobId);
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Export shared notes via bbb-pads in the desired format
 * @param {Integer} retries - Number of retries to get the shared notes
*/
async function collectSharedNotes(retries = 3) {
  /** One of the following formats is supported:
    etherpad / html / pdf / txt / doc / odf */

  const padId = exportJob.presId;
  const notesFormat = 'pdf';

  const filename = `${sanitize(exportJob.filename.replace(/\s/g, '_'))}.${notesFormat}`;
  const notes_endpoint = `${config.bbbPadsAPI}/p/${padId}/export/${notesFormat}`;
  const filePath = path.join(dropbox, filename);

  const finishedDownload = promisify(stream.finished);
  const writer = fs.createWriteStream(filePath);

  try {
    const response = await axios({
      method: 'GET',
      url: notes_endpoint,
      responseType: 'stream',
    });
    response.data.pipe(writer);
    await finishedDownload(writer);
  } catch (err) {
    if (retries > 0 && err?.response?.status == 429) {
      // Wait for the bbb-pads API to be available due to rate limiting
      const backoff = err.response.headers['retry-after'] * 1000;
      logger.info(`Retrying ${jobId} in ${backoff}ms...`);
      await sleep(backoff);
      return collectSharedNotes(retries - 1);
    } else {
      logger.error(`Could not download notes in job ${jobId}`);
      return;
    }
  }

  kickOffWorker(WorkerTypes.Notifier, [exportJob.jobType, jobId, filename]);
}

switch (exportJob.jobType) {
  case 'PresentationWithAnnotationExportJob': return collectAnnotationsFromRedis();
  case 'PresentationWithAnnotationDownloadJob': return collectAnnotationsFromRedis();
  case 'PadCaptureJob': return collectSharedNotes();
  default: return logger.error(`Unknown job type ${exportJob.jobType}`);
}
