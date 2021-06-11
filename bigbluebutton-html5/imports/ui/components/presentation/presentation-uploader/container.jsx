import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorBoundary from '/imports/ui/components/error-boundary/component';
import FallbackModal from '/imports/ui/components/fallback-errors/fallback-modal/component';
import Service from './service';
import PresentationUploader from './component';
import { withUsersConsumer } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const PresentationUploaderContainer = (props) => (
  props.isPresenter
  && (
    <ErrorBoundary Fallback={() => <FallbackModal />}>
      <PresentationUploader {...props} />
    </ErrorBoundary>
  )
);

export default withUsersConsumer(withTracker(({ users }) => {
  const currentPresentations = Service.getPresentations();
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
  } = Service;

  const currentUser = users[Auth.meetingID][Auth.userID];

  return {
    presentations: currentPresentations,
    defaultFileName: PRESENTATION_CONFIG.defaultPresentationFile,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
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
    isPresenter: currentUser.presenter,
  };
})(PresentationUploaderContainer));
