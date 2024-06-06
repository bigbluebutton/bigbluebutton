import React from 'react';
import Timer from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useTimer from '/imports/ui/core/hooks/useTImer';

const TimerContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const {
    data: timerData,
  } = useTimer();

  if (!timerData) return null;
  const { stopwatch } = timerData;
  const isModerator = currentUserData?.isModerator;

  return (
    <Timer {
    ...{
      layoutContextDispatch,
      stopwatch,
      sidebarContentPanel,
      isModerator,
      ...props,
    }
    }
    />
  );
};

export default TimerContainer;
