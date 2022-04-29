const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const FormData = require('form-data');
const redis = require('redis');
const axios = require('axios').default;
const path = require('path');

const { workerData, parentPort } = require('worker_threads')

const [jobType, jobId, filename] = workerData;

const logger = new Logger('presAnn Notifier Worker');

const dropbox = `${config.shared.presAnnDropboxDir}/${jobId}`
let job = fs.readFileSync(path.join(dropbox, 'job'));
let exportJob = JSON.parse(job);

async function notifyMeetingActor() {
    const client = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
    });

    await client.connect();
    client.on('error', (err) => logger.info('Redis Client Error', err));

    let link = `${config.notifier.protocol}://${config.notifier.host}/bigbluebutton/presentation/${exportJob.parentMeetingId}/${exportJob.parentMeetingId}/${exportJob.presId}/pdf/${jobId}/${filename}`;
    // Notify Meeting Actor of file availability by sending a message through Redis PubSub
    const notification = {
        envelope: {
            name: config.notifier.msgName,
            routing: {
                sender: exportJob.module
            },
            timestamp: (new Date()).getTime(),
        },
        core: {
            header: {
                name: config.notifier.msgName,
                meetingId: exportJob.parentMeetingId,
                userId: ""
            },
            body: {
                fileURI: link
            },
          }
    }

    logger.info(`Annotated PDF available at ${link}`);
    await client.publish(config.redis.channels.publish, JSON.stringify(notification));
    client.disconnect();
}

async function upload(exportJob) {
    let callbackUrl = `http://${config.bbbWeb.host}:${config.bbbWeb.port}/bigbluebutton/presentation/${exportJob.presentationUploadToken}/upload`
    let formData = new FormData();

    formData.append('conference', exportJob.parentMeetingId);
    formData.append('pod_id', config.notifier.pod_id);
    formData.append('is_downloadable', config.notifier.is_downloadable);
    formData.append('fileUpload', fs.createReadStream(`${exportJob.presLocation}/pdfs/${jobId}/${filename}.pdf`));

    let res = await axios.post(callbackUrl, formData, { headers: formData.getHeaders() });
    logger.info(`Upload of job ${exportJob.jobId} returned ${res.data}`);
}

if (jobType == 'PresentationWithAnnotationDownloadJob') {
    notifyMeetingActor();

} else if (jobType == 'PresentationWithAnnotationExportJob') {
    upload(exportJob);

} else {
    logger.error(`Notifier received unknown job type ${jobType}`);
}

parentPort.postMessage({ message: workerData })
