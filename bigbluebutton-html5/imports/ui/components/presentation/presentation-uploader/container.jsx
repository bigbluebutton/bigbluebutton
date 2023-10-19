import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { makeCall } from '/imports/ui/services/api';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import FallbackModal from '/imports/ui/components/common/fallback-errors/fallback-modal/component';
import Service from './service';
import PresUploaderToast from '/imports/ui/components/presentation/presentation-toast/presentation-uploader-toast/component';
import PresentationUploader from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import {
  isDownloadPresentationWithAnnotationsEnabled,
  isDownloadPresentationOriginalFileEnabled,
  isDownloadPresentationConvertedToPdfEnabled,
  isPresentationEnabled,
} from '/imports/ui/services/features';
import { useSubscription } from '@apollo/client';
import {
  PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const PresentationUploaderContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const userIsPresenter = currentUser.presenter;

  const { data: presentationData } = useSubscription(PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];
  const currentPresentation = presentations.find((p) => p.current)?.presentationId || '';

  const exportPresentation = (presentationId, fileStateType) => {
    makeCall('exportPresentation', presentationId, fileStateType);
  };

  return userIsPresenter && (
    <ErrorBoundary Fallback={FallbackModal}>
      <PresentationUploader
        isPresenter={userIsPresenter}
        presentations={presentations}
        currentPresentation={currentPresentation}
        exportPresentation={exportPresentation}
        {...props}
      />
    </ErrorBoundary>
  );
};

export default withTracker(() => {
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchChangePresentationDownloadable,
  } = Service;
  const isOpen = isPresentationEnabled() && (Session.get('showUploadPresentationView') || false);

  return {
    fileUploadConstraintsHint: PRESENTATION_CONFIG.fileUploadConstraintsHint,
    fileSizeMax: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadSizeMax,
    filePagesMax: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadPagesMax,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    allowDownloadOriginal: isDownloadPresentationOriginalFileEnabled(),
    allowDownloadConverted: isDownloadPresentationConvertedToPdfEnabled(),
    allowDownloadWithAnnotations: isDownloadPresentationWithAnnotationsEnabled(),
    handleSave: Service.handleSavePresentation,
    handleDismissToast: PresUploaderToast.handleDismissToast,
    renderToastList: Service.renderToastList,
    renderPresentationItemStatus: PresUploaderToast.renderPresentationItemStatus,
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchChangePresentationDownloadable,
    isOpen,
    selectedToBeNextCurrent: Session.get('selectedToBeNextCurrent') || null,
    externalUploadData: Service.getExternalUploadData(),
    handleFiledrop: Service.handleFiledrop,
  };
})(PresentationUploaderContainer);
