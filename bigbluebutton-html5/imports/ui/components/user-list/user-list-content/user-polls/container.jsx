import React from 'react';
import UserPolls from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const UserPollsContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const pollIsOpen = useStorageKey('isPollOpen') || false;
  const forcePollOpen = useStorageKey('forcePollOpen') || false;

  return (
    <UserPolls
      {...{
        sidebarContentPanel,
        layoutContextDispatch,
        pollIsOpen,
        forcePollOpen,
        ...props,
      }}
    />
  );
};

export default UserPollsContainer;
