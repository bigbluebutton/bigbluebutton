import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { partition } from '/imports/utils/array-utils';
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';
import { uniqueId } from '/imports/utils/string-utils';
import { notify } from '/imports/ui/services/notification';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import { getPresentationUploadToken } from './queries';
import { requestPresentationUploadTokenMutation } from './mutation';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const TOKEN_TIMEOUT = 5000;
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
  const client = apolloContextHolder.getClient();
  client.mutate({
    mutation: requestPresentationUploadTokenMutation,
    variables: {
      podId: POD_ID,
      filename,
      uploadTemporaryId: temporaryPresentationId,
    },
  });

  const timeout = setTimeout(() => {
    reject(new Error({ code: 408, message: 'requestPresentationUploadToken timeout' }));
  }, TOKEN_TIMEOUT);

  const getData = (n = 0) => {
    if (n > 10) return;
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
        resolve(result.data.pres_presentation_uploadToken[0].uploadToken);
      }
    });
    recursiveTimeout = setTimeout(() => {
      getData(n + 1);
    }, 1000);
  };
  setTimeout(getData, 100);
});

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

  return requestPresentationUploadToken(temporaryPresentationId, meetingId, filename)
    .then((token) => futch(endpoint.replace('upload', `${token}/upload`), opts, onProgress))
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
  uploadAndConvertPresentation,
  handleFiledrop,
  useExternalUploadData,
};
