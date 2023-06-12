import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Indicator from './component';
import TimerService from '/imports/ui/components/timer/service';
import { layoutSelectInput } from '/imports/ui/components/layout/context';

const IndicatorContainer = (props) => {
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  return (
    <Indicator
      {...{
        sidebarNavigationIsOpen,
        sidebarContentIsOpen,
        ...props,
      }}
    />
  );
};

export default withTracker(() => ({
  timer: TimerService.getTimer(),
  timeOffset: TimerService.getTimeOffset(),
  isModerator: TimerService.isModerator(),
  isTimerActive: TimerService.isActive(),
  isMusicActive: TimerService.isMusicActive(),
  currentTrack: TimerService.getCurrentTrack(),
}))(IndicatorContainer);
