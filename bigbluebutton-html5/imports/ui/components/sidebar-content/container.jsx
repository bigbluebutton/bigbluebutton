import React from 'react';
import SidebarContent from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';

import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';

const SidebarContentContainer = (props) => {
  const { isSharedNotesPinned } = props;
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContentInput;
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
  }));
  const amIPresenter = currentUserData?.presenter;
  const amIModerator = currentUserData?.isModerator;

  const { data: presentationPageData } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};

  const currentSlideId = presentationPage?.pageId;

  if (sidebarContentOutput.display === false) return null;

  return (
    <SidebarContent
      {...sidebarContentOutput}
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      amIPresenter={amIPresenter}
      amIModerator={amIModerator}
      currentSlideId={currentSlideId}
      isSharedNotesPinned={isSharedNotesPinned}
    />
  );
};

export default SidebarContentContainer;
