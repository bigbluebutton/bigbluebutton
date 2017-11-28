import Presentations from '/imports/api/presentations';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';

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
    .find({
      'conversion.error': false,
    })
    .fetch()
    .map(presentation => ({
      id: presentation.id,
      filename: presentation.name,
      isCurrent: presentation.current || false,
      upload: { done: true, error: false },
      conversion: presentation.conversion || { done: true, error: false },
    }));

const observePresentationConversion = (meetingId, filename, onConversion) =>
  new Promise((resolve) => {
    const conversionTimeout = setTimeout(() => {
      onConversion({
        done: true,
        error: true,
        status: 'TIMEOUT',
      });
    }, CONVERSION_TIMEOUT);

    const didValidate = (doc) => {
      clearTimeout(conversionTimeout);
      resolve(doc);
    };

    Tracker.autorun((c) => {
      const query = Presentations.find({ meetingId });

      query.observe({
        changed: (newDoc) => {
          if (newDoc.name !== filename) return;

          onConversion(newDoc.conversion);

          if (newDoc.conversion.done) {
            c.stop();
            didValidate(newDoc);
          }
        },
      });
    });
  });

const uploadAndConvertPresentation = (file, meetingID, endpoint, onUpload, onProgress, onConversion) => {
  const data = new FormData();
  data.append('presentation_name', file.name);
  data.append('Filename', file.name);
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
    .then(() => observePresentationConversion(meetingID, file.name, onConversion))
    // Trap the error so we can have parallel upload
    .catch((error) => {
      onUpload({ error: true, done: true, status: error.code });
      return Promise.resolve();
    });
};

const uploadAndConvertPresentations = (presentationsToUpload, meetingID, uploadEndpoint) =>
  Promise.all(presentationsToUpload.map(p =>
    uploadAndConvertPresentation(p.file, meetingID, uploadEndpoint, p.onUpload, p.onProgress, p.onConversion)));

const setPresentation = presentationID => makeCall('setPresentation', presentationID);

const removePresentation = presentationID => makeCall('removePresentation', presentationID);

const removePresentations = presentationsToRemove =>
  Promise.all(presentationsToRemove.map(p => removePresentation(p.id)));

const persistPresentationChanges = (oldState, newState, uploadEndpoint) => {
  const presentationsToUpload = newState.filter(p => !p.upload.done);
  const presentationsToRemove = oldState.filter(p => !_.find(newState, ['id', p.id]));

  let currentPresentation = newState.find(p => p.isCurrent);

  return uploadAndConvertPresentations(presentationsToUpload, Auth.meetingID, uploadEndpoint)
    .then((presentations) => {
      if (!presentations.length && !currentPresentation) return Promise.resolve();

      // Update the presentation with their new ids
      presentations.forEach((p, i) => {
        if (p === undefined) return;
        presentationsToUpload[i].onDone(p.id);
      });

      return Promise.resolve(presentations);
    })
    .then((presentations) => {
      // If its a newly uploaded presentation we need to get it from promise result
      if (!currentPresentation.conversion.done) {
        const currentIndex = presentationsToUpload.findIndex(p => p === currentPresentation);
        currentPresentation = presentations[currentIndex];
      }

      // skip setting as current if error happened
      if (currentPresentation === undefined || currentPresentation.conversion.error) {
        return Promise.resolve();
      }

      return setPresentation(currentPresentation.id);
    })
    .then(removePresentations.bind(null, presentationsToRemove));
};

export default {
  getPresentations,
  persistPresentationChanges,
};
