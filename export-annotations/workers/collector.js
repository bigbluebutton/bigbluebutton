const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const redis = require('redis');

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

let dropbox = config.shared.presAnnDropboxDir + '/' + jobId

// Takes the Job from the dropbox
let job = fs.readFileSync(dropbox + '/job');
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
    
    fs.writeFile(dropbox + '/whiteboard', annotations, function(err) {
      if(err) { return logger.error(err); }
    });

    // Collect the Presentation Page files from the presentation directory
    for (let i = 0; i < pages.length; i++) {
      let pageNumber = pages[i].page
      let slide = exportJob.presLocation + '/slide' + pageNumber + '.svg'
      let file = dropbox + '/slide' + pageNumber + '.svg'

      fs.copyFile(slide, file, (err) => { if (err) throw err; } );
    }

    kickOffProcessWorker(exportJob.jobId)
})()

parentPort.postMessage({ message: workerData })
