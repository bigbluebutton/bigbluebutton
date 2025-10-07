import { useCallback } from 'react';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
import { useMutation } from '@apollo/client';
import { PRESENTATION_SET_FIT_TO_WIDTH } from '../mutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const usePresentationFitToWidth = (): [boolean, (fitToWidth: boolean) => void] => {
  const { data: currentUser } = useCurrentUser((u) => ({
    presenter: u.presenter,
  }));
  const { data: currentPageInfo } = useDeduplicatedSubscription<CurrentPresentationPagesSubscriptionResponse>(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
    { skip: !currentUser?.presenter },
  );

  const {
    pres_page_curr = [],
  } = currentPageInfo || {};
  const {
    pageId = '',
    fitToWidth = false,
  } = pres_page_curr[0] || {};

  const [setPresentationFitToWidth] = useMutation(PRESENTATION_SET_FIT_TO_WIDTH);
  const handleSetPresentationFitToWidth = useCallback((fitToWidth: boolean) => {
    setPresentationFitToWidth({ variables: { pageId, fitToWidth } });
  }, [setPresentationFitToWidth]);

  return [fitToWidth, handleSetPresentationFitToWidth];
};

export default usePresentationFitToWidth;
