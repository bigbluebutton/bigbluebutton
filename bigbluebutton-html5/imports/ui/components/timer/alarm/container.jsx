import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TimerService from '/imports/ui/components/timer/service';
import TimerAlarm from './component';

const timerAlarmContainer = props => <TimerAlarm {...props} />;

export default withTracker(() => ({
  timer: TimerService.getTimer(),
  timeOffset: TimerService.getTimeOffset(),
}))(timerAlarmContainer);
