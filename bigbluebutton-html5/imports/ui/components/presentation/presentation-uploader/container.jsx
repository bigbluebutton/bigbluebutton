import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorBoundary from '/imports/ui/components/error-boundary/component';
import FallbackModal from '/imports/ui/components/fallback-errors/fallback-modal/component';
import Service from './service';
import PresentationService from '../service';
import PresentationUploader from './component';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const PresentationUploaderContainer = (props) => (
  props.isPresenter
  && (
    <ErrorBoundary Fallback={() => <FallbackModal />}>
      <PresentationUploader {...props} />
    </ErrorBoundary>
  )
);

export default withTracker(() => {
  const currentPresentations = Service.getPresentations();
  const {
	  dispatchDisableDownloadable,
	  dispatchEnableDownloadable,
	  dispatchTogglePresentationDownloadable,
        } = Service;

  return {
    presentations: currentPresentations,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    allowDownloadable: PRESENTATION_CONFIG.allowDownloadable,
    handleSave: (presentations) => Service.persistPresentationChanges(
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
})(PresentationUploaderContainer);
