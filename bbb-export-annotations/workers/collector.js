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

const kickOffProcessWorker = (jobId, statusUpdate) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/process.js', {workerData: [jobId, statusUpdate]});
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
  const statusUpdate = {
    envelope: {
      name: config.log.msgName,
      routing: {
        sender: exportJob.module,
      },
      timestamp: (new Date()).getTime(),
    },
    core: {
      header: {
        name: config.log.msgName,
        meetingId: exportJob.parentMeetingId,
        userId: '',
      },
      body: {
        presId: exportJob.presId,
        pageNumber: 1,
        totalPages: pages.length,
        status: 'collecting',
        error: false,
      },
    },
  };

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

      try {
        cp.spawnSync(config.shared.pdftocairo, extract_png_from_pdf, {shell: false});
      } catch (error) {
        const error_reason = `PDFtoCairo failed extracting slide ${pageNumber}`;
        logger.error(`${error_reason} in job ${jobId}: ${error.message}`);
        statusUpdate.core.body.status = error_reason;
        statusUpdate.core.body.error = true;
      }

      statusUpdate.core.body.pageNumber = pageNumber;
      await client.publish(config.redis.channels.publish, JSON.stringify(statusUpdate));
      statusUpdate.core.body.error = false;
    }
  // If PNG file already available
  } else if (fs.existsSync(`${presFile}.png`)) {
    fs.copyFileSync(`${presFile}.png`, path.join(dropbox, 'slide1.png'));
    await client.publish(config.redis.channels.publish, JSON.stringify(statusUpdate));
  // If JPEG file available
  } else if (fs.existsSync(`${presFile}.jpeg`)) {
    fs.copyFileSync(`${presFile}.jpeg`, path.join(dropbox, 'slide1.jpeg'));
    await client.publish(config.redis.channels.publish, JSON.stringify(statusUpdate));
  } else {
    statusUpdate.core.body.error = true;
    await client.publish(config.redis.channels.publish, JSON.stringify(statusUpdate));
    client.disconnect();
    return logger.error(`Presentation file missing for job ${exportJob.jobId}`);
  }

  client.disconnect();
  kickOffProcessWorker(exportJob.jobId, statusUpdate);
})();
