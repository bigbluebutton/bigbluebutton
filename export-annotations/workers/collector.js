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

// Collect the annotations from Redis

// Collect the Presentation Page files from the presentation dir

parentPort.postMessage({ message: workerData })
