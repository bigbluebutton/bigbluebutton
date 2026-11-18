import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { partition } from '/imports/utils/array-utils';
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';
import { uniqueId } from '/imports/utils/string-utils';
import { notify } from '/imports/ui/services/notification';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import getSizeWithUnit from '/imports/utils/getSizeWithUnit';
import { getPresentationUploadToken } from './queries';
import { requestPresentationUploadTokenMutation } from './mutation';
import { PRESENTATION_REMOVE } from '/imports/ui/components/presentation/mutations';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const TOKEN_TIMEOUT = 5000;
// After giving up on a token, how often and for how long to look for the presentation its
// request may still create.
const LATE_TOKEN_POLL_INTERVAL = 5000;
const LATE_TOKEN_WATCH_TIME = 120000;
const POD_ID = 'DEFAULT_PRESENTATION_POD';

// fetch doesn't support progress. So we use xhr which support progress.
const futch = (url, opts = {}, onProgress) => new Promise((res, rej) => {
  const xhr = new XMLHttpRequest();

  xhr.open(opts.method || 'get', url);

  Object.keys(opts.headers || {})
    .forEach((k) => xhr.setRequestHeader(k, opts.headers[k]));

  xhr.onload = (e) => {
    if (e.target.status !== 200) {
      return rej(Object.assign(
        new Error(e.target.statusText || `HTTP ${e.target.status}`),
        { code: e.target.status },
      ));
    }

    return res(e.target.responseText);
  };
  xhr.onerror = rej;
  if (xhr.upload && onProgress) {
    xhr.upload.addEventListener('progress', onProgress, false);
  }
  xhr.send(opts.body);
});

// The presentation exists on the server from the moment its upload token is issued. When the
// upload itself then fails (refused by the server, or the connection dropped), nothing marks
// that presentation as failed, so every presenter would see it as uploading until the meeting
// ends. Remove it instead; the caller tells the presenter the upload failed.
const removeFailedUpload = (presentationId) => {
  if (!presentationId) return Promise.resolve(false);
  return apolloContextHolder.getClient().mutate({
    mutation: PRESENTATION_REMOVE,
    variables: { presentationId },
  }).then(() => true).catch((error) => {
    logger.warn({
      logCode: 'presentation_uploader_remove_failed_upload_error',
      extraInfo: { presentationId, errorMessage: error?.message },
    }, 'Could not remove the presentation of a failed upload');
    return false;
  });
};

// Resolves with the upload token and the id of the presentation the server created for it.
const requestPresentationUpload = (
  temporaryPresentationId,
  meetingId,
  filename,
) => new Promise((resolve, reject) => {
  const client = apolloContextHolder.getClient();
  client.mutate({
    mutation: requestPresentationUploadTokenMutation,
    variables: {
      podId: POD_ID,
      filename,
      uploadTemporaryId: temporaryPresentationId,
    },
  });

  let gaveUpAt = null;
  const timeout = setTimeout(() => {
    gaveUpAt = Date.now();
    reject(Object.assign(new Error('requestPresentationUploadToken timeout'), { code: 408 }));
  }, TOKEN_TIMEOUT);

  const getData = (n = 0) => {
    // A request that was only delayed (the connection dropped for a moment) still reaches the
    // server after this client gave up on it, and creates a presentation nobody will upload.
    // Keep looking for it for a while, so it can be removed.
    if (gaveUpAt ? Date.now() - gaveUpAt > LATE_TOKEN_WATCH_TIME : n > 10) return;
    let recursiveTimeout = null;
    client.query({
      query: getPresentationUploadToken,
      variables: {
        uploadTemporaryId: temporaryPresentationId,
      },
      fetchPolicy: 'network-only',
    }).then((result) => {
      if (result.data.pres_presentation_uploadToken.length > 0) {
        clearTimeout(recursiveTimeout);
        clearTimeout(timeout);
        const { uploadToken, presentationId } = result.data.pres_presentation_uploadToken[0];
        if (gaveUpAt) {
          // The presenter was already told the upload could not start. A refused request
          // carries its reason, which the uploader toast shows.
          if (uploadToken) removeFailedUpload(presentationId);
          return;
        }
        if (!uploadToken) {
          // The request was refused and the reason was recorded on the presentation, which
          // the uploader toast shows. There is nothing to upload to.
          reject(Object.assign(new Error('requestPresentationUploadToken rejected'), { reported: true }));
          return;
        }
        resolve({ uploadToken, presentationId });
      }
    }).catch(() => {});
    recursiveTimeout = setTimeout(() => {
      getData(n + 1);
    }, gaveUpAt ? LATE_TOKEN_POLL_INTERVAL : 1000);
  };
  setTimeout(getData, 100);
});

const requestPresentationUploadToken = (
  temporaryPresentationId,
  meetingId,
  filename,
) => requestPresentationUpload(temporaryPresentationId, meetingId, filename)
  .then(({ uploadToken }) => uploadToken);

