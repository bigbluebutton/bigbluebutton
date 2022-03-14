import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import FallbackModal from '/imports/ui/components/common/fallback-errors/fallback-modal/component';
import Service from './service';
import PresentationUploader from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const PresentationUploaderContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const userIsPresenter = currentUser.presenter;

  return userIsPresenter && (
    <ErrorBoundary Fallback={() => <FallbackModal />}>
      <PresentationUploader isPresenter={userIsPresenter} {...props} />
    </ErrorBoundary>
  );
};

export default withTracker(() => {
  const currentPresentations = Service.getPresentations();
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
  } = Service;

  return {
    presentations: currentPresentations,
    fileUploadConstraintsHint: PRESENTATION_CONFIG.fileUploadConstraintsHint,
    fileSizeMax: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadSizeMax,
    filePagesMax: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadPagesMax,
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
  };
})(PresentationUploaderContainer);
