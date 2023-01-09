import Presentations from '/imports/api/presentations';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Auth from '/imports/ui/services/auth';
import Poll from '/imports/api/polls/';
import { Meteor } from 'meteor/meteor';
import { makeCall } from '/imports/ui/services/api';
import logger from '/imports/startup/client/logger';
import _ from 'lodash';
import update from 'immutability-helper';
import { Random } from 'meteor/random';
import { UploadingPresentations } from '/imports/api/presentations';
import Meetings from '/imports/api/meetings';

const CONVERSION_TIMEOUT = 300000;
const TOKEN_TIMEOUT = 5000;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

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
  .find()
  .fetch()
  .map((presentation) => {
    const {
      conversion,
      current,
      downloadable,
      removable,
      renderedInToast,
      temporaryPresentationId,
      id,
      name,
      exportation,
    } = presentation;

    const uploadTimestamp = id.split('-').pop();

    return {
      id,
      filename: name,
      renderedInToast,
      temporaryPresentationId,
      isCurrent: current || false,
      isDownloadable: downloadable,
      isRemovable: removable,
      conversion: conversion || { done: true, error: false },
      uploadTimestamp,
      exportation: exportation || { error: false },
    };
  });

const dispatchTogglePresentationDownloadable = (presentation, newState) => {
  makeCall('setPresentationDownloadable', presentation.id, newState);
};

