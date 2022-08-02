import React, { useContext } from 'react';
import SidebarContent from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';

const SidebarContentContainer = () => {
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContentInput;

  if (sidebarContentOutput.display === false) return null;

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  return (
    <SidebarContent
      {...sidebarContentOutput}
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      amIPresenter={amIPresenter}
    />
  );
};

export default SidebarContentContainer;
