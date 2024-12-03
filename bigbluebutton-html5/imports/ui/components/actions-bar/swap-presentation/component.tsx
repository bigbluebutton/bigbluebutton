import React from 'react';
import Button from '/imports/ui/components/common/button/component';
import usePresentationSwap from '../../../core/local-states/usePresentationSwap';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION } from '../../whiteboard/queries';

const SwapPresentationButton = () => {
  const [showScreenShare, swapPresentation] = usePresentationSwap();

  const { data: presentationPageData } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  if (!currentMeeting) return null;
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const hasScreenshare = currentMeeting.componentsFlags?.hasScreenshare;
  if (!hasScreenshare || !currentPresentationPage) return null;
  return (
    <Button
      onClick={() => {
        swapPresentation(!showScreenShare);
      }}
      icon={!showScreenShare ? 'presentation' : 'desktop'}
      label={!showScreenShare ? 'Swap to screenshare' : 'Swap to presentation'}
      hideLabel
      circle
      size="lg"
    />
  );
};

export default SwapPresentationButton;
