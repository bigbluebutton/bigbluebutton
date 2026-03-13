import { Logger } from '../../common/logger';
import config from '../../config';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'node:fs';

const logger = new Logger('helpers/uploadPresentation'); 

const uploadPresentation = async (
  filePath: string,
  presUploadToken: string,
  meetingId: string,
  temporaryPresentationId: string,
): Promise<void> => {
  const uploadToken = `/${presUploadToken}`;
  const uploadAction = '/upload';

  // Construct the BBB web API URL
  const { presentationEndpoint: bbbWebPresentationEndpoint } = config.bbbWeb;
  const bbbWebHost = config.bbbWeb.host;
  const bbbWebPort = config.bbbWeb.port;
  const callbackUrl = `http://${bbbWebHost}:${bbbWebPort}${bbbWebPresentationEndpoint}${uploadToken}${uploadAction}`;

  const formData = new FormData();
  formData.append('conference', meetingId);
  formData.append('pod_id', 'DEFAULT_PRESENTATION_POD');
  formData.append('is_downloadable', 'false');
  formData.append('temporaryPresentationId', temporaryPresentationId);
  formData.append('fileUpload', fs.createReadStream(filePath));

  try {
    const res = await axios.post(callbackUrl, formData, {
      headers: formData.getHeaders(),
    });
    logger.info('Upload to BBB successful', {
      jobId: temporaryPresentationId,
      status: res.status,
      data: res.data,
    });
  } catch (error) {
    logger.error('Could not upload to BBB', {
      error: error instanceof Error ? error.message : String(error),
      jobId: temporaryPresentationId,
    });
    throw error;
  }
};

export { uploadPresentation };