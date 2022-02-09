const Logger = require('./lib/utils/logger');
const config = require('./config');
const fs = require('fs');
const redis = require('redis');

const logger = new Logger('presAnn');
logger.info("Started presAnn Master");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const client = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
      });
  
    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    while (true) {
        await sleep(config.redis.interval);
        
        var job = await client.LPOP(config.redis.channels.queue)

        const exportJob = JSON.parse(job);

        if(job != null) {
            logger.info('Received new job', job)
            
            // Drop job into dropbox as JSON
            fs.writeFile(config.master.presAnnDropboxDir + '/' + exportJob.jobId, job, function(err) {
                if(err) { return logger.error(err); }
            });

            // Kicks processing by launching the Collector Worker passing JobId
        }
    }
})();