const uploadAndConvertPresentation = (
  filename,
  temporaryPresentationId,
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

  let serverPresentationId = null;

  return requestPresentationUpload(temporaryPresentationId, meetingId, filename)
    .then(({ uploadToken, presentationId }) => {
      serverPresentationId = presentationId;
      return futch(endpoint.replace('upload', `${uploadToken}/upload`), opts, onProgress);
    })
    // Trap the error so we can have parallel upload
    .catch((error) => {
      logger.debug({
        logCode: 'presentation_uploader_service',
        extraInfo: {
          error,
        },
      }, 'Generic presentation upload exception catcher');
      // Set only once the token arrived, so this is a failure of the upload request itself.
      const uploadRequestFailed = !!serverPresentationId;
      return removeFailedUpload(serverPresentationId).then(() => {
        if (onUpload) {
          onUpload({
            error: true,
            done: true,
            status: error?.code,
            reported: !!error?.reported,
            uploadRequestFailed,
          });
        }
      });
    });
};

const uploadAndConvertPresentations = (
  presentationsToUpload,
  meetingId,
  uploadEndpoint,
) => Promise.all(presentationsToUpload.map((p) => uploadAndConvertPresentation(
  p.name,
  p.presentationId, p.file, p.downloadable, meetingId, uploadEndpoint,
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
  const presentationsToRemove = oldState.filter((p) => !newState.find(
    (u) => u.presentationId === p.presentationId,
  ));

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
  isPresentationEnabled,
) => {
  if (!isPresentationEnabled) {
    return null;
  }
  const PRESENTATION_CONFIG = window.meetingClientSettings.public.presentation;

  let updatedPresentations = [...presentations];

  if (!isFromPresentationUploaderInterface) {
    if (updatedPresentations.length === 0) {
      updatedPresentations = [...currentPresentations];
    }
    updatedPresentations = updatedPresentations.map((p) => update(p, {
      current: {
        $set: false,
      },
    }));
    const updatedNewPres = { ...newPres, current: true }; // Avoid mutating newPres
    updatedPresentations.push(updatedNewPres);
  }
  return persistPresentationChanges(
    currentPresentations,
    updatedPresentations,
    PRESENTATION_CONFIG.uploadEndpoint,
    setPresentation,
    removePresentation,
  );
};

const useExternalUploadData = () => {
  const { data: meeting } = useMeeting((m) => ({
    presentationUploadExternalDescription: m.presentationUploadExternalDescription,
    presentationUploadExternalUrl: m.presentationUploadExternalUrl,
  }));

  const {
    presentationUploadExternalDescription,
    presentationUploadExternalUrl,
  } = meeting || {};

  return {
    presentationUploadExternalDescription,
    presentationUploadExternalUrl,
  };
};

function handleFiledrop(files, files2, that, intl, intlMessages) {
  if (that) {
    const {
      fileValidMimeTypes,
      fileSizeMax,
    } = that.props;
    const { toUploadCount } = that.state;
    const validMimes = fileValidMimeTypes.map((fileValid) => fileValid.mime);
    const validExtentions = fileValidMimeTypes.map((fileValid) => fileValid.extension);
    const [validFiles, rejected] = partition(
      files.concat(files2), (f) => (
        validMimes.includes(f.type) || validExtentions.includes(`.${f.name.split('.').pop()}`)
      ),
    );
    const [tooLarge, accepted] = partition(validFiles, (f) => f.size > fileSizeMax);

    const presentationsToUpload = accepted.map((file) => {
      const id = uniqueId(uuid());

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
          // No upload token arrived and no reason was recorded for the uploader toast to show,
          // so nothing else would tell the presenter the upload failed. The upload rate limit
          // stops recording reasons past a number of refusals per window, hence "wait a moment".
          if (upload.error && !upload.reported && upload.status === 408) {
            notify(intl.formatMessage(intlMessages[408]), 'error');
          }
          // The upload request failed after the token was issued. Its presentation was
          // removed, so the uploader toast has nothing to show for it.
          if (upload.error && upload.uploadRequestFailed) {
            notify(`${file.name}: ${intl.formatMessage(intlMessages.uploadFailed)}`, 'error');
          }
        },
        onDone: (newId) => {
          that.updateFileKey(id, 'id', newId);
        },
      };
    });

    that.setState(({ presentations }) => ({
      presentations: presentations.concat(presentationsToUpload),
      toUploadCount: (toUploadCount + presentationsToUpload.length),
      shouldDisableExportButtonForAllDocuments: true,
    }), () => {
      const PRESENTATION_CONFIG = window.meetingClientSettings.public.presentation;
      uploadAndConvertPresentations(
        presentationsToUpload,
        Auth.meetingID,
        PRESENTATION_CONFIG.uploadEndpoint,
      )
        .then((presentations) => {
          // Update the presentation with their new ids
          presentations.forEach((p, i) => {
            if (p === undefined) return;
            presentationsToUpload[i].onDone(p.presentationId);
          });
        });
    });

    if (rejected.length > 0) {
      notify(intl.formatMessage(intlMessages.rejectedError), 'error');
    }

    if (tooLarge.length > 0) {
      const maxFileSize = getSizeWithUnit(fileSizeMax);
      const names = tooLarge.map((file) => file.name).join(', ');
      notify(`${names}: ${intl.formatMessage(intlMessages[413], { maxFileSize })}`, 'error');
    }
  }
}

export default {
  handleSavePresentation,
  persistPresentationChanges,
  requestPresentationUploadToken,
  uploadAndConvertPresentation,
  handleFiledrop,
  useExternalUploadData,
};
