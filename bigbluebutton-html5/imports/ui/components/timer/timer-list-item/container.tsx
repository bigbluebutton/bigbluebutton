import React from 'react';
import TimerListItem from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useTimer from '/imports/ui/core/hooks/useTImer';
import { Input } from '/imports/ui/components/layout/layoutTypes';

const TimerListItemContainer = () => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const {
    data: timerData,
  } = useTimer();

  if (!timerData) return null;
  const isModerator = currentUserData?.isModerator || false;

  return (
    <TimerListItem
      layoutContextDispatch={layoutContextDispatch} // Spread object error fixed
      sidebarContentPanel={sidebarContentPanel}
      isModerator={isModerator}
    />
  );
};

export default TimerListItemContainer;
