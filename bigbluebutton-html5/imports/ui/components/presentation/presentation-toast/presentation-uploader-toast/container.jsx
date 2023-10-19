import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { UploadingPresentations } from '/imports/api/presentations';
import { PresentationUploaderToast } from './component';
import { useSubscription } from '@apollo/client';
import {
  PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';

const PresentationUploaderToastContainer = (props) => {
  const { data: presentationData } = useSubscription(PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  const convertingPresentations = presentations.filter(
    (p) => p.totalPagesUploaded < p.totalPages || !!p.uploadErrorMsgKey
  );

  return (
    <PresentationUploaderToast
      {
      ...{
        convertingPresentations,
        ...props,
      }
      }
    />
  );
};

export default withTracker(() => {
  const uploadingPresentations = UploadingPresentations.find({ $or: [{ 'upload.error': true }, { 'upload.done': false }] }).fetch();

  return {
    uploadingPresentations,
  };
})(PresentationUploaderToastContainer);
