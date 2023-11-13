import React from 'react';
import WaitingUsers from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import GuestPanelOpenerContainer from '../../user-list-graphql/user-participants-title/guest-panel-opener/component';

const WaitingUsersContainer = ({ pendingUsers }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContent;

  return (
    <WaitingUsers
      {...{
        pendingUsers,
        sidebarContentPanel,
        layoutContextDispatch,
      }}
    />
  );
};

// export default WaitingUsersContainer;
export default GuestPanelOpenerContainer;
