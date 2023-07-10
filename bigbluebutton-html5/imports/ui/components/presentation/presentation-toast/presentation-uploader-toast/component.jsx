import Presentations, { UploadingPresentations } from '/imports/api/presentations';
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import Icon from '/imports/ui/components/common/icon/component';
import { makeCall } from '/imports/ui/services/api';
import Styled from '/imports/ui/components/presentation/presentation-uploader/styles';
import { toast } from 'react-toastify';
import { defineMessages } from 'react-intl';

const TIMEOUT_CLOSE_TOAST = 1; // second

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
  413: {
    id: 'app.presentationUploder.upload.413',
    description: 'error that file exceed the size limit',
  },
  CONVERSION_TIMEOUT: {
    id: 'app.presentationUploder.conversion.conversionTimeout',
    description: 'warns the user that the presentation timed out in the back-end in specific page of the document',
  },
  FILE_TOO_LARGE: {
    id: 'app.presentationUploder.upload.413',
    description: 'error that file exceed the size limit',
  },
  INVALID_MIME_TYPE: {
    id: 'app.presentationUploder.conversion.invalidMimeType',
    description: 'warns user that the file\'s mime type is not supported or it doesn\'t match the extension',
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
  204: {
    id: 'app.presentationUploder.conversion.204',
    description: 'error indicating that the file has no content to capture',
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

function renderPresentationItemStatus(item, intl) {
  if ((('progress' in item) && item.progress === 0) || (('upload' in item) && item.upload.progress === 0 && !item.upload.error)) {
    return intl.formatMessage(intlMessages.fileToUpload);
  }

  if (('progress' in item) && item.progress < 100 && !('conversion' in item)) {
    return intl.formatMessage(intlMessages.uploadProcess, {
      0: Math.floor(item.progress).toString(),
    });
  }

  const constraint = {};

  if (('upload' in item) && (item.upload.done && item.upload.error)) {
    if (item.conversion.status === 'FILE_TOO_LARGE' || item.upload.status !== 413) {
      constraint['0'] = ((item.conversion.maxFileSize) / 1000 / 1000).toFixed(2);
    } else if (item.progress < 100) {
      const errorMessage = intlMessages.badConnectionError;
      return intl.formatMessage(errorMessage);
    }

    const errorMessage = intlMessages[item.upload.status] || intlMessages.genericError;
    return intl.formatMessage(errorMessage, constraint);
  }

  if (('conversion' in item) && (!item.conversion.done && item.conversion.error)) {
    const errorMessage = intlMessages[item.conversion.status]
      || intlMessages.genericConversionStatus;

    switch (item.conversion.status) {
      case 'CONVERSION_TIMEOUT':
        constraint['0'] = item.conversion.numberPageError;
        constraint['1'] = item.conversion.maxNumberOfAttempts;
        break;
      case 'FILE_TOO_LARGE':
        constraint['0'] = ((item.conversion.maxFileSize) / 1000 / 1000).toFixed(2);
        break;
      case 'PAGE_COUNT_EXCEEDED':
        constraint['0'] = item.conversion.maxNumberPages;
        break;
      case 'PDF_HAS_BIG_PAGE':
        constraint['0'] = (item.conversion.bigPageSize / 1000 / 1000).toFixed(2);
        break;
      case 'INVALID_MIME_TYPE':
        constraint['0'] = item.conversion.fileExtension;
        constraint['1'] = item.conversion.fileMime;
        break;
      default:
        break;
    }

    return intl.formatMessage(errorMessage, constraint);
  }

  if ((('conversion' in item) && (!item.conversion.done && !item.conversion.error)) || (('progress' in item) && item.progress === 100)) {
    let conversionStatusMessage;
    if ('conversion' in item) {
      if (item.conversion.pagesCompleted < item.conversion.numPages) {
        return intl.formatMessage(intlMessages.conversionProcessingSlides, {
          0: item.conversion.pagesCompleted,
          1: item.conversion.numPages,
        });
      }

      conversionStatusMessage = intlMessages[item.conversion.status]
        || intlMessages.genericConversionStatus;
    } else {
      conversionStatusMessage = intlMessages.genericConversionStatus;
    }
    return intl.formatMessage(conversionStatusMessage);
  }

  return null;
}

function renderToastItem(item, intl) {
  const isUploading = ('progress' in item) && item.progress <= 100;
  const isConverting = ('conversion' in item) && !item.conversion.done;
  const hasError = ((('conversion' in item) && item.conversion.error) || (('upload' in item) && item.upload.error));
  const isProcessing = (isUploading || isConverting) && !hasError;

  let icon = isProcessing ? 'blank' : 'check';
  if (hasError) icon = 'circle_close';

  return (
    <Styled.UploadRow
      key={item.id || item.temporaryPresentationId}
      onClick={() => {
        if (hasError || isProcessing) Session.set('showUploadPresentationView', true);
      }}
    >
      <Styled.FileLine>
        <span>
          <Icon iconName="file" />
        </span>
        <Styled.ToastFileName>
          <span>{item.filename || item.name}</span>
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

const renderToastList = (presentations, intl) => {
  let converted = 0;

  const presentationsSorted = presentations
    .sort((a, b) => a.uploadTimestamp - b.uploadTimestamp)
    .sort((a, b) => {
      const presADone = a.conversion ? a.conversion.done : false;
      const presBDone = b.conversion ? b.conversion.done : false;

      return presADone - presBDone;
    });

  presentationsSorted
    .forEach((p) => {
      const presDone = p.conversion ? p.conversion.done : false;
      if (presDone) converted += 1;
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
    <Styled.ToastWrapper data-test="presentationUploadProgressToast">
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
};

function handleDismissToast(toastId) {
  return toast.dismiss(toastId);
}

const alreadyRenderedPresList = [];

const enteredConversion = {};

export const PresentationUploaderToast = ({ intl }) => {
  useTracker(() => {
    const presentationsRenderedFalseAndConversionFalse = Presentations.find({ $or: [{ renderedInToast: false }, { 'conversion.done': false }] }).fetch();

    const convertingPresentations = presentationsRenderedFalseAndConversionFalse
      .filter((p) => !p.renderedInToast);

    // removing ones with errors.
    // If presentation has an error status - we don't want to have it pending as uploading
    convertingPresentations.forEach((p) => {
      if ('conversion' in p && p.conversion.error) {
        UploadingPresentations.remove(
          { $or: [{ temporaryPresentationId: p.temporaryPresentationId }, { id: p.id }] },
        );
      }
    });

    const toRemoveFromUploadingPresentations = [];
    // main goal of this mapping is to sort out what doesn't need to be displayed
    UploadingPresentations.find().fetch().forEach((p) => {
      if (
        (('upload' in p && p.upload.done) // if presentation is marked as done - it's potentially to be removed
        && !p.subscriptionId) // at upload stage or already converted
        || (p.lastModifiedUploader === false) // if presentation uploaded internally (e.g., breakout capture)
      ) {
        if (convertingPresentations[0]) { // there are presentations being converted
          convertingPresentations.forEach((cp) => {
            // if this presentation is being converted
            // we don't want it to be marked as still uploading
            if (cp.temporaryPresentationId === p.temporaryPresentationId) {
              toRemoveFromUploadingPresentations
                .push({ temporaryPresentationId: p.temporaryPresentationId, id: p.id });
            }
          });
          // upload stage is done and presentation is entering conversion stage
        } else if (!enteredConversion[p.temporaryPresentationId]) {
          // we mark that it has entered conversion stage
          enteredConversion[p.temporaryPresentationId] = true;
        } else {
          // presentation doesn't normally enter conversion twice so we remove
          // the inconsistencies between UploadingPresentation and Presentation (corner case)
          const presentationsAlreadyRenderedIds = Presentations
            .find({ renderedInToast: true }).fetch().map((pr) => (
              {
                id: pr.id,
                temporaryPresentationId: pr.temporaryPresentationId,
              }
            ));
          presentationsAlreadyRenderedIds.forEach((pr) => {
            UploadingPresentations.remove({
              $or: [{ temporaryPresentationId: pr.temporaryPresentationId }, { id: pr.id }],
            });
          });
        }
      }
    });

    toRemoveFromUploadingPresentations.forEach((p) => {
      UploadingPresentations
        .remove({ $or: [{ temporaryPresentationId: p.temporaryPresentationId }, { id: p.id }] });
    });

    const uploadingPresentations = UploadingPresentations.find().fetch();

    let presentationsToConvert = convertingPresentations.concat(uploadingPresentations);
    // Updating or populating the "state" presentation list
    presentationsToConvert.map((p) => (
      {
        filename: p.name || p.filename,
        temporaryPresentationId: p.temporaryPresentationId,
        presentationId: p.id,
        hasError: p.conversion?.error || p.upload?.error,
        lastModifiedUploader: p.lastModifiedUploader,
      }
    )).forEach((p) => {
      const docIndexAlreadyInList = alreadyRenderedPresList.findIndex((pres) => (
        (pres.temporaryPresentationId === p.temporaryPresentationId
          || pres.presentationId === p.presentationId
          || (
            pres.lastModifiedUploader !== undefined
            && !pres.lastModifiedUploader && pres.filename === p.filename
          )
        )
      ));
      if (docIndexAlreadyInList === -1) {
        alreadyRenderedPresList.push({
          filename: p.filename,
          temporaryPresentationId: p.temporaryPresentationId,
          presentationId: p.presentationId,
          rendered: false,
          lastModifiedUploader: p.lastModifiedUploader,
          hasError: p.hasError,
        });
      } else {
        const presAlreadyRendered = alreadyRenderedPresList[docIndexAlreadyInList];
        presAlreadyRendered.temporaryPresentationId = p.temporaryPresentationId;
        presAlreadyRendered.presentationId = p.presentationId;
        presAlreadyRendered.lastModifiedUploader = p.lastModifiedUploader;
        presAlreadyRendered.hasError = p.hasError;
      }
    });
    let activeToast = Session.get('presentationUploaderToastId');
    const showToast = presentationsToConvert.length > 0;

    if (showToast && !activeToast) {
      activeToast = toast.info(() => renderToastList(presentationsToConvert, intl), {
        hideProgressBar: true,
        autoClose: false,
        newestOnTop: true,
        closeOnClick: true,
        className: 'presentationUploaderToast toastClass',
        onClose: () => {
          presentationsToConvert = [];
          if (alreadyRenderedPresList.every((pres) => pres.rendered)) {
            makeCall('setPresentationRenderedInToast').then(() => {
              Session.set('presentationUploaderToastId', null);
            });
            alreadyRenderedPresList.length = 0;
          }
        },
      });
      Session.set('presentationUploaderToastId', activeToast);
    } else if (!showToast && activeToast) {
      handleDismissToast(activeToast);
      Session.set('presentationUploaderToastId', null);
    } else {
      toast.update(activeToast, {
        render: renderToastList(presentationsToConvert, intl),
      });
    }

    const temporaryPresentationIdListToSetAsRendered = presentationsToConvert.filter((p) => (
      'conversion' in p && (p.conversion.done || p.conversion.error)
    ));

    temporaryPresentationIdListToSetAsRendered.forEach((p) => {
      const index = alreadyRenderedPresList.findIndex((pres) => (
        pres.temporaryPresentationId === p.temporaryPresentationId || pres.presentationId === p.id
      ));
      if (index !== -1) {
        alreadyRenderedPresList[index].rendered = true;
      }
    });

    if (alreadyRenderedPresList.every((pres) => pres.rendered && !pres.hasError)) {
      setTimeout(() => {
        makeCall('setPresentationRenderedInToast');
        alreadyRenderedPresList.length = 0;
      }, TIMEOUT_CLOSE_TOAST * 1000);
    }
  }, []);
  return null;
};

export default {
  handleDismissToast,
  renderPresentationItemStatus,
};
