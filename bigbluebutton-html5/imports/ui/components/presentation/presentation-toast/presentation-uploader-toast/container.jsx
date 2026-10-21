import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { PresentationUploaderToast } from './component';

import {
  PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
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

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));

  // Errors are shown only to whoever uploaded the file, so a presenter is not told about a
  // document an integration pushed through the API. Breakout room captures ('204') are kept.
  const presentationsToBeShowed = presentations.filter(
    (p) => (!p.uploadCompletionNotified
      && (!p.uploadErrorMsgKey
        || p.uploadUserId === currentUser?.userId
        || p.uploadErrorMsgKey === '204')),
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
