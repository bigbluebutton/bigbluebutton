import { defineMessages, injectIntl } from 'react-intl';
import axios from 'axios';
import { UploadRequest } from '/imports/api/upload';
import Auth from '/imports/ui/services/auth';
import { notify } from '/imports/ui/services/notification';
import { makeCall } from '/imports/ui/services/api';

const UPLOAD = Meteor.settings.public.upload;
const DOWNLOAD = Meteor.settings.public.download;

const intlMessages = defineMessages({
  uploading: {
    id: 'app.upload.toast.uploading',
    description: 'Upload toast file uploading',
  },
  completed: {
    id: 'app.upload.toast.completed',
    description: 'Upload toast file completed',
  },
  401: {
    id: 'app.upload.toast.error.401',
    description: 'Upload toast error unauthorized',
  },
  408: {
    id: 'app.upload.toast.error.408',
    description: 'Upload toast error request timeout',
  },
  header: {
    id: 'app.upload.notification.header',
    description: 'Uploaded file notification header',
  },
  disclaimer: {
    id: 'app.upload.notification.disclaimer',
    description: 'Uploaded file notification disclaimer',
  },
});

const requestUpload = (source, filename) => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime();
    makeCall('requestUpload', source, filename, timestamp);
    
    let comp;
    const timeout = setTimeout(() => {
      if (comp) comp.stop();
      reject(408);
    }, UPLOAD.timeout);

    Tracker.autorun(computation => {
      comp = computation;

      const subscription = Meteor.subscribe('upload-request', Auth.credentials, source, filename);
      if (!subscription.ready()) return;

      const {
        meetingId,
        requesterUserId: userId,
      } = Auth.credentials;

      const request = UploadRequest.findOne({
        source,
        meetingId,
        userId,
        filename,
        timestamp,
      });

      if (!request) return;
      clearTimeout(timeout);
      computation.stop();

      if (!request.success) {
        reject(401);
      } else {
        resolve(request.token);
      }
    });
  });
};

const upload = (source, files, intl) => {
  files.forEach(file => {
    requestUpload(source, file.filename).then(token => {
      notify(intl.formatMessage(intlMessages.uploading, ({ 0: file.filename })), 'info', 'upload');
      post(source, file, token, intl);
    }).catch(code => {
      notify(intl.formatMessage(intlMessages[code], ({ 0: file.filename })), 'error', 'upload');
    });
  });
};

const post = (source, file, token, intl) => {
  const {
    meetingId,
    requesterUserId: userId,
  } = Auth.credentials;

  const url = `${UPLOAD.endpoint}/${source}/${token}`;
  
  const data = new FormData();
  data.append('file', file.file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Meeting-ID': meetingId,
      'X-User-ID': userId,
      'X-Filename': file.filename,
    },
  };

  axios.post(url, data, config).then(resp => {
    notify(intl.formatMessage(intlMessages.completed, ({ 0: file.filename })), 'info', 'upload');
  }).catch(error => {
    console.log("Upload error", error.message);
    notify('Upload error' + error.message, 'error', 'upload');
  });
};

const buildDownloadURL = (source, uploadId) => {
  return Auth.authenticateURL(`${DOWNLOAD.endpoint}/${source}/${uploadId}`);
};

const getNotification = ({ source, uploadId, filename }, intl) => {
  const downloadURL = buildDownloadURL(source, uploadId);

  const header = `<b>${intl.formatMessage(intlMessages.header)}:</b>`;
  const link = `<a target="_blank" href="${downloadURL}">${filename}</a>`;
  const disclaimer = `<i>${intl.formatMessage(intlMessages.disclaimer)}</i>`;

  return `${header}<br>${link}<br><br>${disclaimer}`;
};

export default {
  upload,
  buildDownloadURL,
  getNotification,
};
