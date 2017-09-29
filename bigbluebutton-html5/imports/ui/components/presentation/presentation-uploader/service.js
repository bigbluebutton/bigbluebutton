import Presentations from '/imports/api/2.0/presentations';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const CONVERSION_TIMEOUT = 300000;

// fetch doens't support progress. So we use xhr which support progress.
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
      isCurrent: presentation.current || false,
      upload: { done: true, error: false },
      conversion: presentation.conversion || { done: true, error: false },
    }));

const observePresentationConversion = (meetingId, filename) => new Promise((resolve, reject) => {
  const conversionTimeout = setTimeout(() => {
    reject({
      filename,
      message: 'Conversion timeout.',
    });
  }, CONVERSION_TIMEOUT);

  const didValidate = () => {
    clearTimeout(conversionTimeout);
    resolve(filename);
  };

  Tracker.autorun((c) => {
    const query = Presentations.find({ meetingId, filename });

    query.observeChanges({
      changed: (id, fields) => {
        if (fields.conversion.done) {
          c.stop();
          didValidate();
        }
      },
    });
  });
});

const uploadPresentation = (file, meetingID, endpoint, onError, onProgress) => {
  const data = new FormData();
  data.append('presentation_name', file.filename);
  data.append('Filename', file.filename);
  data.append('fileUpload', file);
  data.append('conference', meetingID);
  data.append('room', meetingID);
  // TODO: Theres no way to set a presentation as downloadable.
  data.append('is_downloadable', false);

  const opts = {
    method: 'POST',
    body: data,
  };

  return futch(endpoint, opts, onProgress)
    .then(observePresentationConversion.bind(null, meetingID, file.filename))
    // Trap the error so we can have parallel upload
    .catch((error) => {
      onError(error);
      return observePresentationConversion(meetingID, file.filename);
    });
};

const uploadPresentations = (presentationsToUpload, meetingID, uploadEndpoint) =>
  Promise.all(
    presentationsToUpload
      .map(p => uploadPresentation(p.file, meetingID, uploadEndpoint, p.onError, p.onProgress)),
  );

const removePresentation = presentationID => makeCall('removePresentation', presentationID);

const removePresentations = presentationsToRemove =>
  Promise.all(presentationsToRemove.map(p => removePresentation(p.id)));

const persistPresentationChanges = (oldState, newState, uploadEndpoint) => {
  const presentationsToUpload = newState.filter(_ => !oldState.includes(_));
  const presentationsToRemove = oldState.filter(_ => !newState.includes(_));
  const currentPresentation = newState.find(_ => _.isCurrent);

  return new Promise((resolve, reject) =>
    uploadPresentations(presentationsToUpload, Auth.meetingID, uploadEndpoint)
      .then(makeCall.bind(null, 'setPresentation', currentPresentation.id))
      .then(removePresentations.bind(null, presentationsToRemove))
      .then(resolve)
      .catch(reject),
  );
};

export default {
  getPresentations,
  persistPresentationChanges,
};