const observePresentationConversion = (
  meetingId,
  temporaryPresentationId,
) => new Promise((resolve) => {
  // The token is placed as an id before the original one is generated
  // in the back-end.
  const tokenId = PresentationUploadToken.findOne({ temporaryPresentationId })?.authzToken;

  const didValidate = (doc) => {
    resolve(doc);
  };

  Tracker.autorun((c) => {
    const query = Presentations.find({ meetingId });

    query.observe({
      added: (doc) => {
        if (doc.temporaryPresentationId !== temporaryPresentationId && doc.id !== tokenId) return;

        if (
          doc.conversion.status === 'FILE_TOO_LARGE' ||
          doc.conversion.status === 'UNSUPPORTED_DOCUMENT' ||
          doc.conversion.status === 'CONVERSION_TIMEOUT' ||
          doc.conversion.status === 'IVALID_MIME_TYPE'
        ) {
          Presentations.update(
            { id: tokenId },
            { $set: { temporaryPresentationId, renderedInToast: false } },
          );
          c.stop();
        }
      },
      changed: (newDoc) => {
        if (newDoc.temporaryPresentationId !== temporaryPresentationId) return;

        if (newDoc.conversion.error) {
          c.stop();
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

const uploadAndConvertPresentation = async (
  presentation,
  podId,
  meetingId,
  endpoint,
) => {
  const temporaryPresentationId = _.uniqueId(Random.id(20));
  const {
    file,
    isDownloadable,
    isRemovable,
    isCurrent,
    id,
    onUpload,
  } = presentation;

  const data = new FormData();
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);
  data.append('temporaryPresentationId', temporaryPresentationId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', podId);

  data.append('is_downloadable', isDownloadable);

  const opts = {
    method: 'POST',
    body: data,
  };

  // If the presentation is from sharedNotes I don't want to
  // insert another one, I just need to update it.
  UploadingPresentations.upsert({
    filename: file.name,
    lastModifiedUploader: false,
  }, {
    $set: {
      id,
      temporaryPresentationId,
      progress: 0,
      filename: file.name,
      lastModifiedUploader: true,
      isDownloadable,
      isRemovable,
      isCurrent,
      upload: {
        done: false,
        error: false,
      },
      uploadTimestamp: new Date(),
    },
  });

  return requestPresentationUploadToken(temporaryPresentationId, podId, meetingId, file.name)
    .then((token) => {
      makeCall('setUsedToken', token);
      UploadingPresentations.upsert(
        { temporaryPresentationId },
        { $set: { id: token },
      });
      return futch(endpoint.replace('upload', `${token}/upload`), opts, (e) => {
        let modifier;

        if (!e.lengthComputable) {
          modifier = {
            $set: {
              progress: 100,
              upload: { done: true, error: false },
            },
          };
        } else {
          modifier = {
            $set: {
              progress: (e.loaded / e.total) * 100,
              upload: { done: e.loaded === e.total },
            },
          }
        }

        if (typeof onUpload === 'function') onUpload(modifier);

        UploadingPresentations.upsert(
          { temporaryPresentationId },
          modifier,
        );
      });
    })
    .then(() => observePresentationConversion(meetingId, temporaryPresentationId))
    // Trap the error so we can have parallel upload.
    .catch((error) => {
      logger.debug({
        logCode: 'presentation_uploader_service',
        extraInfo: {
          error,
        },
      }, 'Generic presentation upload exception catcher');
      observePresentationConversion(meetingId, temporaryPresentationId);
      UploadingPresentations.upsert(
        { temporaryPresentationId },
        {
          $set: {
            upload: { error: true, done: true, status: error.code },
          },
        },
      );
      return Promise.resolve();
    });
};

const uploadAndConvertPresentations = (
  presentationsToUpload,
  meetingId,
  podId,
  uploadEndpoint,
) => Promise.all(presentationsToUpload.map((p) => uploadAndConvertPresentation(
  p, podId, meetingId, uploadEndpoint,
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

const handleSavePresentation = (
  presentations = [],
  isFromPresentationUploaderInterface = true,
  newPres = {},
) => {
  const currentPresentations = getPresentations();

  if (!isFromPresentationUploaderInterface) {
    if (presentations.length === 0) {
      presentations = [...currentPresentations];
    }
    presentations = presentations.map(p => update(p, { isCurrent: { $set: false } }));
    newPres.isCurrent = true;
    presentations.push(newPres);
  }

  return persistPresentationChanges(
    currentPresentations,
    presentations,
    PRESENTATION_CONFIG.uploadEndpoint,
    'DEFAULT_PRESENTATION_POD',
  );
}

const sendBulkPresentations = (
  presentationsToUpload,
  presentationsToRemove,
  selectedCurrentId,
) => {
  const POD_ID = 'DEFAULT_PRESENTATION_POD';
  const currentToUpload = presentationsToUpload.find((p) => p.id === selectedCurrentId);
  let uploadStatus;

  if (currentToUpload) {
    currentToUpload.isCurrent = true;
    currentToUpload.onUpload = (status) => {
      uploadStatus = status;
    };
  }

  return uploadAndConvertPresentations(
    presentationsToUpload,
    Auth.meetingID,
    POD_ID,
    PRESENTATION_CONFIG.uploadEndpoint,
  ).then((uploadedPresentations) => {
    if (!uploadedPresentations.length && !currentToUpload) return Promise.resolve();

    return Promise.resolve(uploadedPresentations);
  }).then((uploadedPresentations) => {
    if (selectedCurrentId === undefined) {
      setPresentation('', POD_ID);
      return Promise.resolve();
    }

    let currentId = selectedCurrentId;

    if (currentToUpload) {
      const currentIndex = presentationsToUpload.findIndex((p) => p === currentToUpload);
      const uploadedPresentation = uploadedPresentations[currentIndex];

      if (uploadedPresentation.conversion.error || uploadStatus?.upload?.error) {
        currentId = Session.get('selectedToBeNextCurrent');
      } else {
        currentId = uploadedPresentation.id;
      } 
    } else {
      currentId = selectedCurrentId;
    }

    return setPresentation(currentId, POD_ID);
  }).then(removePresentations.bind(null, presentationsToRemove, POD_ID));
};

const getExternalUploadData = () => {
  const { meetingProp } = Meetings.findOne(
    { meetingId: Auth.meetingID },
    {
      fields: {
        'meetingProp.presentationUploadExternalDescription': 1,
        'meetingProp.presentationUploadExternalUrl': 1
      },
    },
  );

  const { presentationUploadExternalDescription, presentationUploadExternalUrl } = meetingProp;

  return {
    presentationUploadExternalDescription,
    presentationUploadExternalUrl,
  }
};

const exportPresentationToChat = (presentationId, observer) => {
  let lastStatus = {};

  Tracker.autorun((c) => {
    const cursor = Presentations.find({ id: presentationId });

    const checkStatus = (exportation) => {
      const shouldStop = lastStatus.status === 'PROCESSING' && exportation.status === 'EXPORTED';

      if (shouldStop) {
        observer(exportation, true);
        return c.stop();
      }

      observer(exportation, false);
      lastStatus = exportation;
    };

    cursor.observe({
      added: (doc) => {
        checkStatus(doc.exportation);
      },
      changed: (doc) => {
        checkStatus(doc.exportation);
      },
    });
  });

  makeCall('exportPresentationToChat', presentationId);
};

const getUploadingPresentations = () => UploadingPresentations.find().fetch();

const clearErrors = () => {
  UploadingPresentations.remove({ 'upload.error': true });
  return makeCall('clearErrors', 'DEFAULT_PRESENTATION_POD');
};

export default {
  handleSavePresentation,
  getPresentations,
  persistPresentationChanges,
  dispatchTogglePresentationDownloadable,
  setPresentation,
  requestPresentationUploadToken,
  getExternalUploadData,
  exportPresentationToChat,
  uploadAndConvertPresentation,
  getUploadingPresentations,
  sendBulkPresentations,
  clearErrors,
};
