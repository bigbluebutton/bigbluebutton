import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl, defineMessages } from 'react-intl';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Service from './service';
import Uploader from './component';

const intlMessages = defineMessages({
  current: {
    id: 'app.presentationUploder.currentBadge',
  },
  title: {
    id: 'app.presentationUploder.title',
    description: 'title of the modal',
  },
  message: {
    id: 'app.presentationUploder.message',
    description: 'message warning the types of files accepted',
  },
  uploadLabel: {
    id: 'app.presentationUploder.uploadLabel',
    description: 'confirm label when presentations are to be uploaded',
  },
  confirmLabel: {
    id: 'app.presentationUploder.confirmLabel',
    description: 'confirm label when no presentations are to be uploaded',
  },
  confirmDesc: {
    id: 'app.presentationUploder.confirmDesc',
    description: 'description of the confirm',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'used in the button that close modal',
  },
  dismissDesc: {
    id: 'app.presentationUploder.dismissDesc',
    description: 'description of the dismiss',
  },
  dropzoneLabel: {
    id: 'app.presentationUploder.dropzoneLabel',
    description: 'message warning where drop files for upload',
  },
  dropzoneImagesLabel: {
    id: 'app.presentationUploder.dropzoneImagesLabel',
    description: 'message warning where drop images for upload',
  },
  browseFilesLabel: {
    id: 'app.presentationUploder.browseFilesLabel',
    description: 'message use on the file browser',
  },
  browseImagesLabel: {
    id: 'app.presentationUploder.browseImagesLabel',
    description: 'message use on the image browser',
  },
  fileToUpload: {
    id: 'app.presentationUploder.fileToUpload',
    description: 'message used in the file selected for upload',
  },
  genericError: {
    id: 'app.presentationUploder.genericError',
    description: 'generic error while uploading/converting',
  },
  rejectedError: {
    id: 'app.presentationUploder.rejectedError',
    description: 'some files rejected, please check the file mime types',
  },
  uploadProcess: {
    id: 'app.presentationUploder.upload.progress',
    description: 'message that indicates the percentage of the upload',
  },
  413: {
    id: 'app.presentationUploder.upload.413',
    description: 'error that file exceed the size limit',
  },
  conversionProcessingSlides: {
    id: 'app.presentationUploder.conversion.conversionProcessingSlides',
    description: 'indicates how many slides were converted',
  },
  genericConversionStatus: {
    id: 'app.presentationUploder.conversion.genericConversionStatus',
    description: 'indicates that file is being converted',
  },
  TIMEOUT: {
    id: 'app.presentationUploder.conversion.timeout',
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
  isDownloadable: {
    id: 'app.presentationUploder.isDownloadableLabel',
    description: 'presentation is available for downloading by all viewers',
  },
  isNotDownloadable: {
    id: 'app.presentationUploder.isNotDownloadableLabel',
    description: 'presentation is not available for downloading the viewers',
  },
  removePresentation: {
    id: 'app.presentationUploder.removePresentationLabel',
    description: 'select to delete this presentation',
  },
  setAsCurrentPresentation: {
    id: 'app.presentationUploder.setAsCurrentPresentation',
    description: 'set this presentation to be the current one',
  },
  status: {
    id: 'app.presentationUploder.tableHeading.status',
    description: 'aria label status table heading',
  },
  options: {
    id: 'app.presentationUploder.tableHeading.options',
    description: 'aria label for options table heading',
  },
  filename: {
    id: 'app.presentationUploder.tableHeading.filename',
    description: 'aria label for file name table heading',
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
  item: {
    id: 'app.presentationUploder.item',
    description: 'single item label',
  },
  itemPlural: {
    id: 'app.presentationUploder.itemPlural',
    description: 'plural item label',
  },
  clearErrors: {
    id: 'app.presentationUploder.clearErrors',
    description: 'button label for clearing upload errors',
  },
  clearErrorsDesc: {
    id: 'app.presentationUploder.clearErrorsDesc',
    description: 'aria description for button clearing upload error',
  },
});

const UploaderContainer = props => <Uploader {...props} />;

export default withTracker(() => {
  const PRESENTATION_CONFIG = Meteor.settings.public.presentation;
  const currentPresentations = Service.getPresentations();
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
  } = Service;

  return {
    intlMessages,
    presentations: currentPresentations,
    defaultFileName: PRESENTATION_CONFIG.defaultPresentationFile,
    fileSizeMin: PRESENTATION_CONFIG.uploadSizeMin,
    fileSizeMax: PRESENTATION_CONFIG.uploadSizeMax,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    handleSave: presentations => Service.persistPresentationChanges(
      currentPresentations,
      presentations,
      PRESENTATION_CONFIG.uploadEndpoint,
      'DEFAULT_PRESENTATION_POD',
    ),
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
    isOpen: Session.get('uploadReq') || false,
    currentPresID: Session.get('currentPresID') || null,
    amIPresenter: Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } }).presenter,
  };
})(injectIntl(UploaderContainer));
