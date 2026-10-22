import React from 'react';
import Button from '/imports/ui/components/common/button/component';
import usePresentationSwap from '../../../core/hooks/usePresentationSwap';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CurrentPresentationPageSubscriptionResponse,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import deviceInfo from '/imports/utils/deviceInfo';
import { useBarPriorityEntries } from '/imports/ui/core/hooks/useBarPriorityEntries';

const SwapPresentationButton = () => {
  const [showScreenShare, swapPresentation] = usePresentationSwap();

  const { data: presentationPageData } = useDeduplicatedSubscription<
    CurrentPresentationPageSubscriptionResponse
  >(
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

  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const hasScreenshare = currentMeeting?.componentsFlags?.hasScreenshare ?? false;
  const shouldRender = !!currentMeeting && hasScreenshare && !!currentPresentationPage
    && !!currentUser?.presenter;
  const icon = !showScreenShare ? 'presentation' : 'desktop';
  const label = !showScreenShare ? 'Swap to screenshare' : 'Swap to presentation';
  const swap = () => swapPresentation(!showScreenShare);

  useBarPriorityEntries('actionsBar', 'swapPresentation', shouldRender ? [{
    key: 'swapPresentation',
    label,
    icon,
    onClick: swap,
    dataTest: 'swapPresentationOption',
  }] : []);

  if (!shouldRender) return null;
  return (
    <Button
      onClick={swap}
      icon={icon}
      label={label}
      hideLabel
      circle
      size={deviceInfo.isMobile ? 'md' : 'lg'}
      hoverColor={listItemBgHover}
    />
  );
};

export default SwapPresentationButton;
