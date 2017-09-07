import Presentations from '/imports/api/2.0/presentations';
import Auth from '/imports/ui/services/auth';
import { call } from '/imports/ui/services/api';

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

const getPresentations = () =>
  Presentations
    .find()
    .fetch()
    .map(presentation => ({
      id: presentation.id,
      filename: presentation.name,
      isCurrent: presentation.current,
      upload: { done: true, error: false },
      conversion: presentation.conversion || { done: true, error: false },
    }));

const uploadPresentation = (file, meetingID, endpoint, onError, onProgress) => {
  const data = new FormData();
  data.append('presentation_name', file.filename);
  data.append('fileUpload', file);
  data.append('conference', meetingID);
  data.append('room', meetingID);

  const opts = {
    method: 'POST',
    body: data,
  };

  return futch(endpoint, opts, onProgress).catch(onError);
};

const uploadPresentations = (presentationsToUpload, meetingID, uploadEndpoint) =>
  Promise.all(
    presentationsToUpload
      .map(p => uploadPresentation(p.file, meetingID, uploadEndpoint, p.onError, p.onProgress)),
  );

const removePresentation = presentationID => call('removePresentation', presentationID);

const removePresentations = presentationsToRemove =>
  Promise.all(presentationsToRemove.map(p => removePresentation(p.id)));

const persistPresentationChanges = (oldState, newState, uploadEndpoint) => {
  const presentationsToUpload = newState.filter(_ => !oldState.includes(_));
  const presentationsToRemove = oldState.filter(_ => !newState.includes(_));
  const currentPresentation = newState.find(_ => _.isCurrent);

  return new Promise((resolve, reject) =>
    removePresentations(presentationsToRemove)
      .then(uploadPresentations.bind(null, presentationsToUpload, Auth.meetingID, uploadEndpoint))
      .then(call.bind(null, 'sharePresentation', currentPresentation.id, true))
      .then(resolve)
      .catch(reject),
  );
};

export default {
  getPresentations,
  persistPresentationChanges,
};
