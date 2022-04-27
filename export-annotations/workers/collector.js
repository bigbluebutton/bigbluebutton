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
    
    // Remove annotations from Redis
    await client.DEL(jobId);

    let annotations = JSON.stringify(presAnn);

    let whiteboard = JSON.parse(annotations);
    let pages = JSON.parse(whiteboard.pages);
    
    fs.writeFile(`${dropbox}/whiteboard`, annotations, function(err) {
      if(err) { return logger.error(err); }
    });

    // Collect the Presentation Page files from the presentation directory
    let path = `${exportJob.presLocation}/${exportJob.presId}`;
    let pdfFileExists = fs.existsSync(`${path}.pdf`);

    for (let p of pages) {
      let pageNumber = p.page;
      let file = `${dropbox}/slide${pageNumber}`;

      if(pdfFileExists) {
        let extactSlideAsPDFCommands = [
          'pdftocairo',
          '-png',
          '-f', pageNumber,
          '-l', pageNumber,
          '-singlefile',
          `${path}.pdf`,
          file
        ].join(' ');
  
        execSync(extactSlideAsPDFCommands, (error, stderr) => {
          if (error) {
              return logger.error(`PDFtoCairo failed with error: ${error.message}`);
          }
  
          if (stderr) {
              return logger.error(`PDFtoCairo failed with stderr: ${stderr}`);
          }
        })
      }

      else if (fs.existsSync(`${path}.png`)) {
        fs.copyFileSync(`${path}.png`, `${file}.png`);
      }
      
      else if (fs.existsSync(`${path}.jpeg`)) {
        let convertImageToPngCommands = [
          'convert',
          `${path}.jpeg`,
          '-background', 'white',
          '-resize', '1600x1600',
          '-auto-orient',
          '-flatten',
          `${file}.png`
        ].join(' ');

        execSync(convertImageToPngCommands, (error, stderr) => {
          if (error) {
              return logger.error(`Image conversion to PNG failed with error: ${error.message}`);
          }
  
          if (stderr) {
              return logger.error(`Image conversion to PNG failed with stderr: ${stderr}`);
          }
        })
      }
      
      else {
        return logger.error(`Could not find whiteboard presentation file for job ${exportJob.jobId}`);
      }
    }

    kickOffProcessWorker(exportJob.jobId);
    client.disconnect();
})()

parentPort.postMessage({ message: workerData })
