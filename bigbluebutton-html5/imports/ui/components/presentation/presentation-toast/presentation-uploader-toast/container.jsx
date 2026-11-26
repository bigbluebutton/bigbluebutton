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

  // Rows are served to the current presenter only. An error on an upload made by an earlier
  // presenter is not shown to the next one. Presentations with no uploader (API documents,
  // breakout room captures) show their errors to the presenter, the one who can act on them.
  const presentationsToBeShowed = presentations.filter(
    (p) => (!p.uploadCompletionNotified
      && (!p.uploadErrorMsgKey
        || !p.uploadUserId
        || p.uploadUserId === currentUser?.userId)),
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
