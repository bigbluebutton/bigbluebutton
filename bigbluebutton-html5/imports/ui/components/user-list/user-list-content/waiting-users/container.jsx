import React from 'react';
import WaitingUsers from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';

const WaitingUsersContainer = ({ pendingUsers, compact }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContent;

  return (
    <WaitingUsers
      {...{
        pendingUsers,
        sidebarContentPanel,
        layoutContextDispatch,
        compact,
      }}
    />
  );
};

export default WaitingUsersContainer;
