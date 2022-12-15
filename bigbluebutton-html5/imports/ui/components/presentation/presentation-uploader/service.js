import Presentations from '/imports/api/presentations';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Auth from '/imports/ui/services/auth';
import Poll from '/imports/api/polls/';
import { makeCall } from '/imports/ui/services/api';
import logger from '/imports/startup/client/logger';
import _ from 'lodash';
import { Random } from 'meteor/random'

const CONVERSION_TIMEOUT = 300000;
const TOKEN_TIMEOUT = 5000;

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

const getPresentations = () => Presentations
  .find({
    'conversion.error': false,
  })
  .fetch()
  .map((presentation) => {
    const {
      conversion,
      current,
      downloadable,
      removable,
      id,
      name,
    } = presentation;

    const uploadTimestamp = id.split('-').pop();

    return {
      id,
      filename: name,
      isCurrent: current || false,
      upload: { done: true, error: false },
      isDownloadable: downloadable,
      isRemovable: removable,
      conversion: conversion || { done: true, error: false },
      uploadTimestamp,
    };
  });

const dispatchTogglePresentationDownloadable = (presentation, newState) => {
  makeCall('setPresentationDownloadable', presentation.id, newState);
};

const observePresentationConversion = (
  meetingId,
  temporaryPresentationId,
  onConversion,
) => new Promise((resolve) => {
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
      added: (doc) => {
        if (doc.temporaryPresentationId !== temporaryPresentationId) return;

        if (doc.conversion.status === 'FILE_TOO_LARGE' || doc.conversion.status === 'UNSUPPORTED_DOCUMENT' || doc.conversion.status === 'CONVERSION_TIMEOUT') {
          onConversion(doc.conversion);
          c.stop();
          clearTimeout(conversionTimeout);
        }
      },
      changed: (newDoc) => {
        if (newDoc.temporaryPresentationId !== temporaryPresentationId) return;

        onConversion(newDoc.conversion);

        if (newDoc.conversion.error) {
          c.stop();
          clearTimeout(conversionTimeout);
        }

        if (newDoc.conversion.done) {
          c.stop();
          didValidate(newDoc);
        }
      },
    });
  });
});

const requestPresentationUploadToken = (
  temporaryPresentationId,
  podId,
  meetingId,
  filename,
) => new Promise((resolve, reject) => {
  makeCall('requestPresentationUploadToken', podId, filename, temporaryPresentationId);

  let computation = null;
  const timeout = setTimeout(() => {
    computation.stop();
    reject({ code: 408, message: 'requestPresentationUploadToken timeout' });
  }, TOKEN_TIMEOUT);

  Tracker.autorun((c) => {
    computation = c;
    const sub = Meteor.subscribe('presentation-upload-token', podId, filename, temporaryPresentationId);
    if (!sub.ready()) return;

    const PresentationToken = PresentationUploadToken.findOne({
      podId,
      meetingId,
      temporaryPresentationId,
      used: false,
    });

    if (!PresentationToken || !('failed' in PresentationToken)) return;

    if (!PresentationToken.failed) {
      clearTimeout(timeout);
      resolve(PresentationToken.authzToken);
    }

    if (PresentationToken.failed) {
      reject({ code: 401, message: `requestPresentationUploadToken token ${PresentationToken.authzToken} failed` });
    }
  });
});

const uploadAndConvertPresentation = (
  file,
  downloadable,
  podId,
  meetingId,
  endpoint,
  onUpload,
  onProgress,
  onConversion,
) => {
  const temporaryPresentationId = _.uniqueId(Random.id(20))

  const data = new FormData();
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);
  data.append('temporaryPresentationId', temporaryPresentationId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', podId);

  data.append('is_downloadable', downloadable);

  const opts = {
    method: 'POST',
    body: data,
  };

  return requestPresentationUploadToken(temporaryPresentationId, podId, meetingId, file.name)
    .then((token) => {
      makeCall('setUsedToken', token);
      return futch(endpoint.replace('upload', `${token}/upload`), opts, onProgress);
    })
    .then(() => observePresentationConversion(meetingId, temporaryPresentationId, onConversion))
    // Trap the error so we can have parallel upload
    .catch((error) => {
      logger.debug({
        logCode: 'presentation_uploader_service',
        extraInfo: {
          error,
        },
      }, 'Generic presentation upload exception catcher');
      observePresentationConversion(meetingId, temporaryPresentationId, onConversion);
      onUpload({ error: true, done: true, status: error.code });
      return Promise.resolve();
    });
};

const uploadAndConvertPresentations = (
  presentationsToUpload,
  meetingId,
  podId,
  uploadEndpoint,
) => Promise.all(presentationsToUpload.map((p) => uploadAndConvertPresentation(
  p.file, p.isDownloadable, podId, meetingId, uploadEndpoint,
  p.onUpload, p.onProgress, p.onConversion,
)));

const setPresentation = (presentationId, podId) => {
  makeCall('setPresentation', presentationId, podId);
};

const removePresentation = (presentationId, podId) => {
  const hasPoll = Poll.find({}, { fields: {} }).count();
  if (hasPoll) makeCall('stopPoll');
  makeCall('removePresentation', presentationId, podId);
};

const removePresentations = (
  presentationsToRemove,
  podId,
) => Promise.all(presentationsToRemove.map((p) => removePresentation(p.id, podId)));

const persistPresentationChanges = (oldState, newState, uploadEndpoint, podId) => {
  const presentationsToUpload = newState.filter((p) => !p.upload.done);
  const presentationsToRemove = oldState.filter((p) => !_.find(newState, ['id', p.id]));

  let currentPresentation = newState.find((p) => p.isCurrent);

  return uploadAndConvertPresentations(presentationsToUpload, Auth.meetingID, podId, uploadEndpoint)
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
      if (currentPresentation === undefined) {
        setPresentation('', podId);
        return Promise.resolve();
      }

      // If its a newly uploaded presentation we need to get it from promise result
      if (!currentPresentation.conversion.done) {
        const currentIndex = presentationsToUpload.findIndex((p) => p === currentPresentation);
        currentPresentation = presentations[currentIndex];
      }

      // skip setting as current if error happened
      if (currentPresentation.conversion.error) {
        return Promise.resolve();
      }

      return setPresentation(currentPresentation.id, podId);
    })
    .then(removePresentations.bind(null, presentationsToRemove, podId));
};

export default {
  getPresentations,
  persistPresentationChanges,
  dispatchTogglePresentationDownloadable,
  setPresentation,
};
