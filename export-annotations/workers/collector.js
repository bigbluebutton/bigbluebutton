const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const redis = require('redis');
const { Worker, workerData, parentPort } = require('worker_threads');
const path = require('path');

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

let dropbox = path.join(config.shared.presAnnDropboxDir, jobId);

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

    // Collect the Presentation Page files from the presentation directory
    
    // PDF / PNG / JPEG file
    let presentationFile = path.join(exportJob.presLocation, exportJob.presId);

    // Use the SVG files as shown in the browser in order to avoid incorrect dimensions
    // Tldraw uses absolute coordinates
    
    for (let p of pages) {
      let pageNumber = p.page;
      let svgFile = path.join(exportJob.presLocation, 'svgs',  `slide${pageNumber}.svg`)
      let outputFile = path.join(dropbox, `slide${pageNumber}`);
      let svgFileExists = fs.existsSync(svgFile);
      
      // CairoSVG doesn't handle transparent SVG embeds properly, e.g., for transparent pictures.
      // In these cases we reference the PNG image

      if (fs.existsSync(`${presentationFile}.png`)) {
        fs.copyFileSync(`${presentationFile}.png`, `${outputFile}.png`);
      }

      else if (svgFileExists) {
        fs.copyFileSync(svgFile, `${outputFile}.svg`);
      }
      
      else {
        return logger.error(`Could not find whiteboard presentation file for job ${exportJob.jobId}`);
      }
    }

    kickOffProcessWorker(exportJob.jobId);
})()

parentPort.postMessage({ message: workerData })
