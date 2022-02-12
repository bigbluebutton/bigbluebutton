const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');

const { workerData, parentPort } = require('worker_threads')

const jobId = workerData;

const logger = new Logger('presAnn Process Worker');
logger.info("Processing PDF for job " + jobId);

// Process the presentation pages and annotations into a PDF file

// 1. Get the job
// 2. Get the annotations
// 3. Convert annotations to SVG
// 4. Overlay annotations onto slides

// Resulting PDF file is stored in the presentation dir

// Launch Notifier Worker depending on job type

parentPort.postMessage({ message: workerData })
