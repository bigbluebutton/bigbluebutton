import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import FallbackModal from '/imports/ui/components/common/fallback-errors/fallback-modal/component';
import { useSubscription, useMutation } from '@apollo/client';
import Service from './service';
import PresUploaderToast from '/imports/ui/components/presentation/presentation-toast/presentation-uploader-toast/component';
import PresentationUploader from './component';
import {
  isDownloadPresentationWithAnnotationsEnabled,
  isDownloadPresentationOriginalFileEnabled,
  isDownloadPresentationConvertedToPdfEnabled,
  isPresentationEnabled,
} from '/imports/ui/services/features';
import {
  PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  PRESENTATION_SET_DOWNLOADABLE,
  PRESENTATION_EXPORT,
  PRESENTATION_SET_CURRENT,
  PRESENTATION_REMOVE,
} from '../mutations';

const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const PresentationUploaderContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const userIsPresenter = currentUserData?.presenter;

  const { data: presentationData } = useSubscription(PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];
  const currentPresentation = presentations.find((p) => p.current)?.presentationId || '';

  const [presentationSetDownloadable] = useMutation(PRESENTATION_SET_DOWNLOADABLE);
  const [presentationExport] = useMutation(PRESENTATION_EXPORT);
  const [presentationSetCurrent] = useMutation(PRESENTATION_SET_CURRENT);
  const [presentationRemove] = useMutation(PRESENTATION_REMOVE);

  const exportPresentation = (presentationId, fileStateType) => {
    presentationExport({
      variables: {
        presentationId,
        fileStateType,
      },
    });
  };

  const dispatchChangePresentationDownloadable = (presentationId, downloadable, fileStateType) => {
    presentationSetDownloadable({
      variables: {
        presentationId,
        downloadable,
        fileStateType,
      },
    });
  };

  const setPresentation = (presentationId) => {
    presentationSetCurrent({ variables: { presentationId } });
  };

  const removePresentation = (presentationId) => {
    presentationRemove({ variables: { presentationId } });
  };

  return userIsPresenter && (
    <ErrorBoundary Fallback={FallbackModal}>
      <PresentationUploader
        isPresenter={userIsPresenter}
        presentations={presentations}
        currentPresentation={currentPresentation}
        exportPresentation={exportPresentation}
        dispatchChangePresentationDownloadable={dispatchChangePresentationDownloadable}
        setPresentation={setPresentation}
        removePresentation={removePresentation}
        {...props}
      />
    </ErrorBoundary>
  );
};

export default withTracker(() => {
  const {
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
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
    isOpen,
    selectedToBeNextCurrent: Session.get('selectedToBeNextCurrent') || null,
    externalUploadData: Service.getExternalUploadData(),
    handleFiledrop: Service.handleFiledrop,
  };
})(PresentationUploaderContainer);
