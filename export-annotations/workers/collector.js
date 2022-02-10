const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const redis = require('redis');

const { workerData, parentPort } = require('worker_threads')

const jobId = workerData;

const logger = new Logger('presAnn Collector');
logger.info("Collecting job " + jobId);

// Takes the Job from the dropbox
console.log()

let job = fs.readFileSync(config.shared.presAnnDropboxDir + '/' + jobId);
let exportJob = JSON.parse(job);

// presId
// pages
// presLocation
// jobType

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
    const annotations = JSON.parse(JSON.stringify(presAnn));
    
    // Drop annotations as JSON in the dropbox
    console.log(annotations)
})()

// Collect the Presentation Page files from the presentation directory


parentPort.postMessage({ message: workerData })
