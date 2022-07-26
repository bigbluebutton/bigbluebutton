import Presentations from '/imports/api/presentations';
import React from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Auth from '/imports/ui/services/auth';
import Poll from '/imports/api/polls/';
import { Meteor } from 'meteor/meteor';
import { defineMessages, injectIntl } from 'react-intl';
import { makeCall } from '/imports/ui/services/api';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { Random } from 'meteor/random'

const CONVERSION_TIMEOUT = 300000;
const TOKEN_TIMEOUT = 5000;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const intlMessages = defineMessages({

  item: {
    id: 'app.presentationUploder.item',
    description: 'single item label',
  },
  itemPlural: {
    id: 'app.presentationUploder.itemPlural',
    description: 'plural item label',
  },
  uploading: {
    id: 'app.presentationUploder.uploading',
    description: 'uploading label for toast notification',
  },
  uploadStatus: {
    id: 'app.presentationUploder.uploadStatus',
    description: 'upload status for toast notification',
  },
  completed: {
    id: 'app.presentationUploder.completed',
    description: 'uploads complete label for toast notification',
  },
  GENERATING_THUMBNAIL: {
    id: 'app.presentationUploder.conversion.generatingThumbnail',
    description: 'indicatess that it is generating thumbnails',
  },
  GENERATING_SVGIMAGES: {
    id: 'app.presentationUploder.conversion.generatingSvg',
    description: 'warns that it is generating svg images',
  },
  GENERATED_SLIDE: {
    id: 'app.presentationUploder.conversion.generatedSlides',
    description: 'warns that were slides generated',
  },
  PAGE_COUNT_EXCEEDED: {
    id: 'app.presentationUploder.conversion.pageCountExceeded',
    description: 'warns the user that the conversion failed because of the page count',
  },
  PDF_HAS_BIG_PAGE: {
    id: 'app.presentationUploder.conversion.pdfHasBigPage',
    description: 'warns the user that the conversion failed because of the pdf page siz that exceeds the allowed limit',
  },
  OFFICE_DOC_CONVERSION_INVALID: {
    id: 'app.presentationUploder.conversion.officeDocConversionInvalid',
    description: '',
  },
  OFFICE_DOC_CONVERSION_FAILED: {
    id: 'app.presentationUploder.conversion.officeDocConversionFailed',
    description: 'warns the user that the conversion failed because of wrong office file',
  },
  UNSUPPORTED_DOCUMENT: {
    id: 'app.presentationUploder.conversion.unsupportedDocument',
    description: 'warns the user that the file extension is not supported',
  },
  fileToUpload: {
    id: 'app.presentationUploder.fileToUpload',
    description: 'message used in the file selected for upload',
  },
  uploadProcess: {
    id: 'app.presentationUploder.upload.progress',
    description: 'message that indicates the percentage of the upload',
  },
  badConnectionError: {
    id: 'app.presentationUploder.connectionClosedError',
    description: 'message indicating that the connection was closed',
  },
  conversionProcessingSlides: {
    id: 'app.presentationUploder.conversion.conversionProcessingSlides',
    description: 'indicates how many slides were converted',
  },
  genericError: {
    id: 'app.presentationUploder.genericError',
    description: 'generic error while uploading/converting',
  },
  genericConversionStatus: {
    id: 'app.presentationUploder.conversion.genericConversionStatus',
    description: 'indicates that file is being converted',
  },
});


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
  tmpPresId,
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
        if (doc.temporaryPresentationId !== tmpPresId) return;

        if (doc.conversion.status === 'FILE_TOO_LARGE' || doc.conversion.status === 'UNSUPPORTED_DOCUMENT') {
          onConversion(doc.conversion);
          c.stop();
          clearTimeout(conversionTimeout);
        }
      },
      changed: (newDoc) => {
        if (newDoc.temporaryPresentationId !== tmpPresId) return;

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
  tmpPresId,
  podId,
  meetingId,
  filename,
) => new Promise((resolve, reject) => {
  makeCall('requestPresentationUploadToken', podId, filename, tmpPresId);

  let computation = null;
  const timeout = setTimeout(() => {
    computation.stop();
    reject({ code: 408, message: 'requestPresentationUploadToken timeout' });
  }, TOKEN_TIMEOUT);

  Tracker.autorun((c) => {
    computation = c;
    const sub = Meteor.subscribe('presentation-upload-token', podId, filename, tmpPresId);
    if (!sub.ready()) return;

    const PresentationToken = PresentationUploadToken.findOne({
      podId,
      meetingId,
      tmpPresId,
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
  const tmpPresId = _.uniqueId(Random.id(20))

  const data = new FormData();
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);
  data.append('temporaryPresentationId', tmpPresId);

  // TODO: Currently the uploader is not related to a POD so the id is fixed to the default
  data.append('pod_id', podId);

  data.append('is_downloadable', downloadable);

  const opts = {
    method: 'POST',
    body: data,
  };

  return requestPresentationUploadToken(tmpPresId, podId, meetingId, file.name)
    .then((token) => {
      makeCall('setUsedToken', token);
      return futch(endpoint.replace('upload', `${token}/upload`), opts, onProgress);
    })
    .then(() => observePresentationConversion(meetingId, tmpPresId, onConversion))
    // Trap the error so we can have parallel upload
    .catch((error) => {
      logger.debug({
        logCode: 'presentation_uploader_service',
        extraInfo: {
          error,
        },
      }, 'Generic presentation upload exception catcher');
      observePresentationConversion(meetingId, tmpPresId, onConversion);
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

function renderPresentationItemStatus(item, intl) {
  if (!item.upload.done && item.upload.progress === 0) {
    return intl.formatMessage(intlMessages.fileToUpload);
  }

  if (!item.upload.done && !item.upload.error) {
    return intl.formatMessage(intlMessages.uploadProcess, {
      0: Math.floor(item.upload.progress).toString(),
    });
  }

  const constraint = {};

  if (item.upload.done && item.upload.error) {
    if (item.conversion.status === 'FILE_TOO_LARGE') {
      constraint['0'] = ((item.conversion.maxFileSize) / 1000 / 1000).toFixed(2);
    }

    if (item.upload.progress < 100) {
      const errorMessage = intlMessages.badConnectionError;
      return intl.formatMessage(errorMessage);
    }

    const errorMessage = intlMessages[item.upload.status] || intlMessages.genericError;
    return intl.formatMessage(errorMessage, constraint);
  }

  if (!item.conversion.done && item.conversion.error) {
    const errorMessage = intlMessages[item.conversion.status] || intlMessages.genericConversionStatus;

    switch (item.conversion.status) {
      case 'PAGE_COUNT_EXCEEDED':
        constraint['0'] = item.conversion.maxNumberPages;
        break;
      case 'PDF_HAS_BIG_PAGE':
        constraint['0'] = (item.conversion.bigPageSize / 1000 / 1000).toFixed(2);
        break;
      default:
        break;
    }

    return intl.formatMessage(errorMessage, constraint);
  }

  if (!item.conversion.done && !item.conversion.error) {
    if (item.conversion.pagesCompleted < item.conversion.numPages) {
      return intl.formatMessage(intlMessages.conversionProcessingSlides, {
        0: item.conversion.pagesCompleted,
        1: item.conversion.numPages,
      });
    }

    const conversionStatusMessage = intlMessages[item.conversion.status]
      || intlMessages.genericConversionStatus;
    return intl.formatMessage(conversionStatusMessage);
  }

  return null;
}

function renderToastItem(item, intl) {
  const isUploading = !item.upload.done && item.upload.progress > 0;
  const isConverting = !item.conversion.done && item.upload.done;
  const hasError = item.conversion.error || item.upload.error;
  const isProcessing = (isUploading || isConverting) && !hasError;

  let icon = isProcessing ? 'blank' : 'check';
  if (hasError) icon = 'circle_close';

  return (
    <Styled.UploadRow
      key={item.id}
      onClick={() => {
        if (hasError || isProcessing) Session.set('showUploadPresentationView', true);
      }}
    >
      <Styled.FileLine>
        <span>
          <Icon iconName="file" />
        </span>
        <Styled.ToastFileName>
          <span>{item.filename}</span>
        </Styled.ToastFileName>
        <Styled.StatusIcon>
          <Styled.ToastItemIcon
            done={!isProcessing && !hasError}
            error={hasError}
            loading={isProcessing}
            iconName={icon}
          />
        </Styled.StatusIcon>
      </Styled.FileLine>
      <Styled.StatusInfo>
        <Styled.StatusInfoSpan data-test="presentationStatusInfo" styles={hasError ? 'error' : 'info'}>
          {renderPresentationItemStatus(item, intl)}
        </Styled.StatusInfoSpan>
      </Styled.StatusInfo>
    </Styled.UploadRow>
  );
}

const verifyUploadToast = (presentations, toUploadCount, intl) => {
  const toastId = Session.get("presentationUploaderToastId");

  if (toastId) {
    toast.update(toastId, {
      render: renderToastList(presentations, toUploadCount, intl),
    });
  }
}

const observePresentationsForToast = (meetingId, presentations, toUploadCount, intl) => new Promise((resolve, reject) => {

  Tracker.autorun((c) => {
    const query = Presentations.find({ meetingId });

    query.observe({
      added: (doc) => {
        console.log(presentations)
        verifyUploadToast(presentations, toUploadCount, intl)
      },
      changed: (newDoc) => {
        console.log(presentations)
        verifyUploadToast(presentations, toUploadCount, intl)
      },
    });
  });
})

function handleDismissToast(toastId) {
  return toast.dismiss(toastId);
}

function renderToastList(presentations, toUploadCount, intl) {

  if (toUploadCount === 0) {
    const toastId = Session.get("presentationUploaderToastId")
    return handleDismissToast(toastId);
  }

  let converted = 0;

  let presentationsSorted = presentations
    .filter((p) => (p.upload.progress || p.conversion.status) && p.file)
    .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp)
    .sort((a, b) => a.conversion.done - b.conversion.done);

  presentationsSorted = presentationsSorted
    .splice(0, toUploadCount)
    .map((p) => {
      if (p.conversion.done) converted += 1;
      return p;
    });

  let toastHeading = '';
  const itemLabel = presentationsSorted.length > 1
    ? intl.formatMessage(intlMessages.itemPlural)
    : intl.formatMessage(intlMessages.item);

  if (converted === 0) {
    toastHeading = intl.formatMessage(intlMessages.uploading, {
      0: presentationsSorted.length,
      1: itemLabel,
    });
  }

  if (converted > 0 && converted !== presentationsSorted.length) {
    toastHeading = intl.formatMessage(intlMessages.uploadStatus, {
      0: converted,
      1: presentationsSorted.length,
    });
  }

  if (converted === presentationsSorted.length) {
    toastHeading = intl.formatMessage(intlMessages.completed, {
      0: converted,
    });
  }

  return (
    <Styled.ToastWrapper>
      <Styled.UploadToastHeader>
        <Styled.UploadIcon iconName="upload" />
        <Styled.UploadToastTitle>{toastHeading}</Styled.UploadToastTitle>
      </Styled.UploadToastHeader>
      <Styled.InnerToast>
        <div>
          <div>
            {presentationsSorted.map((item) => renderToastItem(item, intl))}
          </div>
        </div>
      </Styled.InnerToast>
    </Styled.ToastWrapper>
  );
}

const persistPresentationChanges = (oldState, newState, uploadEndpoint, podId, toUploadCount, intl) => {
  const presentationsToUpload = newState.filter((p) => !p.upload.done);

  if (presentationsToUpload.length > 0) {
    console.log("Vou criar toast")
    const toastId = toast.info(renderToastList(newState, toUploadCount, intl ), {
      hideProgressBar: true,
      autoClose: false,
      newestOnTop: true,
      closeOnClick: true,
      onClose: () => {
        Session.set("presentationUploaderToastId", null)
      },
    });
    Session.set('presentationUploaderToastId', toastId)
    observePresentationsForToast(Auth.meetingID, presentationsToUpload, toUploadCount, intl)
  }
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
  requestPresentationUploadToken,
  renderToastList,
  handleDismissToast,
  renderPresentationItemStatus,
};
