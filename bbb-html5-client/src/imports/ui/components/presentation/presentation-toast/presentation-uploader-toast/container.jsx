import React from 'react';
import { PresentationUploaderToast } from './component';

import {
  EXPORTING_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const PresentationUploaderToastContainer = (props) => {
  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription(
    EXPORTING_PRESENTATIONS_SUBSCRIPTION,
  );
  const presentations = presentationData?.pres_presentation || [];

  const convertingPresentations = presentations.filter(
    (p) => (!p.uploadCompleted || !!p.uploadErrorMsgKey),
  );
  if (presentationLoading) return null;
  if (!presentations.length) return null;

  return (
    <PresentationUploaderToast
      {
      ...{
        presentations: presentations.filter((p) => p),
        convertingPresentations,
        ...props,
      }
      }
    />
  );
};

export default PresentationUploaderToastContainer;
