import React, { useEffect, useRef } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from '/imports/ui/components/presentation/presentation-uploader/styles';
import { toast } from 'react-toastify';
import { defineMessages } from 'react-intl';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { notify } from '/imports/ui/services/notification';
import Session from '/imports/ui/services/storage/in-memory';

const EXPORT_STATUSES = {
  RUNNING: 'RUNNING',
  COLLECTING: 'COLLECTING',
  PROCESSING: 'PROCESSING',
  TIMEOUT: 'TIMEOUT',
  EXPORTED: 'EXPORTED',
};

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
  FILE_VIRUS: {
    id: 'app.presentationUploder.upload.fileVirus',
    description: 'error that the file could not be uploaded due to security concerns',
  },
  SCAN_FAILED: {
    id: 'app.presentationUploder.upload.scanFailed',
    description: 'error that the file could not be uploaded because scanning failed',
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
  linkAvailable: {
    id: 'app.presentationUploader.export.linkAvailable',
    description: 'download presentation link available on public chat',
  },
  downloadButtonAvailable: {
    id: 'app.presentationUploader.export.downloadButtonAvailable',
    description: 'download presentation link available on public chat',
  },
  exportToastHeader: {
    id: 'app.presentationUploader.exportToastHeader',
    description: 'exporting toast header',
  },
  exportToastHeaderPlural: {
    id: 'app.presentationUploader.exportToastHeaderPlural',
    description: 'exporting toast header in plural',
  },
  sending: {
    id: 'app.presentationUploader.sending',
    description: 'sending label',
  },
  collecting: {
    id: 'app.presentationUploader.collecting',
    description: 'collecting label',
  },
  processing: {
    id: 'app.presentationUploader.processing',
    description: 'processing label',
  },
  sent: {
    id: 'app.presentationUploader.sent',
    description: 'sent label',
  },
  exportingTimeout: {
    id: 'app.presentationUploader.exportingTimeout',
    description: 'exporting timeout label',
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

  if (('uploadErrorMsgKey' in item) && item.uploadErrorMsgKey) {
    const errorMessage = intlMessages[item.uploadErrorMsgKey]
      || intlMessages.genericConversionStatus;

    switch (item.uploadErrorMsgKey) {
      case 'CONVERSION_TIMEOUT':
        constraint['0'] = item.uploadErrorDetailsJson.numberPageError;
        constraint['1'] = item.uploadErrorDetailsJson.maxNumberOfAttempts;
        break;
      case 'FILE_TOO_LARGE':
        constraint['0'] = ((item.uploadErrorDetailsJson.maxFileSize) / 1000 / 1000).toFixed(2);
        break;
      case 'PAGE_COUNT_EXCEEDED':
        constraint['0'] = item.uploadErrorDetailsJson.maxNumberPages;
        break;
      case 'PDF_HAS_BIG_PAGE':
        constraint['0'] = (item.uploadErrorDetailsJson.bigPageSize / 1000 / 1000).toFixed(2);
        break;
      case 'INVALID_MIME_TYPE':
        constraint['0'] = item.uploadErrorDetailsJson.fileExtension;
        constraint['1'] = item.uploadErrorDetailsJson.fileMime;
        break;
      default:
        break;
    }

    return intl.formatMessage(errorMessage, constraint);
  }

  if ((('uploadInProgress' in item) && (item.uploadInProgress && !item.uploadErrorMsgKey)) || (('progress' in item) && item.progress === 100)) {
    let conversionStatusMessage;
    if ('totalPagesUploaded' in item) {
      if (item.totalPagesUploaded < item.totalPages) {
        return intl.formatMessage(intlMessages.conversionProcessingSlides, {
          0: item.totalPagesUploaded,
          1: item.totalPages,
        });
      }

      conversionStatusMessage = intlMessages[item.conversion?.status]
        || intlMessages.genericConversionStatus;
    } else {
      conversionStatusMessage = intlMessages.genericConversionStatus;
    }
    return intl.formatMessage(conversionStatusMessage);
  }

  return null;
}

function renderToastItem(item, intl) {
  const isUploading = ('totalPages' in item) && item.totalPages > 0;
  const uploadInProgress = ('uploadCompleted' in item) && !item.uploadCompleted;
  const hasError = (('uploadErrorMsgKey' in item) && item.uploadErrorMsgKey);
  const isProcessing = (isUploading || uploadInProgress) && !hasError;

  let icon = isProcessing ? 'blank' : 'check';
  if (hasError) icon = 'circle_close';

  return (
    <Styled.UploadRow
      key={item.presentationId || item.temporaryPresentationId}
      onClick={() => {
        if (hasError || isProcessing) Session.setItem('showUploadPresentationView', true);
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
    .sort((a, b) => a.uploadCompleted - b.uploadCompleted);

  presentationsSorted
    .forEach((p) => {
      const presDone = !p.uploadInProgress;
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

function renderExportationStatus(item, intl) {
  switch (item.exportToChatStatus) {
    case EXPORT_STATUSES.RUNNING:
      return intl.formatMessage(intlMessages.sending);
    case EXPORT_STATUSES.COLLECTING:
      return intl.formatMessage(intlMessages.collecting,
        { 0: item.exportToChatCurrentPage, 1: item.totalPages });
    case EXPORT_STATUSES.PROCESSING:
      return intl.formatMessage(intlMessages.processing,
        { 0: item.exportToChatCurrentPage, 1: item.totalPages });
    case EXPORT_STATUSES.TIMEOUT:
      return intl.formatMessage(intlMessages.exportingTimeout);
    case EXPORT_STATUSES.EXPORTED:
      return intl.formatMessage(intlMessages.sent);
    default:
      return '';
  }
}

function renderToastExportItem(item, intl) {
  const { exportToChatStatus: status } = item;
  const loading = [EXPORT_STATUSES.RUNNING, EXPORT_STATUSES.COLLECTING,
    EXPORT_STATUSES.PROCESSING].includes(status);
  const done = status === EXPORT_STATUSES.EXPORTED;
  const statusIconMap = {
    [EXPORT_STATUSES.RUNNING]: 'blank',
    [EXPORT_STATUSES.COLLECTING]: 'blank',
    [EXPORT_STATUSES.PROCESSING]: 'blank',
    [EXPORT_STATUSES.EXPORTED]: 'check',
    [EXPORT_STATUSES.TIMEOUT]: 'warning',
  };

  const icon = statusIconMap[status] || '';

  return (
    <Styled.UploadRow
      key={item.presentationId || item.temporaryPresentationId}
    >
      <Styled.FileLine>
        <span>
          <Icon iconName="file" />
        </span>
        <Styled.ToastFileName>
          <span>{item.name}</span>
        </Styled.ToastFileName>
        <Styled.StatusIcon>
          <Styled.ToastItemIcon
            loading={loading}
            done={done}
            iconName={icon}
            color="#0F70D7"
          />
        </Styled.StatusIcon>
      </Styled.FileLine>
      <Styled.StatusInfo>
        <Styled.StatusInfoSpan>
          {renderExportationStatus(item, intl)}
        </Styled.StatusInfoSpan>
      </Styled.StatusInfo>
    </Styled.UploadRow>
  );
}

function renderExportToast(presToShow, intl) {
  const isAllExported = presToShow.every(
    (p) => p.exportToChatStatus === EXPORT_STATUSES.EXPORTED,
  );
  const shouldDismiss = isAllExported && this.exportToastId;

  if (shouldDismiss) {
    handleDismissToast(this.exportToastId);
    return null;
  }

  const presToShowSorted = [
    ...presToShow.filter((p) => p.exportToChatStatus === EXPORT_STATUSES.RUNNING),
    ...presToShow.filter((p) => p.exportToChatStatus === EXPORT_STATUSES.COLLECTING),
    ...presToShow.filter((p) => p.exportToChatStatus === EXPORT_STATUSES.PROCESSING),
    ...presToShow.filter((p) => p.exportToChatStatus === EXPORT_STATUSES.TIMEOUT),
    ...presToShow.filter((p) => p.exportToChatStatus === EXPORT_STATUSES.EXPORTED),
  ];

  const headerLabelId = presToShowSorted.length === 1
    ? 'exportToastHeader'
    : 'exportToastHeaderPlural';

  return (
    <Styled.ToastWrapper data-test="downloadPresentationToast">
      <Styled.UploadToastHeader>
        <Styled.UploadIcon iconName="download" />
        <Styled.UploadToastTitle>
          {intl.formatMessage(intlMessages[headerLabelId], { 0: presToShowSorted.length })}
        </Styled.UploadToastTitle>
      </Styled.UploadToastHeader>
      <Styled.InnerToast>
        <div>
          <div>
            {presToShowSorted.map((item) => renderToastExportItem(item, intl))}
          </div>
        </div>
      </Styled.InnerToast>
    </Styled.ToastWrapper>
  );
}

export const PresentationUploaderToast = ({
  intl,
  convertingPresentations,
  presentations,
}) => {
  const dismissedErrorItems = useRef([]);
  const prevPresentations = usePreviousValue(presentations);
  const exportToastIdRef = useRef('presentationUploaderExportPresentationId');
  const convertingToastIdRef = useRef('presentationUploaderConvertingPresentationId');

  const addPressIdToDismissed = (presId) => {
    dismissedErrorItems.current.push(presId);
  };

  const getIdsFromPresentationsAndDismiss = (pres) => {
    pres.forEach((p) => {
      if (p.uploadErrorMsgKey && !dismissedErrorItems.current.includes(p.presentationId)) {
        addPressIdToDismissed(p.presentationId);
      }
    });
  };

  useEffect(() => {
    presentations
      .filter((p) => !dismissedErrorItems.current.includes(p.presentationId))
      .forEach((p) => {
        const prevPropPres = (prevPresentations || [])
          .find((pres) => pres.presentationId === p.presentationId);
        // display notification when presentation is exported
        if (prevPropPres?.exportToChatStatus
        && p?.exportToChatStatus === EXPORT_STATUSES.EXPORTED
        && prevPropPres?.exportToChatStatus !== p?.exportToChatStatus
        ) {
          notify(intl.formatMessage(intlMessages.linkAvailable, { 0: p.name }), 'success');
          handleDismissToast(exportToastIdRef.current);
        }

        // display notification for exportation status
        if ([
          EXPORT_STATUSES.RUNNING,
          EXPORT_STATUSES.COLLECTING,
          EXPORT_STATUSES.PROCESSING,
        ].includes(p?.exportToChatStatus)) {
          if (toast.isActive(exportToastIdRef.current)) {
            toast.update(exportToastIdRef.current, {
              render: renderExportToast(presentations, intl),
            });
          } else {
            toast(
              renderExportToast(presentations, intl), {
                hideProgressBar: true,
                autoClose: false,
                newestOnTop: true,
                closeOnClick: true,
                toastId: exportToastIdRef.current,
                onClose: () => {
                  Session.setItem('presentationUploaderExportToastId', null);
                  getIdsFromPresentationsAndDismiss(presentations);
                },
              },
            );
          }
        }
      });
  }, [presentations]);

  const showToast = convertingPresentations
    .filter((p) => !dismissedErrorItems.current.includes(p.presentationId)).length > 0;

  if (showToast && !toast.isActive(convertingToastIdRef.current)) {
    toast(() => renderToastList(convertingPresentations, intl), {
      hideProgressBar: true,
      autoClose: false,
      newestOnTop: true,
      closeOnClick: true,
      className: 'presentationUploaderToast toastClass',
      toastId: convertingToastIdRef.current,
      onClose: () => {
        Session.setItem('presentationUploaderToastId', null);
        getIdsFromPresentationsAndDismiss(presentations);
      },
    });
  } else if (!showToast && toast.isActive(convertingToastIdRef.current)) {
    handleDismissToast(convertingToastIdRef.current);
  } else {
    toast.update(convertingToastIdRef.current, {
      render: renderToastList(convertingPresentations, intl),
    });
  }
  return null;
};

export default {
  handleDismissToast,
  renderPresentationItemStatus,
};
