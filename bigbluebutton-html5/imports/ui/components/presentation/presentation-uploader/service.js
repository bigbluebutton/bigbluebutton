import { UploadingPresentations } from '/imports/api/presentations';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Auth from '/imports/ui/services/auth';
import { Meteor } from 'meteor/meteor';
import { makeCall } from '/imports/ui/services/api';
import logger from '/imports/startup/client/logger';
import { partition } from '/imports/utils/array-utils';
import update from 'immutability-helper';
import { Random } from 'meteor/random';
import Meetings from '/imports/api/meetings';
import { uniqueId } from '/imports/utils/string-utils';
import { isPresentationEnabled } from '/imports/ui/services/features';
import { notify } from '/imports/ui/services/notification';

const CONVERSION_TIMEOUT = 300000;
const TOKEN_TIMEOUT = 5000;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const POD_ID = 'DEFAULT_PRESENTATION_POD';

// fetch doesn't support progress. So we use xhr which support progress.
const futch = (url, opts = {}, onProgress) => new Promise((res, rej) => {
  const xhr = new XMLHttpRequest();

  xhr.open(opts.method || 'get', url);

  Object.keys(opts.headers || {})
    .forEach((k) => xhr.setRequestHeader(k, opts.headers[k]));

  xhr.onload = (e) => {
    if (e.target.status !== 200) {
      return rej(new Error({ code: e.target.status, message: e.target.statusText }));
    }

    return res(e.target.responseText);
  };
  xhr.onerror = rej;
  if (xhr.upload && onProgress) {
    xhr.upload.addEventListener('progress', onProgress, false);
  }
  xhr.send(opts.body);
});

const requestPresentationUploadToken = (
  temporaryPresentationId,
  meetingId,
  filename,
) => new Promise((resolve, reject) => {
  makeCall('requestPresentationUploadToken', POD_ID, filename, temporaryPresentationId);

  let computation = null;
  const timeout = setTimeout(() => {
    computation.stop();
    reject(new Error({ code: 408, message: 'requestPresentationUploadToken timeout' }));
  }, TOKEN_TIMEOUT);

  Tracker.autorun((c) => {
    computation = c;
    const sub = Meteor.subscribe('presentation-upload-token', POD_ID, filename, temporaryPresentationId);
    if (!sub.ready()) return;

    const PresentationToken = PresentationUploadToken.findOne({
      podId: POD_ID,
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
      reject(new Error({ code: 401, message: `requestPresentationUploadToken token ${PresentationToken.authzToken} failed` }));
    }
  });
});

const uploadAndConvertPresentation = (
  file,
  downloadable,
  meetingId,
  endpoint,
  onUpload,
  onProgress,
  onConversion,
  current,
) => {
  if (!file) return Promise.resolve();

  const temporaryPresentationId = uniqueId(Random.id(20));

  const data = new FormData();
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);
  data.append('temporaryPresentationId', temporaryPresentationId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', POD_ID);

  data.append('is_downloadable', downloadable);
  data.append('current', current);

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
      temporaryPresentationId,
      progress: 0,
      filename: file.name,
      lastModifiedUploader: true,
      upload: {
        done: false,
        error: false,
      },
      uploadTimestamp: new Date(),
    },
  });

  return requestPresentationUploadToken(temporaryPresentationId, meetingId, file.name)
    .then((token) => {
      makeCall('setUsedToken', token);
      UploadingPresentations.upsert({
        temporaryPresentationId,
      }, {
        $set: {
          id: token,
        },
      });
      return futch(endpoint.replace('upload', `${token}/upload`), opts, (e) => {
        onProgress(e);
        const pr = (e.loaded / e.total) * 100;
        if (pr !== 100) {
          UploadingPresentations.upsert({ temporaryPresentationId }, { $set: { progress: pr } });
        } else {
          UploadingPresentations.upsert({ temporaryPresentationId }, {
            $set: {
              progress: pr,
              upload: {
                done: true,
                error: false,
              },
            },
          });
        }
      });
    })
    // Trap the error so we can have parallel upload
    .catch((error) => {
      logger.debug({
        logCode: 'presentation_uploader_service',
        extraInfo: {
          error,
        },
      }, 'Generic presentation upload exception catcher');
      onUpload({ error: true, done: true, status: error.code });
      return Promise.resolve();
    });
};

const uploadAndConvertPresentations = (
  presentationsToUpload,
  meetingId,
  uploadEndpoint,
) => Promise.all(presentationsToUpload.map((p) => uploadAndConvertPresentation(
  p.file, p.downloadable, meetingId, uploadEndpoint,
  p.onUpload, p.onProgress, p.onConversion, p.current,
)));

const removePresentations = (
  presentationsToRemove,
  removePresentation,
) => Promise.all(presentationsToRemove.map((p) => removePresentation(p.presentationId)));

