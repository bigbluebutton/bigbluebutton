import React from 'react';
import Button from '/imports/ui/components/common/button/component';
import usePresentationSwap from '../../../core/hooks/usePresentationSwap';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '../../whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const SwapPresentationButton = () => {
  const [showScreenShare, swapPresentation] = usePresentationSwap();

  const { data: presentationPageData } = useDeduplicatedSubscription<CurrentPresentationPagesSubscriptionResponse>(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    presenter: u.presenter,
  }));

  if (!currentMeeting) return null;
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const hasScreenshare = currentMeeting.componentsFlags?.hasScreenshare;
  if (!hasScreenshare || !currentPresentationPage || !currentUser?.presenter) return null;
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
