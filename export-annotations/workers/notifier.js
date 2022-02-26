const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios').default;

const { workerData, parentPort } = require('worker_threads')

const [jobType, jobId] = workerData;

const logger = new Logger('presAnn Notifier Worker');
logger.info("Processing PDF for job " + jobType);

const dropbox = `${config.shared.presAnnDropboxDir}/${jobId}`
let job = fs.readFileSync(`${dropbox}/job`);
let exportJob = JSON.parse(job);

async function upload(exportJob) {
    let callbackUrl = `http://${config.bbbWeb.host}:${config.bbbWeb.port}/bigbluebutton/presentation/${exportJob.presentationUploadToken}/upload`
    let formData = new FormData();

    formData.append('presentation_name', 'annotated_slides.pdf');
    formData.append('Filename', 'annotated_slides');
    formData.append('conference', exportJob.parentMeetingId);
    formData.append('room', exportJob.parentMeetingId);
    formData.append('pod_id', config.notifier.pod_id);
    formData.append('is_downloadable', config.notifier.is_downloadable);
    formData.append('fileUpload', fs.createReadStream(`${exportJob.presLocation}/annotated_slides_${jobId}.pdf`));

    let res = await axios.post(callbackUrl, formData, { headers: formData.getHeaders() });
    logger.info(`Upload of job ${exportJob.jobId} returned ${res.data}`);
}

if (jobType == 'PresentationWithAnnotationDownloadJob') {

} else if (jobType == 'PresentationWithAnnotationExportJob') {
    upload(exportJob)

} else {
    logger.error(`Notifier received unknown job type ${jobType}`);
}

parentPort.postMessage({ message: workerData })
