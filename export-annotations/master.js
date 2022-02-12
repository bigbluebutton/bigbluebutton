const Logger = require('./lib/utils/logger');
const config = require('./config');
const fs = require('fs');
const redis = require('redis');
const { Worker } = require('worker_threads')

const logger = new Logger('presAnn Master');
logger.info("Running export-annotations");

const kickOffCollectorWorker = (jobId) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./workers/collector.js', { workerData: jobId });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`PresAnn Collector Worker stopped with exit code ${code}`));
        })
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const client = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
      });
  
    client.on('error', (err) => logger.info('Redis Client Error', err));

    await client.connect();

    while (true) {
        await sleep(config.redis.interval);
        
        let job = await client.LPOP(config.redis.channels.queue)

        const exportJob = JSON.parse(job);

        if(job != null) {
            logger.info('Received job', job)
            
            // Create folder in dropbox
            let dropbox = config.shared.presAnnDropboxDir + '/' + exportJob.jobId
            fs.mkdirSync(dropbox, { recursive: true })
            
            // Drop job into dropbox as JSON
            fs.writeFile(dropbox + '/job', job, function(err) {
                if(err) { return logger.error(err); }
            });

            kickOffCollectorWorker(exportJob.jobId)
        }
    }
})();
