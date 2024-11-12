import React from 'react';
import UserPolls from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { User } from '/imports/ui/Types/user';

const PollsListItemContainer = () => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => (
    {
      presenter: u.presenter,
    }
  ));
  const pollIsOpen = useStorageKey('isPollOpen') || false;
  const forcePollOpen = useStorageKey('forcePollOpen') || false;
  const isPresenter = currentUser?.presenter || false;

  return (
    <UserPolls
      {...{
        sidebarContentPanel,
        layoutContextDispatch,
        pollIsOpen,
        forcePollOpen,
        isPresenter,
      }}
    />
  );
};

export default PollsListItemContainer;
