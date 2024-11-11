import React from 'react';
import UserPolls from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

interface PollsListItemContainerProps {
  isPresenter: boolean;
}

const PollsListItemContainer = ({ isPresenter }: PollsListItemContainerProps) => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
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
        isPresenter,
      }}
    />
  );
};

export default PollsListItemContainer;
