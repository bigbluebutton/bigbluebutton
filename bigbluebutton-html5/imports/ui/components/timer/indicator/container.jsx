import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Indicator from './component';
import TimerService from '/imports/ui/components/timer/service';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import TimerIndicatorContainer from '../timer-graphql/indicator/component';

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

withTracker(() => ({
  timer: TimerService.getTimer(),
  timeOffset: TimerService.getTimeOffset(),
  isModerator: TimerService.isModerator(),
  isTimerActive: TimerService.isActive(),
  isMusicActive: TimerService.isMusicActive(),
  currentTrack: TimerService.getCurrentTrack(),
}))(IndicatorContainer);

export default TimerIndicatorContainer;
