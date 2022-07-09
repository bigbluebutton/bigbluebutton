const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const redis = require('redis');
const { Worker, workerData, parentPort } = require('worker_threads');
const path = require('path');
const { execSync } = require("child_process");

const jobId = workerData;

const logger = new Logger('presAnn Collector');
logger.info("Collecting job " + jobId);

const kickOffProcessWorker = (jobId) => {
  return new Promise((resolve, reject) => {
      const worker = new Worker('./workers/process.js', { workerData: jobId });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
          if (code !== 0)
              reject(new Error(`PresAnn Process Worker stopped with exit code ${code}`));
      })
  })
}

const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);

// Takes the Job from the dropbox
let job = fs.readFileSync(path.join(dropbox, 'job'));
let exportJob = JSON.parse(job);

// Collect the annotations from Redis
(async () => {
    const client = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
      });
  
    client.on('error', (err) => logger.info('Redis Client Error', err));

    await client.connect();
    
    let presAnn = await client.hGetAll(exportJob.jobId);
    
    // Remove annotations from Redis
    await client.DEL(jobId);

    client.disconnect();

    let annotations = JSON.stringify(presAnn);

    let whiteboard = JSON.parse(annotations);
    let pages = JSON.parse(whiteboard.pages);
    
    fs.writeFile(path.join(dropbox, 'whiteboard'), annotations, function(err) {
      if(err) { return logger.error(err); }
    });

    // Collect the Presentation Page files (PDF / PNG / JPEG) from the presentation directory
    let presentationFile = path.join(exportJob.presLocation, exportJob.presId);
    let pdfFile = `${presentationFile}.pdf`

    if (fs.existsSync(pdfFile)) {

      for (let p of pages) {
        let pageNumber = p.page;
        let outputFile = path.join(dropbox, `slide${pageNumber}`);
        
        // CairoSVG doesn't handle transparent SVG and PNG embeds properly, e.g., in rasterized text.
        // So textboxes may get a black background when downloading/exporting repeatedly.
        // To avoid that, we take slides from the uploaded file, but later probe the dimensions from the SVG
        // so it matches what was shown in the browser -- Tldraw unfortunately uses absolute coordinates.

        let extract_png_from_pdf = [
          'pdftocairo',
          '-png',
          '-f', pageNumber, 
          '-l', pageNumber,
          '-r', config.collector.backgroundSlidePPI,
          '-singlefile',
          '-cropbox',
          pdfFile, outputFile,
        ].join(' ')

        execSync(extract_png_from_pdf);
      }
    }

    // If PNG file already available
    else if (fs.existsSync(`${presentationFile}.png`)) {
      fs.copyFileSync(`${presentationFile}.png`, path.join(dropbox, 'slide1.png'));
    }
  
    // If JPEG file available
    else if (fs.existsSync(`${presentationFile}.jpeg`)) {
      fs.copyFileSync(`${presentationFile}.jpeg`, path.join(dropbox, 'slide1.jpeg'));
    }

    else {
      return logger.error(`Could not find whiteboard presentation file for job ${exportJob.jobId}`);
    }

    kickOffProcessWorker(exportJob.jobId);
})()

parentPort.postMessage({ message: workerData })
