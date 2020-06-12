import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TimerService from '/imports/ui/components/timer/service';
import Timer from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';

const TimerContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  return <Timer {...{ layoutContextDispatch, sidebarContentPanel, ...props }} />;
};

export default withTracker(() => ({
  timer: TimerService.getTimer(),
  timeOffset: TimerService.getTimeOffset(),
  isModerator: TimerService.isModerator(),
}))(TimerContainer);
