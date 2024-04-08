import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { UploadingPresentations } from '/imports/api/presentations';
import { PresentationUploaderToast } from './component';
import { useSubscription } from '@apollo/client';
import {
  EXPORTING_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';

const PresentationUploaderToastContainer = (props) => {
  const { data: presentationData } = useSubscription(EXPORTING_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  const convertingPresentations = presentations.filter(
    (p) => !p.uploadCompleted || !!p.uploadErrorMsgKey,
  );

  return (
    <PresentationUploaderToast
      {
      ...{
        presentations,
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
