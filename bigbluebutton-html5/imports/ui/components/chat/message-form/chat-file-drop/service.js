import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';

// fetch doesn't support progress. So we use xhr which support progress.
const futch = (url, opts = {}, onProgress) => new Promise((res, rej) => {
  const xhr = new XMLHttpRequest();

  xhr.open(opts.method || 'get', url);

  Object.keys(opts.headers || {})
    .forEach(k => xhr.setRequestHeader(k, opts.headers[k]));

  xhr.onload = (e) => {
    if (e.target.status !== 200) {
      return rej({ code: e.target.status, message: e.target.statusText });
    }

    return res(e.target.responseText);
  };
  xhr.onerror = rej;
  if (xhr.upload && onProgress) {
    xhr.upload.addEventListener('progress', onProgress, false);
  }
  xhr.send(opts.body);
});

const uploadFile = (
  file,
  meetingId,
  endpoint,
  onProgress,
) => {
  const data = new FormData();

  data.append('fileUpload', file);
  data.append('conference', meetingId);


  const opts = {
    method: 'POST',
    body: data,
  };

  // TODO: read the end point form settings.yml
  const response = futch(endpoint, opts, onProgress);
  return response;
};

const uploadChatFile = (
  fileToUpload,
  meetingId,
  uploadEndpoint,
) => Promise.resolve(uploadFile(
  fileToUpload.file, meetingId, uploadEndpoint, fileToUpload.onProgress,
));


const persistChatfile = (file, uploadEndpoint) => {
  const chatFileToUpload = (!file.upload.done) ? file : null;

  return uploadChatFile(chatFileToUpload, Auth.meetingID, uploadEndpoint)
    .then((fileData) => {
      
      const uploadResponse = JSON.parse(fileData);
      if (uploadResponse.success == "true") {
        file.onUpload({ done: true });
        return Promise.resolve(uploadResponse);
      }

      file.onUpload({ error: true, done: true });
      return Promise.reject('something went wrong');
    })
    .catch((error) => {
      file.onUpload({ error: true, done: true });
      return Promise.reject('something went wrong');
    });
};

export default {
  persistChatfile,
};
