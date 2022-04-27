const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const redis = require('redis');
const { execSync } = require("child_process");

const { Worker, workerData, parentPort } = require('worker_threads')

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

let dropbox = `${config.shared.presAnnDropboxDir}/${jobId}`

// Takes the Job from the dropbox
let job = fs.readFileSync(`${dropbox}/job`);
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
    let annotations = JSON.stringify(presAnn);

    let whiteboard = JSON.parse(annotations);
    let pages = JSON.parse(whiteboard.pages);
    
    fs.writeFile(`${dropbox}/whiteboard`, annotations, function(err) {
      if(err) { return logger.error(err); }
    });

    // Collect the Presentation Page files from the presentation directory
    for (let p of pages) {
      let pageNumber = p.page;
      let pdf = `${exportJob.presLocation}/${exportJob.presId}.pdf`;
      let file = `${dropbox}/slide${pageNumber}`;

      let extactSlideAsPDFCommands = [
        'pdftocairo',
        '-png',
        '-f', pageNumber,
        '-l', pageNumber,
        '-singlefile',
        pdf,
        file
      ].join(' ');

      execSync(extactSlideAsPDFCommands, (error, stderr) => {
        if (error) {
            logger.error(`PDFtoCairo failed with error: ${error.message}`);
            return;
        }

        if (stderr) {
            logger.error(`PDFtoCairo failed with stderr: ${stderr}`);
            return;
        }
      })
    }

    kickOffProcessWorker(exportJob.jobId)

    // Remove annotations from Redis
    await client.DEL(jobId);
    client.disconnect();
})()

parentPort.postMessage({ message: workerData })
