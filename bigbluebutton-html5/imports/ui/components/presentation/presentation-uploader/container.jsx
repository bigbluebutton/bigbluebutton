import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import PresentationService from '../service';
import Uploader from './component';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const UploaderContainer = props => <Uploader {...props} />;

export default withTracker(() => {
  const currentPresentations = Service.getPresentations();
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
  } = Service;

  return {
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
    isOpen: Session.get('showUploadPresentationView') || false,
    selectedToBeNextCurrent: Session.get('selectedToBeNextCurrent') || null,
    isPresenter: PresentationService.isPresenter('DEFAULT_PRESENTATION_POD'),
  };
})(UploaderContainer);
