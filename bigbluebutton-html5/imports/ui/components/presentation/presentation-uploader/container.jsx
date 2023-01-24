import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { makeCall } from '/imports/ui/services/api';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import FallbackModal from '/imports/ui/components/common/fallback-errors/fallback-modal/component';
import Service from './service';
import PresUploaderToast from '/imports/ui/components/presentation/presentation-toast/presentation-uploader-toast/component';
import PresentationUploader from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import { isDownloadPresentationWithAnnotationsEnabled } from '/imports/ui/services/features';
import { toast } from 'react-toastify';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

// takes asynchronous cleanup tasks outside the component that is to be unmounted
const unmount = () => {
  Session.set('showUploadPresentationView', false);
    let id = Session.get("presentationUploaderToastId");
    if (id) {
      toast.dismiss(id);
      makeCall('setPresentationRenderedInToast').then(() => {
        Session.set("presentationUploaderToastId", null);
      });
    }
}

const PresentationUploaderContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const userIsPresenter = currentUser.presenter

  return userIsPresenter && (
    <ErrorBoundary Fallback={() => <FallbackModal />}>
      <PresentationUploader isPresenter={userIsPresenter} unmount={unmount} {...props} />
    </ErrorBoundary>
  );
};

export default withTracker(() => {
  const currentPresentations = Service.getPresentations();
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
    exportPresentationToChat,
  } = Service;

  return {
    presentations: currentPresentations,
    fileUploadConstraintsHint: PRESENTATION_CONFIG.fileUploadConstraintsHint,
    fileSizeMax: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadSizeMax,
    filePagesMax: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadPagesMax,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    allowDownloadable: isDownloadPresentationWithAnnotationsEnabled(),
    handleSave: Service.handleSavePresentation,
    handleDismissToast: PresUploaderToast.handleDismissToast,
    renderToastList: Service.renderToastList,
    renderPresentationItemStatus: PresUploaderToast.renderPresentationItemStatus,
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
    exportPresentationToChat,
    isOpen: Session.get('showUploadPresentationView') || false,
    selectedToBeNextCurrent: Session.get('selectedToBeNextCurrent') || null,
    externalUploadData: Service.getExternalUploadData(),
    handleFiledrop: Service.handleFiledrop,
  };
})(PresentationUploaderContainer);
