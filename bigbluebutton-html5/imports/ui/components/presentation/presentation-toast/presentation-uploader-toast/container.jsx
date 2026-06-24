import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { PresentationUploaderToast } from './component';

import {
  PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import SET_PRESENTATION_RENDERED_IN_TOAST from './mutation';

const PresentationUploaderToastContainer = (props) => {
  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription(
    PRESENTATIONS_SUBSCRIPTION,
  );

  // Force show toast in first render, since default.pdf is completely uploaded at this point
  const [forceShowToast, setForceShowToast] = useState(true);
  const [setPresentationUploadCompletionNotified] = useMutation(SET_PRESENTATION_RENDERED_IN_TOAST);
  const presentations = presentationData?.pres_presentation || [];

  const presentationsToBeShowed = presentations.filter(
    (p) => (!p.uploadCompletionNotified),
  );

  if (presentationLoading) return null;
  if (!presentations.length) return null;

  return (
    <PresentationUploaderToast
      {
      ...{
        presentations: presentations.filter((p) => p),
        presentationsToBeShowed,
        setPresentationUploadCompletionNotified,
        forceShowToast,
        setForceShowToast,
        ...props,
      }
      }
    />
  );
};

export default PresentationUploaderToastContainer;
