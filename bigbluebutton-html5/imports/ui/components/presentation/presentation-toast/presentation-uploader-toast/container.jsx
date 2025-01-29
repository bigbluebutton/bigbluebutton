import React, { useEffect, useState } from 'react';
import { PresentationUploaderToast } from './component';

import {
  EXPORTING_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import { useStatePreviousValue } from '/imports/ui/hooks/usePreviousValue';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import checkSamePresentation from './utils';

const PresentationUploaderToastContainer = (props) => {
  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription(
    EXPORTING_PRESENTATIONS_SUBSCRIPTION,
  );
  const presentations = presentationData?.pres_presentation || [];

  const [presentationIdsYetToSee, setPresentationIdsYetToSee] = useState(new Set());
  const previousPresentations = useStatePreviousValue(presentations);

  useEffect(() => {
    const idsYetToSee = presentations.filter(
      (p) => !previousPresentations.some(
        (presentation) => checkSamePresentation(p, presentation),
      ),
    );
    if (idsYetToSee.length > 0) {
      idsYetToSee.forEach((p) => {
        presentationIdsYetToSee.add(p.presentationId);
      });
      setPresentationIdsYetToSee(presentationIdsYetToSee);
    }
  }, [presentationData]);

  const convertingPresentations = presentations.filter(
    (p) => (!p.uploadCompleted || !!p.uploadErrorMsgKey),
  );

  const presentationsToBeShowed = presentations.filter(
    (p) => (presentationIdsYetToSee.has(p.presentationId)),
  );

  if (presentationLoading) return null;
  if (!presentations.length) return null;

  return (
    <PresentationUploaderToast
      {
      ...{
        presentations: presentations.filter((p) => p),
        convertingPresentations,
        setPresentationIdsYetToSee,
        presentationsToBeShowed,
        ...props,
      }
      }
    />
  );
};

export default PresentationUploaderToastContainer;
