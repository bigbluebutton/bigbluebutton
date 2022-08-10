const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const FormData = require('form-data');
const redis = require('redis');
const axios = require('axios').default;
const path = require('path');

const {workerData} = require('worker_threads');

const [jobType, jobId, filename_with_extension] = workerData;

const logger = new Logger('presAnn Notifier Worker');

const dropbox = `${config.shared.presAnnDropboxDir}/${jobId}`;
const job = fs.readFileSync(path.join(dropbox, 'job'));
const exportJob = JSON.parse(job);

/** Notify Meeting Actor of file availability by
 * sending a message through Redis PubSub */
async function notifyMeetingActor() {
  const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  });

  await client.connect();
  client.on('error', (err) => logger.info('Redis Client Error', err));

  const link = path.join(`${path.sep}bigbluebutton`, 'presentation',
      exportJob.parentMeetingId, exportJob.parentMeetingId,
      exportJob.presId, 'pdf', jobId, filename_with_extension);

  const notification = {
    envelope: {
      name: config.notifier.msgName,
      routing: {
        sender: exportJob.module,
      },
      timestamp: (new Date()).getTime(),
    },
    core: {
      header: {
        name: config.notifier.msgName,
        meetingId: exportJob.parentMeetingId,
        userId: '',
      },
      body: {
        fileURI: link,
        presId: exportJob.presId,
      },
    },
  };

  logger.info(`Annotated PDF available at ${link}`);
  await client.publish(config.redis.channels.publish,
      JSON.stringify(notification));
  client.disconnect();
}

/** Upload PDF to a BBB room */
async function upload() {
  const callbackUrl = `${config.bbbWebAPI}/bigbluebutton/presentation/${exportJob.presentationUploadToken}/upload`;
  const formData = new FormData();
  const file = `${exportJob.presLocation}/pdfs/${jobId}/${filename_with_extension}`;

  formData.append('conference', exportJob.parentMeetingId);
  formData.append('pod_id', config.notifier.pod_id);
  formData.append('is_downloadable', config.notifier.is_downloadable);
  formData.append('temporaryPresentationId', jobId);
  formData.append('fileUpload', fs.createReadStream(file));

  const res = await axios.post(callbackUrl, formData,
      {headers: formData.getHeaders()});
  logger.info(`Upload of job ${exportJob.jobId} returned ${res.data}`);
}

if (jobType == 'PresentationWithAnnotationDownloadJob') {
  notifyMeetingActor();
} else if (jobType == 'PresentationWithAnnotationExportJob') {
  upload();
} else {
  logger.error(`Notifier received unknown job type ${jobType}`);
}

// Delete temporary files
fs.rm(dropbox, {recursive: true}, (err) => {
  if (err) {
    throw err;
  }
});