const persistPresentationChanges = (
  oldState,
  newState,
  uploadEndpoint,
  setPresentation,
  removePresentation,
) => {
  const presentationsToUpload = newState.filter((p) => !p.uploadCompleted);
  const presentationsToRemove = oldState.filter((p) => !newState.find((u) => { return u.presentationId === p.presentationId }));

  let currentPresentation = newState.find((p) => p.current);
  return uploadAndConvertPresentations(presentationsToUpload, Auth.meetingID, uploadEndpoint)
    .then((presentations) => {
      if (!presentations.length && !currentPresentation) return Promise.resolve();

      // Update the presentation with their new ids
      presentations.forEach((p, i) => {
        if (p === undefined) return;
        presentationsToUpload[i].onDone(p.presentationId);
      });

      return Promise.resolve(presentations);
    })
    .then((presentations) => {
      if (currentPresentation === undefined) {
        setPresentation('');
        return Promise.resolve();
      }

      // If its a newly uploaded presentation we need to get it from promise result
      if (currentPresentation?.uploadInProgress) {
        const currentIndex = presentationsToUpload.findIndex((p) => p === currentPresentation);
        currentPresentation = presentations[currentIndex];
      }

      // skip setting as current if error happened
      if (currentPresentation?.conversion?.error) {
        return Promise.resolve();
      }

      return setPresentation(currentPresentation?.presentationId);
    })
    .then(removePresentations.bind(null, presentationsToRemove, removePresentation));
};

const handleSavePresentation = (
  presentations = [],
  isFromPresentationUploaderInterface = true,
  newPres = {},
  currentPresentations = [],
  setPresentation,
  removePresentation,
) => {
  if (!isPresentationEnabled()) {
    return null;
  }

  if (!isFromPresentationUploaderInterface) {
    if (presentations.length === 0) {
      presentations = [...currentPresentations];
    }
    presentations = presentations.map((p) => update(p, {
      current: {
        $set: false,
      },
    }));
    newPres.current = true;
    presentations.push(newPres);
  }
  return persistPresentationChanges(
    currentPresentations,
    presentations,
    PRESENTATION_CONFIG.uploadEndpoint,
    setPresentation,
    removePresentation,
  );
};

const getExternalUploadData = () => {
  const { meetingProp } = Meetings.findOne(
    { meetingId: Auth.meetingID },
    {
      fields: {
        'meetingProp.presentationUploadExternalDescription': 1,
        'meetingProp.presentationUploadExternalUrl': 1,
      },
    },
  );

  const { presentationUploadExternalDescription, presentationUploadExternalUrl } = meetingProp;

  return {
    presentationUploadExternalDescription,
    presentationUploadExternalUrl,
  };
};

function handleFiledrop(files, files2, that, intl, intlMessages) {
  if (that) {
    const { fileValidMimeTypes } = that.props;
    const { toUploadCount } = that.state;
    const validMimes = fileValidMimeTypes.map((fileValid) => fileValid.mime);
    const validExtentions = fileValidMimeTypes.map((fileValid) => fileValid.extension);
    const [accepted, rejected] = partition(
      files.concat(files2), (f) => (
        validMimes.includes(f.type) || validExtentions.includes(`.${f.name.split('.').pop()}`)
      ),
    );

    const presentationsToUpload = accepted.map((file) => {
      const id = uniqueId(file.name);

      return {
        file,
        downloadable: false, // by default new presentations are set not to be downloadable
        isRemovable: true,
        presentationId: id,
        name: file.name,
        current: false,
        conversion: { done: false, error: false },
        upload: { done: false, error: false, progress: 0 },
        exportation: { error: false },
        onProgress: (event) => {
          if (!event.lengthComputable) {
            that.deepMergeUpdateFileKey(id, 'upload', {
              progress: 100,
              done: true,
            });

            return;
          }

          that.deepMergeUpdateFileKey(id, 'upload', {
            progress: (event.loaded / event.total) * 100,
            done: event.loaded === event.total,
          });
        },
        onConversion: (conversion) => {
          that.deepMergeUpdateFileKey(id, 'conversion', conversion);
        },
        onUpload: (upload) => {
          that.deepMergeUpdateFileKey(id, 'upload', upload);
        },
        onDone: (newId) => {
          that.updateFileKey(id, 'id', newId);
        },
      };
    });

    that.setState(({ presentations }) => ({
      presentations: presentations.concat(presentationsToUpload),
      toUploadCount: (toUploadCount + presentationsToUpload.length),
    }), () => {
      // after the state is set (files have been dropped),
      // make the first of the new presentations current
      if (presentationsToUpload && presentationsToUpload.length) {
        that.handleCurrentChange(presentationsToUpload[0].presentationId);
      }
    });

    if (rejected.length > 0) {
      notify(intl.formatMessage(intlMessages.rejectedError), 'error');
    }
  }
}

export default {
  handleSavePresentation,
  persistPresentationChanges,
  requestPresentationUploadToken,
  getExternalUploadData,
  uploadAndConvertPresentation,
  handleFiledrop,
};
