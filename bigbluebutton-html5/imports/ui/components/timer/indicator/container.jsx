import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Indicator from './component';
import TimerService from '/imports/ui/components/timer/service';

const IndicatorContainer = (props) => {
  return (<Indicator {...props} />);
};

export default withTracker(() => ({
  timer: TimerService.getTimer(),
  timeOffset: TimerService.getTimeOffset(),
  isModerator: TimerService.isModerator(),
  isTimerActive: TimerService.isActive(),
  isMusicActive: TimerService.isMusicActive(),
  hidden: Session.get('openPanel') !== '',
}))(IndicatorContainer);
