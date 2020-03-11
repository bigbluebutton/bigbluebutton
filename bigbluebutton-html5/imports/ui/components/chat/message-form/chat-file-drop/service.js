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
  podId,
  meetingId,
  endpoint,
  onProgress,
) => {
  const data = new FormData();
  data.append('presentation_name', file.name);
  data.append('Filename', file.name);
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', podId);


  const opts = {
    method: 'POST',
    body: data,
  };
//   return futch(endpoint, opts, onProgress);
const fileData = {
  fileId: "DEMO FILE ID",
  fileName: file.name,
  success: true,
}

return new Promise((res, rej) => {
  res(fileData)
});

};

const uploadChatFiles = (
  p,
  meetingId,
  podId,
  uploadEndpoint,
) => Promise.resolve(uploadFile(
  p.file, p.isDownloadable, podId, meetingId, uploadEndpoint,
  p.onUpload, p.onProgress,
));

const removePresentation = (presentationId, podId) => {
  makeCall('removePresentation', presentationId, podId);
};

const removePresentations = (
  presentationsToRemove,
  podId,
) => Promise.all(presentationsToRemove.map(p => removePresentation(p.id, podId)));

const persistChatFileChanges = (file, uploadEndpoint, podId) => {
  const chatFileToUpload = (!file.upload.done) ? file : null;

  return uploadChatFiles(chatFileToUpload, Auth.meetingID, podId, uploadEndpoint)
    .then((fileData) => {
      console.log(fileData);
      
      if(fileData.success){
        file.onUpload({done: true});
        return Promise.resolve(fileData);
      } 
      else {
        file.onUpload({ error: true, done: true});
        return Promise.reject("something went wrong");
      }
    })
    .catch((error) => {
      console.error(error);
      file.onUpload({ error: true, done: true});
      return Promise.reject("something went wrong");
    })
};

export default {
  persistChatFileChanges,
};
