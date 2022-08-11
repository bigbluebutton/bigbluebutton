const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const redis = require('redis');
const {Worker, workerData} = require('worker_threads');
const path = require('path');
const cp = require('child_process');

const jobId = workerData;

const logger = new Logger('presAnn Collector');
logger.info('Collecting job ' + jobId);

const kickOffProcessWorker = (jobId) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/process.js', {workerData: jobId});
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Process Worker stopped with exit code ${code}`));
      }
    });
  });
};

const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);

// Takes the Job from the dropbox
const job = fs.readFileSync(path.join(dropbox, 'job'));
const exportJob = JSON.parse(job);

// Collect the annotations from Redis
(async () => {
  const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  });

  client.on('error', (err) => logger.info('Redis Client Error', err));

  await client.connect();

  const presAnn = await client.hGetAll(exportJob.jobId);

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
    return logger.error(`Could not find presentation file ${exportJob.jobId}`);
  }

  kickOffProcessWorker(exportJob.jobId);
})();
