import React, { useContext } from 'react';
import SidebarContent from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import { useSubscription } from '@apollo/client';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';

const SidebarContentContainer = () => {
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContentInput;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};

  const currentSlideId = presentationPage?.pageId;

  return (
    <SidebarContent
      {...sidebarContentOutput}
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      amIPresenter={amIPresenter}
      currentSlideId={currentSlideId}
    />
  );
};

export default SidebarContentContainer;
