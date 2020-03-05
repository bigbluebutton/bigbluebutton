import { defineMessages, injectIntl } from 'react-intl';
import axios from 'axios';
import Upload from '/imports/api/upload';
import Auth from '/imports/ui/services/auth';
import { notify } from '/imports/ui/services/notification';
import { makeCall } from '/imports/ui/services/api';

const UPLOAD = Meteor.settings.public.upload;

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

      const subscription = Meteor.subscribe('upload', Auth.credentials, source, filename);
      if (!subscription.ready()) return;

      const {
        meetingId,
        requesterUserId: userId,
      } = Auth.credentials;

      const request = Upload.findOne({
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

  const url = `${UPLOAD.endpoint}/${token}`;

  const data = new FormData();
  data.append('file', file.file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Meeting-ID': meetingId,
      'X-User-ID': userId,
      'X-Source': source,
      'X-Filename': file.filename,
    },
  };

  axios.post(url, data, config).then(resp => {
    notify(intl.formatMessage(intlMessages.completed, ({ 0: file.filename })), 'info', 'upload');
  }).catch(err => {
    console.log(err);
  });
};



/*

  const data = new FormData();
  data.append('presentation_name', file.name);
  data.append('Filename', file.name);
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', podId);

  data.append('is_downloadable', downloadable);

  const opts = {
    method: 'POST',
    body: data,
  };

  return requestPresentationUploadToken(podId, meetingId, file.name)
    .then((token) => {
      makeCall('setUsedToken', token);
      return futch(endpoint.replace('upload', `${token}/upload`), opts, onProgress);
    })
    .then(() => observePresentationConversion(meetingId, file.name, onConversion))
    // Trap the error so we can have parallel upload
    .catch((error) => {
      console.error(error);
      onUpload({ error: true, done: true, status: error.code });
      return Promise.resolve();
    });
};



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

const upload = (files, endpoint) => {
  const presentationsToUpload = newState.filter(p => !p.upload.done);
  const presentationsToRemove = oldState.filter(p => !_.find(newState, ['id', p.id]));

  let currentPresentation = newState.find(p => p.isCurrent);

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
        return Promise.resolve();
      }

      // If its a newly uploaded presentation we need to get it from promise result
      if (!currentPresentation.conversion.done) {
        const currentIndex = presentationsToUpload.findIndex(p => p === currentPresentation);
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
*/




export default {
  requestUpload,
  upload,
};




/*
import Presentations from '/imports/api/presentations';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Poll from '/imports/api/polls/';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';

const requestPresentationUploadToken = (
  podId,
  meetingId,
  filename,
) => new Promise((resolve, reject) => {
  makeCall('requestPresentationUploadToken', podId, filename);

  let computation = null;
  const timeout = setTimeout(() => {
    computation.stop();
    reject({ code: 408, message: 'requestPresentationUploadToken timeout' });
  }, TOKEN_TIMEOUT);

  Tracker.autorun((c) => {
    computation = c;
    const sub = Meteor.subscribe('presentation-upload-token', Auth.credentials, podId, filename);
    if (!sub.ready()) return;

    const PresentationToken = PresentationUploadToken.findOne({
      podId,
      meetingId,
      filename,
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
  const data = new FormData();
  data.append('presentation_name', file.name);
  data.append('Filename', file.name);
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', podId);

  data.append('is_downloadable', downloadable);

  const opts = {
    method: 'POST',
    body: data,
  };

  return requestPresentationUploadToken(podId, meetingId, file.name)
    .then((token) => {
      makeCall('setUsedToken', token);
      return futch(endpoint.replace('upload', `${token}/upload`), opts, onProgress);
    })
    .then(() => observePresentationConversion(meetingId, file.name, onConversion))
    // Trap the error so we can have parallel upload
    .catch((error) => {
      console.error(error);
      onUpload({ error: true, done: true, status: error.code });
      return Promise.resolve();
    });
};

const uploadAndConvertPresentations = (
  presentationsToUpload,
  meetingId,
  podId,
  uploadEndpoint,
) => Promise.all(presentationsToUpload.map(p => uploadAndConvertPresentation(
  p.file, p.isDownloadable, podId, meetingId, uploadEndpoint,
  p.onUpload, p.onProgress, p.onConversion,
)));

const setPresentation = (presentationId, podId) => makeCall('setPresentation', presentationId, podId);

const removePresentation = (presentationId, podId) => {
  const hasPoll = Poll.find({}, { fields: {} }).count();
  if (hasPoll) makeCall('stopPoll');
  makeCall('removePresentation', presentationId, podId);
};

const removePresentations = (
  presentationsToRemove,
  podId,
) => Promise.all(presentationsToRemove.map(p => removePresentation(p.id, podId)));

const persistPresentationChanges = (oldState, newState, uploadEndpoint, podId) => {
  const presentationsToUpload = newState.filter(p => !p.upload.done);
  const presentationsToRemove = oldState.filter(p => !_.find(newState, ['id', p.id]));

  let currentPresentation = newState.find(p => p.isCurrent);

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
        return Promise.resolve();
      }

      // If its a newly uploaded presentation we need to get it from promise result
      if (!currentPresentation.conversion.done) {
        const currentIndex = presentationsToUpload.findIndex(p => p === currentPresentation);
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
};
*/
